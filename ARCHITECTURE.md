# Sentinel Architecture

High-level system overview for the Sentinel revenue intelligence platform.

## System Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────────────────────┐
│   Frontend  │────▶│  Next.js    │───▶│  Services & Data                 │
│  (React 19) │     │  App Router │     │  Prisma → PostgreSQL             │
│             │     │  API Routes │     │  Clerk (auth)                    │
│             │     │  Actions    │     │  Redis (cache, rate limit)       │
└─────────────┘     └─────────────┘     │  OpenRouter (AI)                 │
                                        │  Sentry (monitoring)             │
                                        └──────────────────────────────────┘
```

- **Frontend**: React 19, Tailwind, Framer Motion; pages under `src/app/` (dashboard, deals, analytics, settings).
- **API layer**: Next.js 16 App Router - Route Handlers under `src/app/api/`, Server Actions under `src/app/actions/`.
- **Core logic**: `src/lib/` - auth, deal risk, AI router, cache, integrations, real-time, audit.
- **Data**: Prisma ORM, PostgreSQL; schema and migrations in `prisma/`.

## Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Framework      | Next.js 16, React 19               |
| Language       | TypeScript (strict)                |
| Database       | PostgreSQL, Prisma                 |
| Auth           | Clerk                              |
| Cache / queues | Upstash Redis                      |
| AI             | OpenRouter (GPT-4, Claude, Gemini) |
| Monitoring     | Sentry                             |
| Styling        | Tailwind CSS, MUI (charts)         |

## Directory Structure

| Path              | Purpose                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `src/app/`        | Routes, layouts, API route handlers (`api/`), Server Actions (e.g. `actions/deals.ts`)                   |
| `src/lib/`        | Core logic: `auth.ts`, `dealRisk.ts`, `ai-router.ts`, `cache.ts`, `realtime.ts`, integrations, audit-log |
| `src/components/` | Reusable UI and feature components                                                                       |
| `src/hooks/`      | Client hooks (e.g. `use-realtime.ts`)                                                                    |
| `prisma/`         | Schema (`schema.prisma`), migrations                                                                     |

## Data Flow

- **Auth**: Clerk middleware protects non-public routes; `getAuthenticatedUserId()` in `src/lib/auth.ts` resolves current user and syncs to DB.
- **Deals**: Server Actions and API routes scope by `userId` (and optional `teamId`). Risk is computed in `src/lib/dealRisk.ts` from deal + timeline events.
- **Notifications**: In-app + optional email; triggers in `src/lib/notification-triggers.ts`; API under `src/app/api/notifications/`.
- **Integrations**: Salesforce, HubSpot, Google Calendar, Slack - sync and webhook APIs under `src/app/api/integrations/`; cron at `src/app/api/cron/sync-integrations/`.

## Key Features & Locations

| Feature          | Location                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Risk scoring     | `src/lib/dealRisk.ts` - `calculateDealSignals()`, thresholds in `src/lib/config.ts`                           |
| AI insights      | `src/lib/ai-router.ts` (task routing), `src/app/api/insights/chat/` (chat API)                                |
| Real-time events | `src/hooks/use-realtime.ts` (SSE client), `src/app/api/events/` (SSE stream), `src/lib/realtime.ts` (publish) |
| Caching          | `src/lib/cache.ts` - `getCache`, `setCache`, `withCache` (Redis-backed)                                       |
| Rate limiting    | Upstash Redis used for API rate limits (see `src/lib/api-rate-limit.ts` or similar)                           |
| Audit logging    | `src/lib/audit-log.ts` - deal and team actions                                                                |

## Caching (Redis)

- **Usage**: Deal lists and risk summaries cached per user with short TTL (e.g. 60s) via `withCache()` in `src/lib/cache.ts`. Keys include `userId` (and `teamId` when relevant).
- **Rate limiting**: Redis used for API rate limit state.
- **Real-time**: When Redis is present, events are stored in a per-user bounded list with monotonic IDs (`src/lib/realtime.ts`); SSE consumers read by cursor (`consumeUserEventsSince`) without destructive pop semantics—see `src/app/api/events/route.ts`.

## Security

- **Authentication boundary**: `src/middleware.ts` allows only explicitly public routes; protected paths do not trust spoofable headers (referer, RSC, prefetch hints).
- **Cron auth (fail-closed)**: `src/lib/cron-auth.ts` enforces `Authorization: Bearer <CRON_SECRET>`; missing secret or invalid token returns an error.
- **Secrets at rest**: Integration credentials are encrypted/decrypted via `src/lib/integration-secrets.ts` (AES-256-GCM envelope format with compatibility for legacy plaintext rows).
- **Headers and CSP**: CSP and security headers are set in `next.config.ts`; risky directives are constrained to development where possible.
- **Rate limiting**: Redis-backed API limits in `src/lib/api-rate-limit.ts`; routes degrade gracefully when Redis is unavailable.
- **Auditability**: Deal and team changes are logged in `src/lib/audit-log.ts`.

## Reliability Model

- **AI resilience**: `src/lib/ai-router.ts` uses model candidates and per-model circuit breaker names so one unhealthy provider/model does not block all AI traffic.
- **Retry semantics**: `src/lib/retry.ts` retries transient upstream failures and skips retries when the circuit is already open.
- **External API timeouts**: `src/lib/reliable-fetch.ts` wraps provider fetches with explicit timeout-based `RetryableError` behavior.
- **Integration sync execution**: `src/app/api/cron/sync-integrations/route.ts` runs provider syncs concurrently with bounded per-provider concurrency.
- **Realtime delivery**: `src/lib/realtime.ts` + `src/app/api/events/route.ts` use monotonic IDs and cursor-based consumption (`lastEventId`) for at-least-once semantics.

## Verification Expectations

- **Local quality gate**: `npm run verify` runs `typecheck`, `lint`, and `test:run`.
- **Critical-path tests**:
  - `src/__tests__/middleware-auth.test.ts`
  - `src/lib/__tests__/cron-auth.test.ts`
  - `src/lib/__tests__/integration-secrets.test.ts`
  - `src/lib/__tests__/ai-router-openrouter.test.ts`
  - `src/lib/__tests__/realtime.test.ts`
- **Review expectation**: behavior claims in docs should map to a test, route handler, or utility in `src/lib` / `src/app/api`.

## Operational Tradeoffs And Known Limits

- **Redis optional mode**: App remains functional without Redis, but rate limiting, caching, queues, and realtime publishing are reduced or bypassed.
- **Integration encryption key**: `INTEGRATION_ENCRYPTION_KEY` must be a base64-encoded 32-byte value to encrypt new integration secrets; missing key fails encrypt paths; legacy plaintext rows still decrypt as plaintext until re-saved.
- **Serverless realtime tradeoff**: SSE is chosen over WebSockets for serverless simplicity; not intended for high-frequency bidirectional messaging.
- **Sync freshness vs provider limits**: More frequent CRM sync improves freshness but increases provider quota pressure and failure surface.
- **LLM variability**: AI routes are guarded for availability, but model outputs remain probabilistic and should not execute irreversible actions automatically.

## Further Reading

- **Setup & usage**: [README](README.md)
- **Quick walkthrough**: [TRY_THIS.md](TRY_THIS.md)
- **API reference**: In-app [API Reference](/api-docs) (OpenAPI/Swagger)
- **Developer docs**: In-app [Developer Docs](/docs/developers)
- **Deployment & cron**: [DEPLOYMENT.md](DEPLOYMENT.md) · [Vercel Hobby cron playbook](DEPLOYMENT.md#vercel-hobby-cron-playbook)
