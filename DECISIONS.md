# Engineering Decisions

This document records the non-obvious architectural choices in Sentinel — what was picked, what was rejected, what trade-off the choice accepts, and where to verify. It exists so a reviewer can map any "why does it work this way?" question to a deliberate decision rather than guessing.

## TL;DR

| Decision | Choice | Trade-off accepted | Code path |
|---|---|---|---|
| Realtime delivery | SSE + Redis cursor | At-least-once + serverless poll cadence | `src/lib/realtime.ts` · `src/app/api/events/route.ts` |
| AI failure isolation | Per-model circuit breakers, model fallback | Lower throughput vs persistent retries | `src/lib/ai-router.ts` · `src/lib/circuit-breaker.ts` |
| Integration secrets at rest | AES-256-GCM envelope, plaintext-fallback decrypt | Migration window for legacy rows | `src/lib/integration-secrets.ts` |
| Auth boundary | Default-deny middleware, explicit public list | Every new route must be whitelisted | `src/middleware.ts` |
| Risk score lifecycle | Recompute on read, never persist | CPU per-request; cheap to evolve the model | `src/lib/dealRisk.ts` · `src/lib/deal-risk-enrichment.ts` |
| Redis dependency | Optional with graceful degrade | Reduced rate-limiting + realtime when absent | `src/lib/redis.ts` and call sites |
| Mutations vs external contracts | Server Actions vs API routes | One indirection per call | `src/app/actions/*` · `src/app/api/*` |
| Cron auth | Fail-closed Bearer-only, no query-string fallback | Operator must wire the secret correctly first time | `src/lib/cron-auth.ts` |
| Marketing claim discipline | `PRODUCT_CLAIMS.md` + drift tests | Copy changes need a registry update | `PRODUCT_CLAIMS.md` · `src/__tests__/claim-drift.test.ts` |

---

## 1. Realtime: SSE with a Redis cursor instead of WebSockets

**What.** `/api/events` streams Server-Sent Events. Publishers append to a bounded per-user Redis list with monotonic IDs (`src/lib/realtime.ts`). Consumers send `Last-Event-ID` on reconnect and read forward via a cursor (`consumeUserEventsSince`) — never destructive pop.

**Why not WebSockets.** WS demands a long-lived bidirectional runtime. Vercel's serverless model and our auth model (Clerk session cookies on standard HTTP) work cleanly with SSE; WS would force a separate runtime, an auth bridge, and reconnection plumbing we don't need. We push only server → client; chat is request/response.

**Why a cursor, not destructive consume.** The original design popped events on read. A reconnecting client could lose any frame published mid-disconnect. Switching to monotonic IDs + cursor reads gives at-least-once semantics — clients dedupe by ID. The cost is a slightly larger Redis footprint (events live until trimmed) and the responsibility on the consumer to handle duplicates.

**Trade-off accepted.** At-least-once means consumers must dedupe. SSE on serverless means we poll Redis on a small interval inside the stream loop, with heartbeats — not true push from Redis. That's fine for the event volume we serve.

**Verify.** `src/lib/__tests__/realtime.test.ts` covers cursor semantics, dedupe, and Last-Event-ID resume.

---

## 2. AI router: per-model circuit isolation, not per-provider

**What.** `src/lib/ai-router.ts` maps query intent → primary model → fallback list. Each model has its own named circuit (`circuit-breaker.ts`). When OpenRouter starts returning 5xx for one model, that breaker opens; routing falls through to the next candidate. `src/lib/retry.ts` short-circuits on open breakers so we don't waste retries.

**Why per-model rather than per-provider.** OpenRouter is the provider. Inside it, individual models fail independently — Anthropic Claude can be flaky while OpenAI GPT-4o is fine. A per-provider breaker would punish every model when one is bad. Per-model isolation keeps healthy models serving traffic during partial outages.

**Why fallback rather than retry on the same model.** Persistent retries against a bad model amplify the outage. Fallback degrades gracefully: a financial-intent query might switch from Claude to GPT-4o; quality varies but the response arrives.

**Trade-off accepted.** Fallbacks are best-effort by design — answer quality can shift mid-degradation. Cost can briefly increase if the fallback model is more expensive. Both are tracked via metrics (`src/lib/business-metrics.ts`).

**Verify.** `src/lib/__tests__/ai-router-openrouter.test.ts` validates fallback ordering and "no retry on open breaker."

---

## 3. Integration secrets: AES-256-GCM envelope with plaintext-fallback decrypt

**What.** Salesforce keys, HubSpot tokens, Google Calendar API keys, Slack webhooks, Gmail/Gong refresh tokens are encrypted in Postgres. `INTEGRATION_ENCRYPTION_KEY` (base64-encoded 32 bytes) keys an AES-256-GCM cipher. Write paths always encrypt; read paths attempt decrypt and fall back to plaintext for legacy rows that pre-date encryption.

**Why GCM specifically.** Authenticated encryption — same primitive AWS KMS, GCP, and most password managers use. The 12-byte nonce + 16-byte auth tag let us detect tampering and ciphertext substitution. A non-AEAD cipher (AES-CBC) would have required a separate HMAC step we'd have to remember on every read.

**Why a plaintext-fallback path on read.** When the feature shipped, the DB already held plaintext credentials. A "rip and replace" approach needed coordinated downtime. The fallback decoder lets old rows keep working while new writes encrypt; rows are migrated as users re-save credentials. Lower-risk, zero-downtime.

**Trade-off accepted.** The plaintext fallback path is dead code only after every legacy row is rotated — until then, a misconfigured prod could silently keep storing plaintext if `INTEGRATION_ENCRYPTION_KEY` is missing on writes. A future PR should hard-error when the env var is unset (currently it warns).

**Verify.** `src/lib/__tests__/integration-secrets.test.ts` covers round-trip encryption, plaintext-fallback decryption, and tag-mismatch rejection.

---

## 4. Auth boundary: default-deny middleware, explicit public list

**What.** `src/middleware.ts` runs Clerk on every request *except* a small list of explicitly enumerated public routes (sign-in, marketing pages, OAuth callbacks, cron, webhooks). Everything else 302s to sign-in if no Clerk session is present.

**Why default-deny rather than per-route guards.** Per-route guards forget. The next contributor adds `/admin/secret-thing` as a Server Component, doesn't know to add an auth check, and ships a leak. A default-deny middleware makes leaks visible at PR review time — anyone adding a public route has to edit one specific list, and reviewers know to question that diff.

**Why no Referer / RSC / prefetch trust.** Earlier prototypes had heuristics like "trust prefetch requests because they come from the app." Those were spoofable — a pre-warmed `<link rel="prefetch">` from a malicious page would bypass auth. The current matcher checks none of those headers. The only trust signal is a valid Clerk session.

**Trade-off accepted.** Public marketing pages must be enumerated. The matcher is a regex list at the top of `middleware.ts`; new public routes are a one-line edit, but it's still an explicit ceremony.

**Verify.** `src/__tests__/middleware-auth.test.ts` proves protected routes 302 even with spoofed Referer/RSC/prefetch headers.

---

## 5. Risk lifecycle: recompute on read, never persist

**What.** A deal's risk score and reasons are computed every time `getAllDeals` or `getDealById` runs (`src/lib/deal-risk-enrichment.ts` orchestrates the pass; `src/lib/dealRisk.ts` is the math). The DB stores raw signals — timeline events, stage, value, last activity — and nothing derived.

**Why recompute on read.** The risk model evolves. If we'd persisted last week's scores, every model change would need a backfill job and we'd be fighting drift between "old score in DB" and "new model output." Recomputing on read makes the model a pure function of raw data. Tomorrow's tuning is a code deploy, not a data migration.

**Why this is cheap enough.** A single Postgres round-trip pulls deal + timeline events; the risk math is a synchronous pass over a small array. For pipelines under ~10k active deals (the operator-tier target), the cost is invisible. At higher scale we'd add a precompute layer with TTL caching keyed on `dealId + last_activity_at` — but only when measured to matter.

**Trade-off accepted.** Heavy reporting (cross-tenant analytics, year-over-year comparisons) would not run at this latency profile. Those queries get their own pre-aggregated views in the analytics path, not the live risk endpoint.

**Verify.** `src/lib/__tests__/dealRisk.test.ts` exercises the math; `assertRiskFieldIntegrity` (in `src/lib/deal-risk-enrichment.ts`) is a dev-only tripwire that warns if persisted risk fields ever leak into the schema.

---

## 6. Redis is optional

**What.** Cache (`src/lib/cache.ts`), rate limits (`src/lib/api-rate-limit.ts`), realtime publish (`src/lib/realtime.ts`), email queue (`src/lib/notifications.ts`), and business metrics (`src/lib/business-metrics.ts`) all check `redis === null` and degrade rather than throw.

**Why optional.** A solo developer cloning the repo for evaluation should not have to provision Upstash to see the app run. The default path gives them a working app on a single Postgres URL plus Clerk keys. Redis becomes a measurable improvement (rate limits, faster realtime) — not a blocker.

**Why the degraded paths are explicit, not implicit.** Each call site has a `if (!redis) return null;` (or equivalent) early return with a comment explaining what's lost. The senior anti-pattern would be silent retry-loops or fallback timers that pretend Redis is there. Explicit nulls keep the degradation legible.

**Trade-off accepted.** A naive operator might run production without Redis and assume rate limits are working. Sentry alerts and the README are both explicit — but it's worth knowing that "the app runs without Redis" is a soft promise, not a security one.

**Verify.** Each file has a `// Redis optional —` comment block at the top of the affected functions; the test suite runs against a null Redis client to ensure the degraded path doesn't regress.

---

## 7. Server Actions for mutations, API routes for external contracts

**What.** Internal UI flows (creating a deal, updating settings, inviting a teammate) use Next.js Server Actions in `src/app/actions/`. External contracts — webhook receivers, cron, OAuth callbacks, public REST API — live as Route Handlers in `src/app/api/`.

**Why split.** Two different concerns. Server Actions are an internal ABI between *this* app's UI and *this* app's server code; types flow through automatically and the surface is invisible to callers. API routes are a *public* HTTP contract — versioned, documented (`src/lib/openapi.ts`), CSRF-relevant, breaking changes matter.

Mixing them means either:
- (a) Every internal mutation pays the cost of being a public-API-grade endpoint (versioning, documentation, deprecation), or
- (b) Every external integration goes through Server Actions, which Next does not officially expose to non-app callers.

The split lets each path optimize for its job: Actions are zero-ceremony; API routes get the OpenAPI spec, rate limits, and explicit shape contracts.

**Trade-off accepted.** A deal create from the UI runs through `actions/deals.ts`; the public `POST /api/deals` runs through `api/deals/route.ts`. They share underlying logic but have separate entry points. Some duplication of input parsing and authorization wrapping is the cost.

**Verify.** Read any `src/app/actions/*.ts` next to its sibling in `src/app/api/*` — both call into shared `src/lib/` utilities; the difference is the auth/request shape.

---

## 8. Cron: fail-closed Bearer auth, no query-string secrets

**What.** `src/lib/cron-auth.ts` rejects any request without `Authorization: Bearer <CRON_SECRET>`. Missing secret in env → 503. Wrong token → 401. No header, no `?secret=…` fallback, no IP allowlist.

**Why no query-string secrets.** Query strings end up in browser history, server access logs, CDN logs, and Sentry breadcrumbs. A secret in the URL is effectively public the moment a misconfigured proxy logs it. Header-only auth is the same security model every cloud cron service uses (Vercel Cron, Cloud Scheduler, GitHub Actions schedule).

**Why fail-closed when env is missing.** A common deployment mistake is forgetting `CRON_SECRET` in production env. If we defaulted to "allow all" when the secret was unset, a public endpoint could trigger expensive sync work or DB writes. Returning 503 forces the operator to set the secret before cron runs at all.

**Trade-off accepted.** First-time setup needs the secret on day one. The error message points to `DEPLOYMENT.md`.

**Verify.** `src/lib/__tests__/cron-auth.test.ts` — every reject mode (missing header, malformed Bearer, wrong token, missing env) is covered.

---

## 9. Marketing-claim discipline: a registry + drift tests

**What.** `PRODUCT_CLAIMS.md` is a JSON-fronted registry of every public-facing claim — "we read calls, emails, and Slack threads," "Starter is $0/month," "SOC 2 Type II is on the roadmap, not certified today." Each claim has a `status` (`implemented`, `planned`, `explicitly_not_supported`) and `evidence_paths`. `src/__tests__/claim-drift.test.ts` reads marketing pages and fails the build if a banned phrase appears (`"SOC 2 certified"` while the registry says `planned`) or if any UI page contradicts the registry.

**Why this exists.** Marketing copy and product code drift in opposite directions. Sales pages get optimistic faster than features ship; engineering changes ship faster than copy gets updated. A registry forces both sides to negotiate: changing the claim is a deliberate edit, not a side effect.

**Why this isn't over-engineering.** It's 80 lines of test code and one markdown file. The cost of one customer noticing a "SOC 2 certified" claim in the footer when we're not certified is much higher than the cost of running the drift test.

**Trade-off accepted.** New marketing copy needs a registry update. Reviewers must remember to add evidence paths. Both are acceptable taxes; the alternative is shipping false claims and dealing with them later.

**Verify.** `src/__tests__/claim-drift.test.ts` runs on every `npm run verify`; failure mode is loud and specific (file + line).

---

## What's deliberately *not* here

These are choices we've considered and explicitly rejected, with rationale:

- **WebSockets for realtime** — see #1.
- **A vector store / RAG layer for the AI** — current scale doesn't need it; structured Prisma queries + small contexts beat embedding overhead. We'd revisit when corpus size makes deal-by-deal context insufficient.
- **A queue (SQS, Upstash Q) for sync jobs** — the cron + bounded-concurrency pattern works for current volume. We'd add a queue when sync runtimes exceed serverless limits or when we need automatic retries with dead-letter handling.
- **Per-tenant sharding** — single-tenant-per-userId queries with proper indexes serve us today. Sharding adds operational complexity that current scale doesn't justify.
- **Live SOC 2** — see `PRODUCT_CLAIMS.md`. On the 2026 roadmap, not claimed today.

Each of these has a trigger condition documented in the README's "If Running at Scale" section. Adding any of them prematurely would be over-engineering; ignoring them at the right time would be under-engineering.
