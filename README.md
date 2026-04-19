# Sentinel

<p align="center">
  <img src="./header.svg" alt="Sentinel: AI-powered revenue intelligence for sales and pipeline risk" width="920" />
</p>

**AI-powered revenue intelligence for sales and revenue teams.** Early warning for pipeline risk - predictions, recommendations, and real-time visibility so you never lose a deal to silent decay.

**Live demo:** [https://www.sentinels.in/](https://www.sentinels.in/) · [API Reference](https://www.sentinels.in/api-docs) · [Documentation](https://www.sentinels.in/docs) · **[Try this first →](TRY_THIS.md)** (2-minute walkthrough)

**Tech stack:** Next.js, TypeScript, PostgreSQL, Prisma, Clerk, OpenRouter (AI), Upstash Redis, Sentry.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![Upstash Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis)](https://upstash.com/)
[![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=flat-square&logo=sentry)](https://sentry.io/)

---

## Production engineering for founders and reviewers

Evidence-based summary of how the system is built and operated—maps to code paths and tests, not roadmap claims.

### Security model (hardened)

- **Auth boundary**: Only explicitly listed public routes bypass Clerk in `src/middleware.ts` (no Referer / RSC / prefetch bypass tricks).
- **Cron**: `src/lib/cron-auth.ts` enforces fail-closed `Authorization: Bearer <CRON_SECRET>` on `src/app/api/cron/*`; missing or blank secret rejects; no query-string secret fallbacks.
- **Integration secrets at rest**: `src/lib/integration-secrets.ts` (AES-256-GCM); write paths encrypt; read paths decrypt; existing plaintext DB values still work until rotated.
- **HTTP hardening**: CSP and related headers in `next.config.ts` (production reduces risky `script-src` allowances vs dev where tooling needs them).

### Reliability & fallback

- **Redis optional**: Cache, rate limits, queues, and realtime publish paths degrade when Upstash is unset; the app avoids hard-failing for missing Redis (see `src/lib/redis.ts` and callers).
- **Upstream calls**: CRM and calendar clients use timeouts plus retry/circuit-breaker stacks (`src/lib/reliable-fetch.ts`, `retry.ts`, `circuit-breaker.ts`).
- **AI**: `src/lib/ai-router.ts` uses model fallbacks and per-model circuit isolation; `src/lib/retry.ts` avoids hammering an open circuit.
- **Cron sync**: `src/app/api/cron/sync-integrations/route.ts` runs providers with bounded concurrency and structured completion logs/metrics.
- **Realtime**: `src/lib/realtime.ts` stores events in a bounded Redis list with monotonic IDs; `src/app/api/events/route.ts` streams SSE with heartbeats and cursor resume (`lastEventId` / `Last-Event-ID`)—**at-least-once oriented** (clients may see duplicates across reconnects; ordering and dedupe are handled in consumption paths).

### Vercel Hobby cron playbook

1. **Once per day on Vercel (Hobby)** — schedule `GET /api/cron/sync-integrations` (example: `vercel.crons.example.json` → copy into `vercel.json`). Hobby allows only one daily cron with hourly precision; use that slot for lowest-risk batch sync.
2. **More frequent runs** — use an external scheduler (e.g. cron-job.org) calling the same routes with `Authorization: Bearer <CRON_SECRET>`.
3. **Idempotency** — assume retries and overlapping runs; sync logic upserts by external IDs where possible; avoid irreversible side effects without guards.

Full env and curl patterns: **[DEPLOYMENT.md — Vercel Hobby cron playbook](DEPLOYMENT.md#vercel-hobby-cron-playbook)**.

### How to evaluate this repo (employer checklist)

- **Architecture**: Next.js App Router; domain layout `src/app/actions`, `src/app/api`, `src/lib`; PostgreSQL + Prisma; Clerk for identity.
- **Quality gate**: `npm run verify` (typecheck → ESLint → `vitest run`); `npm run verify:ci` is the same script chain. Optional **manual-only** GitHub workflow runs that gate—see [CONTRIBUTING.md](CONTRIBUTING.md) (including **status checks / red X** if a PR shows unexpected failures from branch protection).
- **Tests**: Targeted Vitest suites under `src/**/__tests__` (e.g. middleware boundary, cron auth, integration crypto, realtime, AI router)—verify behavioral claims against tests, not prose alone.

### Known limits / next if at scale

- Risk scoring runs on deal reads; very large pipelines may need pagination, async precomputation, or read replicas.
- SSE + polling tradeoff for serverless; extreme event rates may need a dedicated queue/bus instead of Redis lists alone.
- CRM sync is bounded and idempotent-friendly but not a full high-throughput ETL; at scale, queue-backed workers and stronger provider isolation become the next step.

More depth: [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md), and [If Running at Scale](#if-running-at-scale) later in this file.

---

## Overview

Revenue teams lose an estimated **$1.3 trillion annually** due to poor pipeline visibility. Deals stall silently: prospects stop replying, meetings slip, proposals go unread. By the time traditional CRMs surface the problem, relationships have cooled and opportunities are lost.

Sentinel adds an **AI intelligence layer** on top of your pipeline. It computes predictive risk scores from temporal decay, stage velocity, and engagement patterns; detects at-risk deals before they fail; and surfaces actionable recommendations. Natural-language queries, webhooks, and team workspaces integrate insights into your existing workflow.

---

## Core Capabilities

---

### Predictive Risk Analysis

- **Temporal decay**: Weighted risk from time since last activity; configurable inactivity thresholds.
- **Stage velocity**: Time-in-stage vs. historical norms; bottlenecks and stalled stages flagged.
- **Engagement scoring**: Human touchpoints (emails, meetings, calls) tracked; drop-off triggers alerts.
- **Competitive signals**: High-value and negotiation-stage deals weighted for priority.
- **Composite risk score**: Single 0-1 score with Low / Medium / High bands and reason strings.

---

### Intelligent AI Assistant

Natural-language queries over your deals and pipeline. Example prompts:

- "Which deals need my attention today?"
- "Tell me about the Acme Corp deal."
- "Why is my pipeline health declining?"
- "Compare my performance this month vs. last month."

The AI router maps query intent to specialized models:

| Query type       | Model                | Use case                          |
| ---------------- | -------------------- | --------------------------------- |
| Semantic search  | OpenAI GPT-4 Turbo   | Find, similar, match, embedding   |
| Financial / deal | Anthropic Claude 3.5 | Pipeline, revenue, risk, forecast |
| Deal-specific    | Anthropic Claude 3.5 | Single-deal detail, follow-ups    |
| Code / SQL       | OpenAI GPT-4o        | Queries, scripts, database        |
| Planning / docs  | Google Gemini Pro    | Strategy, roadmap, multimodal     |
| General          | OpenAI GPT-4 Turbo   | Everything else                   |

---

### Team Collaboration

- **RBAC**: Owner, admin, member, viewer roles; team-scoped deal access.
- **Team workspaces**: Create teams, invite by email, assign deals to members.
- **Activity timeline**: Immutable audit trail per deal; stage changes and events.
- **Real-time notifications**: In-app plus optional email (deal at risk, action overdue, stage change).

---

### CRM & Calendar Integrations

- **Salesforce sync**: Import opportunities as deals with automatic stage mapping.
- **HubSpot sync**: Sync deals and contacts from HubSpot CRM.
- **Google Calendar**: Sync meetings, auto-link to deals, schedule meetings for deals.
- **Slack notifications**: Real-time deal alerts in Slack channels.
- **Auto-sync**: Configurable periodic sync (every 6 hours) or manual trigger.
- **Activity logging**: Complete audit trail of all integration actions.
- **Error handling**: Detailed error messages and retry logic for failed syncs.

---

### Webhooks and Integrations

Configure endpoints to receive JSON payloads on deal and team events. Example payload:

```json
{
  "id": "evt_abc123",
  "event": "deal.stage_changed",
  "timestamp": "2025-01-25T12:00:00Z",
  "data": {
    "id": "clx123",
    "name": "Acme Corp",
    "oldStage": "proposal",
    "newStage": "negotiation",
    "value": 50000
  }
}
```

**Supported events:** `deal.created`, `deal.updated`, `deal.stage_changed`, `deal.at_risk`, `deal.closed_won`, `deal.closed_lost`, `team.member_added`, `team.member_removed`. Slack incoming webhooks supported for deal notifications.

---

### CRM and Calendar Integrations

Sentinel integrates with popular CRM and calendar platforms to sync deals, contacts, and meetings automatically.

#### Salesforce Integration

Sync opportunities and contacts from Salesforce into Sentinel.

**Features:**

- **Bidirectional sync**: Import Salesforce opportunities as deals
- **Stage mapping**: Automatic mapping of Salesforce stages to Sentinel stages
- **Auto-sync**: Configurable periodic sync (every 6 hours via cron)
- **Manual sync**: Trigger sync on-demand from the Settings page
- **Activity logging**: All sync actions are logged for audit trails

**Setup:**

1. Navigate to Settings → Integrations
2. Click "Connect" on the Salesforce card
3. Enter your Salesforce Instance URL (e.g., `https://yourcompany.salesforce.com`)
4. Enter your Salesforce API Key / Access Token
5. Credentials are validated before saving

**Stage Mapping:**

- `Prospecting`, `Qualification`, `Needs Analysis` → `Discovery`
- `Value Proposition`, `Proposal/Price Quote` → `Proposal`
- `Negotiation/Review` → `Negotiation`
- `Closed Won` → `Closed Won`
- `Closed Lost` → `Closed Lost`

**API Endpoints:**

- `POST /api/integrations/salesforce/sync` - Manual sync trigger

#### HubSpot Integration

Import deals and contacts from HubSpot CRM.

**Features:**

- **Deal sync**: Import HubSpot deals with automatic stage mapping
- **Portal detection**: Automatically detects and stores HubSpot Portal ID
- **Pagination support**: Handles large deal lists (up to 500 deals per sync)
- **Auto-sync**: Configurable periodic sync
- **Manual sync**: On-demand sync from Settings

**Setup:**

1. Create a Private App in HubSpot (Settings → Integrations → Private Apps)
2. Generate an Access Token with CRM read permissions
3. In Sentinel Settings → Integrations, click "Connect" on HubSpot
4. Paste your Private App Access Token

**Stage Mapping:**

- `appointmentscheduled`, `qualifiedtobuy` → `Discovery`
- `presentationscheduled`, `decisionmakerboughtin` → `Proposal`
- `contractsent` → `Negotiation`
- `closedwon` → `Closed Won`
- `closedlost` → `Closed Lost`

**API Endpoints:**

- `POST /api/integrations/hubspot/sync` - Manual sync trigger

#### Google Calendar Integration

Sync meetings and calendar events, automatically link them to deals.

**Features:**

- **Event sync**: Import calendar events as meetings (next 30 days)
- **Auto-linking**: Intelligently matches meetings to deals based on:
  - Meeting title containing deal name
  - Attendee email domains matching deal company
  - Meeting description mentioning deal name
- **Meeting management**: Create meetings for deals, link/unlink meetings
- **Dashboard widget**: View upcoming meetings on the dashboard
- **Deal integration**: See meetings directly on deal detail pages

**Setup:**

1. Get a Google Calendar API key from Google Cloud Console
2. Enable Calendar API for your project
3. In Sentinel Settings → Integrations, click "Connect" on Google Calendar
4. Enter your API Key and Calendar ID (use `primary` for main calendar)

**API Endpoints:**

- `POST /api/integrations/google-calendar/sync` - Manual sync trigger
- `GET /api/integrations/google-calendar/events?dealId=xxx` - Get meetings for a deal
- `POST /api/integrations/google-calendar/events` - Create a new meeting

**Sync Behavior:**

- **Deal deduplication**: Deals are matched by `externalId` to prevent duplicates. If a deal with the same `externalId` exists, it's updated; otherwise, a new deal is created.
- **Source tracking**: Synced deals are tagged with `source: "salesforce"` or `source: "hubspot"` and display a badge on the deal page.
- **Stage mapping**: CRM stages are automatically mapped to Sentinel's stage system.
- **Meeting auto-linking**: Google Calendar meetings are automatically linked to deals when:
  - Meeting title contains the deal name
  - Attendee email domains match the deal's company domain
  - Meeting description mentions the deal name
- **Error handling**: Failed syncs are logged with detailed error messages. Check the Recent Activity section in Settings to view sync history.

#### Slack Integration

Receive real-time notifications in Slack channels.

**Features:**

- **Multiple channels**: Connect multiple Slack webhooks
- **Event filtering**: Choose which events to receive (deal at risk, stage changes, etc.)
- **Rich formatting**: Formatted messages with deal details and links
- **Test messages**: Verify webhook configuration before saving

**Setup:**

1. Create a Slack Incoming Webhook (Slack App → Incoming Webhooks)
2. Navigate to Settings → Integrations → Slack
3. Add webhook URL and configure notification preferences

---

### Automatic Sync (Cron Job)

**Endpoint:** `GET /api/cron/sync-integrations` — syncs active Salesforce, HubSpot, and Google Calendar integrations (`syncEnabled: true`), with structured logs/metrics.

**Auth:** `Authorization: Bearer <CRON_SECRET>` only (fail-closed; see `src/lib/cron-auth.ts`). **Hobby vs Pro, external schedulers, idempotency:** see [Production engineering for founders and reviewers](#production-engineering-for-founders-and-reviewers) and **[DEPLOYMENT.md — Vercel Hobby cron playbook](DEPLOYMENT.md#vercel-hobby-cron-playbook)**.

**Manual trigger:**

```bash
curl -X GET "https://your-domain.com/api/cron/sync-integrations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Quick Start: Using Integrations

### Connect Salesforce

1. **Get your Salesforce credentials:**
   - Instance URL: Your Salesforce org URL (e.g., `https://yourcompany.salesforce.com`)
   - API Key: Create a Connected App in Salesforce and generate an access token

2. **Connect in Sentinel:**
   - Go to Settings → Integrations
   - Click "Connect" on the Salesforce card
   - Enter your Instance URL and API Key
   - Click "Connect" (credentials are validated automatically)

3. **Sync deals:**
   - Click "Sync Now" to manually import opportunities
   - Or enable "Auto-sync" for automatic periodic syncing

### Connect HubSpot

1. **Create a Private App:**
   - Go to HubSpot Settings → Integrations → Private Apps
   - Create a new app with CRM read permissions
   - Copy the Access Token

2. **Connect in Sentinel:**
   - Go to Settings → Integrations
   - Click "Connect" on the HubSpot card
   - Paste your Access Token
   - Click "Connect"

3. **Sync deals:**
   - Click "Sync Now" or enable auto-sync

### Connect Google Calendar

1. **Get API credentials:**
   - Go to Google Cloud Console
   - Enable Calendar API
   - Create an API Key (or use OAuth for write access)

2. **Connect in Sentinel:**
   - Go to Settings → Integrations
   - Click "Connect" on the Google Calendar card
   - Enter your API Key and Calendar ID (`primary` for main calendar)
   - Click "Connect"

3. **View meetings:**
   - Meetings automatically sync and appear on deal pages
   - View upcoming meetings on the dashboard
   - Create meetings for deals directly from the deal page

### View Integration Status

All integrations show:

- Connection status (Connected/Not Connected)
- Last sync time and status
- Total items synced
- Recent activity log

---

## Architecture

```
+------------------------------------------------------------------+
|  PRESENTATION                                                     |
|  Next.js 16 · React 19 · Tailwind CSS · Server / Client Components|
+------------------------------------------------------------------+
                                    |
+------------------------------------------------------------------+
|  APPLICATION                                                      |
|  Server Actions · API Routes · Middleware · Clerk Auth            |
+------------------------------------------------------------------+
                                    |
+------------------------------------------------------------------+
|  SERVICES                                                         |
|  +------------------+  +------------------+  +------------------+ |
|  | AI (OpenRouter)  |  | Data Layer       |  | External         | |
|  | Claude, GPT-4o,  |  | PostgreSQL       |  | Redis (Upstash)  | |
|  | Gemini           |  | Prisma ORM       |  | Resend · Slack   | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
```

---

## Data Model

Core models (Prisma):

### Deal Model

```prisma
model Deal {
  id            String         @id @default(cuid())
  userId        String
  teamId        String?
  assignedToId  String?
  name          String
  stage         String
  value         Int
  location      String?
  isDemo        Boolean        @default(false)
  source        String?        // "salesforce", "hubspot", or null
  externalId    String?        // External CRM deal ID
  createdAt     DateTime       @default(now())
  user          User           @relation("CreatedDeals", ...)
  team          Team?          @relation(...)
  assignedTo    User?          @relation("AssignedDeals", ...)
  events        DealEvent[]
  timeline      DealTimeline[]
  notifications Notification[]
  meetings      Meeting[]

  @@index([userId, createdAt])
  @@index([userId, stage])
  @@index([teamId])
  @@index([assignedToId])
  @@index([externalId])
}
```

### Integration Models

```prisma
model SalesforceIntegration {
  id             String    @id @default(cuid())
  userId         String    @unique
  apiKey         String
  instanceUrl    String
  isActive       Boolean   @default(true)
  syncEnabled    Boolean   @default(true)
  lastSyncAt     DateTime?
  lastSyncStatus String?
  syncErrors     String?
  totalSynced    Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(...)
}

model HubSpotIntegration {
  id             String    @id @default(cuid())
  userId         String    @unique
  apiKey         String
  portalId       String?
  isActive       Boolean   @default(true)
  syncEnabled    Boolean   @default(true)
  lastSyncAt     DateTime?
  lastSyncStatus String?
  syncErrors     String?
  totalSynced    Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(...)
}

model GoogleCalendarIntegration {
  id             String    @id @default(cuid())
  userId         String    @unique
  apiKey         String
  calendarId     String
  refreshToken   String?
  isActive       Boolean   @default(true)
  syncEnabled    Boolean   @default(true)
  lastSyncAt     DateTime?
  lastSyncStatus String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(...)
}

model Meeting {
  id          String   @id @default(cuid())
  userId      String
  dealId      String?
  externalId  String?
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  attendees   String[]
  location    String?
  meetingLink String?
  source      String   // "google_calendar", "manual"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(...)
  deal        Deal?    @relation(...)

  @@index([userId])
  @@index([dealId])
  @@index([startTime])
  @@index([externalId])
}

model IntegrationLog {
  id          String   @id @default(cuid())
  userId      String
  integration String   // "salesforce", "hubspot", "google_calendar"
  action      String   // "connect", "disconnect", "sync", etc.
  status      String   // "success", "failed"
  message     String?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([userId, integration])
  @@index([createdAt])
}
```

---

## Technology Decisions

| Component      | Choice             | Rationale                                                           |
| -------------- | ------------------ | ------------------------------------------------------------------- |
| Framework      | Next.js 16         | App Router, RSC, Server Actions, Vercel-ready                       |
| Language       | TypeScript 5       | Type safety, Prisma alignment, editor support                       |
| Database       | PostgreSQL         | ACID, JSON, scaling; Supabase/Railway-friendly                      |
| ORM            | Prisma             | Type-safe queries, migrations, generated client                     |
| Authentication | Clerk              | MFA, sessions, OAuth; minimal backend code                          |
| AI             | OpenRouter         | Multi-model routing; Claude, GPT, Gemini via one API                |
| Queue          | Upstash Redis      | Optional email/webhook queue; rate limit state; serverless-friendly |
| Email          | Resend             | Transactional email; simple API, deliverability                     |
| Monitoring     | Sentry             | Error tracking, performance; optional, fail-safe                    |
| Rate limiting  | Redis + in-app     | Per-user/IP tiers; graceful degradation when Redis null             |
| Testing        | Vitest, Playwright | Unit + E2E; fast feedback, CI integration                           |

---

## Design Philosophy

The system is built around a few core choices.

**Risk scoring over raw metrics.** Pipeline data alone is noisy; stage and value tell you what exists, not what is at risk. We compute a composite risk score from temporal decay, stage velocity, and engagement so the UI can prioritize. The model is deterministic and auditable - no black box. Recommendations (e.g. “schedule a follow-up”) are derived from the same signals so reasoning is traceable.

**PostgreSQL + Prisma, no separate vector store.** Deals, teams, and notifications live in one database. The AI assistant uses the same relational data via structured queries and controlled context, not a separate embedding index. That keeps the stack simple, avoids sync and consistency issues, and fits Vercel/serverless. If we later need semantic search over large corpora, we’d add it explicitly rather than preemptively.

**OpenRouter for multi-model routing.** Different tasks map to different models: summarization and strategy to Gemini, deal and revenue reasoning to Claude, code/SQL to GPT-4o. A single API and key simplifies operations and lets us swap models per route without changing client code. Fallback and rate handling live in one layer.

**Real-time via SSE, not WebSockets.** Notifications and deal updates are pushed over a single GET stream (`/api/events`) with Redis-backed delivery. SSE works with serverless, keeps auth as standard HTTP cookies, and avoids a long-lived WebSocket server. We only need server→client push; bidirectional chat is request/response.

**Server Actions + API routes.** Mutations and auth-heavy flows use Server Actions; external callbacks (webhooks, cron, third-party) use API routes. Clear boundary: internal UI and server logic in actions, external contracts in API. Middleware handles auth so both paths share the same guarantees.

**Clerk for auth.** We don’t store passwords or build session logic. Clerk gives us MFA, OAuth, and session handling so we can focus on domain logic and RBAC (team roles, deal access).

**Redis optional.** Queues (email, real-time events), rate limiting, and caching use Redis when available. Without it, the app still runs: rate limits bypass gracefully, notifications work via API, real-time degrades to polling. Optional infra keeps the default path simple for small deployments.

**Rate limiting and circuit breakers.** API routes use Redis-backed rate limits with per-user and per-IP tiers. External calls (CRM syncs, AI) use retry with backoff and circuit breakers so a failing provider doesn’t cascade. When Redis is null, we skip rate limiting rather than block requests.

**Developer cognition.** The codebase is split by domain (deals, integrations, notifications, real-time) rather than by layer. You open `actions/deals.ts` or `lib/realtime.ts` and see one slice of the system. That reduces context-switching and makes ownership obvious.

---

## Engineering Constraints & Tradeoffs

**Risk score accuracy vs latency.** The risk engine runs on every deal list and detail load. We use a single pass over timeline events and config (inactivity threshold, competitive signals) so responses stay fast. More sophisticated models (e.g. per-deal ML) would require async jobs and caching; we traded that for predictable latency and simplicity.

**AI context vs cost and limits.** The chat endpoint builds context from the current user’s deals and metadata. We cap context size and summarize where needed so we stay within model limits and cost. More context improves answers but increases tokens and latency; we tune the balance per use case.

**Chunk size and retrieval.** When we send deal data to the model, we structure it (e.g. key fields, stage, value, last activity) rather than dumping raw records. That keeps prompts small and reduces hallucination risk. Tradeoff: very detailed, narrative-style answers would need more context and cost.

**Sync frequency vs API limits.** CRM and calendar syncs run on a schedule (e.g. cron every 6 hours) plus manual trigger. Higher frequency would improve freshness but hit provider rate limits and increase failure surface. We log sync state and errors so operators can adjust or retry.

**Real-time vs serverless.** The SSE route polls Redis on an interval and sends heartbeats so the connection stays active within typical function timeouts. True long-lived connections would need a dedicated runtime or edge; for our scale, polling + heartbeat is a deliberate tradeoff for deployment simplicity.

**Database performance.** Deal and notification queries are scoped by `userId` or team; we rely on indexes on `userId`, `teamId`, `dealId`, and `createdAt`. Heavy analytics (e.g. cross-tenant reporting) would need separate read paths or read replicas; the current design optimizes for single-tenant, per-user views.

**API rate limiting.** We enforce Redis-backed rate limits on chat, search, export, and analytics. When Redis is unavailable, limits bypass so the app stays usable. Chat and sync get stricter tiers; analytics gets per-IP limits. Edge or CDN rate limiting remains recommended for abuse protection. We don’t enforce rate limits in-app by default; we assume Vercel or a reverse proxy handles abuse. For stricter control, we’d add a rate-limit layer in front of chat and sync endpoints.

**Model unpredictability.** LLM outputs vary. We treat the AI assistant as an aid, not the source of truth; critical actions (e.g. deal stage changes) stay in the main app with explicit user steps. We avoid letting the model drive irreversible state changes without confirmation.

---

## Run Locally

**Quick start:**

```bash
git clone https://github.com/parbhatkapila4/Sentinel.git
cd Sentinel
npm install
cp .env.example .env.local
```

Edit `.env.local` with required variables (see [Required Environment Variables](#required-environment-variables) below). Then:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

App runs at `http://localhost:3000`.

For full setup (env vars, Docker, Vercel deployment), see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Required Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENROUTER_API_KEY=sk-or-...
```

---

## Optional Environment Variables

```bash
# Queue & Caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron: required to invoke /api/cron/* (Bearer). Missing/blank secret → 503 from cron routes.
CRON_SECRET=your-secret-key-here

# Integration encryption (32-byte key, base64). Required when saving encrypted CRM/Slack webhook values.
# openssl rand -base64 32
INTEGRATION_ENCRYPTION_KEY=

# Analytics (privacy-compliant; fail-safe)
NEXT_PUBLIC_ANALYTICS_ENABLED=true
ANALYTICS_API_KEY=optional-key-for-metrics-summary

# Sentry (optional; see .env.example for full set)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_ENABLE_PERFORMANCE=true
SENTRY_PERFORMANCE_SAMPLE_RATE=0.1

# Rate Limiting (Redis required; defaults apply if unset)
RATE_LIMIT_STRICT=30
RATE_LIMIT_LENIENT=200
```

**Notes:** Integration API keys (Salesforce, HubSpot, Google Calendar) are stored per-user via the Settings UI. **`INTEGRATION_ENCRYPTION_KEY`** encrypts those values at write time (see [.env.example](.env.example)). **`CRON_SECRET`** is only needed if you call `/api/cron/*`.

---

## API Reference

### Authentication

Browser requests use Clerk session cookies automatically. For API clients, send a Bearer token in the `Authorization` header when the route supports it. Some routes (e.g. cron) expect `Authorization: Bearer CRON_SECRET`.

```bash
curl -X GET "https://your-domain.com/api/deals/search?q=Acme" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### Endpoints

#### Deals

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| GET    | `/api/deals`        | List deals (optional `stage`, `limit`) |
| POST   | `/api/deals`        | Create deal                            |
| GET    | `/api/deals/:id`    | Get deal by ID                         |
| PATCH  | `/api/deals/:id`    | Update deal                            |
| GET    | `/api/deals/search` | Search deals (query params)            |
| POST   | `/api/deals/export` | Export deals as CSV/JSON               |

#### AI & Insights

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/insights/chat` | AI chat (body: `{ messages }`) |

#### Notifications

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/notifications`          | List notifications |
| POST   | `/api/notifications/read-all` | Mark all as read   |

#### Authentication

| Method | Endpoint       | Description  |
| ------ | -------------- | ------------ |
| GET    | `/api/auth/me` | Current user |

#### Alerts, Analytics, Metrics

| Method | Endpoint                   | Description                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| GET    | `/api/alerts`              | Deal alerts / at-risk summary                  |
| POST   | `/api/analytics/track`     | Client analytics events (rate-limited; no PII) |
| GET    | `/api/metrics/performance` | Performance metrics                            |
| GET    | `/api/metrics/summary`     | Aggregate business metrics (x-api-key or auth) |

#### Integrations

| Method | Endpoint                                   | Description                                    |
| ------ | ------------------------------------------ | ---------------------------------------------- |
| POST   | `/api/integrations/salesforce/sync`        | Manually sync Salesforce deals                 |
| POST   | `/api/integrations/hubspot/sync`           | Manually sync HubSpot deals                    |
| POST   | `/api/integrations/google-calendar/sync`   | Manually sync Google Calendar events           |
| GET    | `/api/integrations/google-calendar/events` | Get upcoming meetings (optional `?dealId=xxx`) |
| POST   | `/api/integrations/google-calendar/events` | Create a new meeting                           |

#### Cron (Bearer CRON_SECRET)

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/api/cron/sync-integrations` | Auto-sync all integrations     |
| GET    | `/api/cron/process-webhooks`  | Process webhook delivery queue |
| GET    | `/api/cron/process-emails`    | Process email queue            |

#### Testing the deal-at-risk email

To verify that the “deal at risk” email is sent **once** per risk period:

1. **Prerequisites**
   - `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`
   - Redis configured (`UPSTASH_REDIS_*`) so emails can be queued
   - `CRON_SECRET` set (to call the process-emails endpoint)
   - The signed-in user has an **email** stored in the database (same user that owns the deal)

2. **Trigger a deal to become “at risk”**
   - In the app, open a deal and **change its stage** (e.g. to **Negotiation**). Deals are marked at risk when the risk score is High (e.g. no recent activity, or stalled in negotiation).
   - After the stage change, an in-app notification “Deal at Risk: …” should appear, and one email job should be queued (only the first time for that risk period).

3. **Process the email queue**
   - Emails are sent when the cron runs. To test immediately, call the process-emails endpoint with Bearer auth:

   ```bash
   curl -X GET "http://localhost:3000/api/cron/process-emails" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

   - Response example: `{ "processed": 1 }` if one email was sent.

4. **Confirm delivery**
   - **Resend dashboard**: [resend.com/emails](https://resend.com/emails) → check “Sent” for the deal-at-risk subject.
   - **Inbox**: Check the user’s email for “Deal at Risk: &lt;deal name&gt;”.
   - **One-time behaviour**: Change the same deal’s stage again while it stays at risk; you should get another in-app notification but **no second email** until the deal leaves “at risk” and goes at risk again.

#### Other

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/api/deals/bulk`  | Bulk deal operations |
| DELETE | `/api/user/delete` | Delete current user  |

#### Example: Sync Salesforce

```bash
curl -X POST "https://your-domain.com/api/integrations/salesforce/sync" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "success": true,
  "synced": 15,
  "created": 8,
  "updated": 7
}
```

#### Example: Get Meetings for a Deal

```bash
curl -X GET "https://your-domain.com/api/integrations/google-calendar/events?dealId=clx123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "meetings": [
    {
      "id": "meet_abc",
      "title": "Q4 Review with Acme Corp",
      "startTime": "2025-01-30T14:00:00Z",
      "endTime": "2025-01-30T15:00:00Z",
      "attendees": ["john@acme.com", "jane@acme.com"],
      "location": "Conference Room A",
      "meetingLink": "https://meet.google.com/xxx"
    }
  ]
}
```

Full OpenAPI spec and interactive docs: `/api-docs`.

### Webhook signature verification

Verify `X-Webhook-Signature` with HMAC-SHA256:

```javascript
const crypto = require("crypto");
const sig = req.headers["x-webhook-signature"];
const expected = crypto
  .createHmac("sha256", webhookSecret)
  .update(JSON.stringify(payload))
  .digest("hex");
if (sig === expected) {
  // Payload is authentic
}
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── actions/            # Server Actions
│   │   ├── deals.ts       # Deal CRUD operations
│   │   ├── integrations.ts # Unified integration status & logging
│   │   ├── salesforce.ts  # Salesforce connect, sync, settings
│   │   ├── hubspot.ts     # HubSpot connect, sync, settings
│   │   ├── google-calendar.ts # Calendar sync, meetings management
│   │   ├── slack.ts       # Slack webhook integration
│   │   ├── teams.ts       # Team management
│   │   └── webhooks.ts    # Webhook management
│   ├── api/                # REST routes
│   │   ├── deals/         # Deal endpoints
│   │   ├── integrations/  # Integration sync endpoints
│   │   │   ├── salesforce/sync/
│   │   │   ├── hubspot/sync/
│   │   │   └── google-calendar/
│   │   │       ├── sync/
│   │   │       └── events/
│   │   ├── cron/           # Scheduled jobs
│   │   │   └── sync-integrations/ # Auto-sync cron
│   │   ├── insights/      # AI chat endpoint
│   │   └── notifications/ # Notification endpoints
│   ├── dashboard/          # Dashboard page
│   ├── deals/              # Deal list and detail pages
│   ├── settings/           # Settings pages (integrations, team, etc.)
│   └── ...                 # Auth, pricing, docs, static pages
├── components/             # React UI components
│   ├── deal-meetings.tsx  # Meeting management for deals
│   ├── upcoming-meetings-widget.tsx # Dashboard meetings widget
│   ├── dashboard-layout.tsx
│   ├── insights-panel.tsx
│   └── ui/                 # Shared primitives (sidebar, skeleton, etc.)
├── lib/                    # Core logic
│   ├── auth.ts            # Authentication helpers
│   ├── prisma.ts          # DB client singleton
│   ├── redis.ts           # Upstash Redis (optional)
│   ├── dealRisk.ts        # Risk calculation
│   ├── ai-router.ts       # AI model routing
│   ├── ai-context.ts      # AI context building
│   ├── rate-limit.ts      # Redis-backed rate limiter
│   ├── api-rate-limit.ts  # API route rate-limit wrapper
│   ├── cache.ts           # Caching (withCache, invalidate)
│   ├── retry.ts           # Retry with backoff
│   ├── circuit-breaker.ts # Circuit breaker for external calls
│   ├── realtime.ts        # SSE event publish
│   ├── audit-log.ts       # Audit logging
│   ├── salesforce.ts      # Salesforce API client
│   ├── hubspot.ts         # HubSpot API client
│   ├── google-calendar.ts # Google Calendar API client
│   ├── slack.ts           # Slack webhook utilities
│   ├── analytics-client.ts# Client-side analytics
│   ├── business-metrics.ts# Server-side metrics (Redis)
│   └── utils.ts           # Utility functions
├── hooks/                  # React hooks
│   ├── use-realtime.ts    # SSE client for real-time updates
│   └── use-keyboard-shortcuts.ts
├── types/                  # Shared TypeScript types
├── test/                   # Mocks and Vitest setup
└── middleware.ts           # Auth boundary
```

---

## Testing

| Command                 | Description       |
| ----------------------- | ----------------- |
| `npm run test`          | Vitest watch mode |
| `npm run test:run`      | Unit tests (CI)   |
| `npm run test:coverage` | Coverage report   |
| `npm run test:e2e`      | Playwright E2E    |
| `npm run verify`        | Local quality gate (typecheck + lint + unit tests) |
| `npm run verify:ci`     | Same as `verify` (for CI / docs parity)            |

Unit tests live in `src/app/actions/__tests__`, `src/app/api/__tests__`, and `src/lib/__tests__`. E2E specs are in `e2e/` (home, dashboard, deals). Use `src/test/mocks` for auth and Prisma in tests. Run `npx playwright install` before E2E if browsers are not installed.

### Mandatory pre-push quality gate

Before pushing any branch (or opening a PR), run:

```bash
npm run verify
```

This is the default quality gate for the repo: **deterministic, local-first**, and avoids flaky CI red-cross spam.

---

## Deployment

### Vercel

```bash
vercel
```

Set env vars in the Vercel dashboard. Use Vercel Postgres or an external PostgreSQL URL.

### Docker (multi-stage)

Example `Dockerfile`:

```dockerfile
# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Ensure `output: "standalone"` is set in `next.config`. Run Prisma migrations before starting (e.g. init container or CI step).

---

## Security

- **Clerk auth**: Sessions, MFA support; no password storage in-app.
- **RBAC**: Team roles (owner, admin, member, viewer); scope enforced in Server Actions and API.
- **Row-level security**: All deal/list queries filtered by `userId` or team membership.
- **Webhooks**: HMAC-SHA256 signatures; verify `X-Webhook-Signature` before processing.
- **Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy via `next.config`.
- **Input validation**: Zod in `src/lib/env`; validate request bodies in API routes.
- **Rate limiting**: Redis-backed (`src/lib/api-rate-limit.ts`); per-user/IP tiers for chat, export, search. Graceful degradation when Redis unavailable.
- **Request size**: Middleware caps body size (10MB) for POST/PUT/PATCH.
- **Hardening summary**: Cron Bearer fail-closed, integration encryption, explicit middleware public routes—see [Production engineering for founders and reviewers](#production-engineering-for-founders-and-reviewers).

---

## Performance

| Metric     | Target  |
| ---------- | ------- |
| Lighthouse | 98      |
| FCP        | 0.8 s   |
| TTI        | 1.2 s   |
| LCP        | < 1.5 s |
| CLS        | < 0.1   |

- React Server Components and Server Actions to reduce client JS.
- Dynamic imports for heavy UI (e.g. Swagger, charts).
- Prisma query tuning; indexed access on `userId`, `teamId`, `dealId`.
- Optional Redis for queue and caching.
- Image optimization via `next/image` where used.

---

## Production Lessons

| Issue seen in real use | What changed in code | Evidence / measurable outcome |
| --- | --- | --- |
| Intermittent 503 from AI provider under load/transient upstream failures | Added model fallback candidates and per-model circuit-breaker isolation in `src/lib/ai-router.ts`; avoid retrying on open circuits in `src/lib/retry.ts` | `src/lib/__tests__/ai-router-openrouter.test.ts` validates retry/fallback and circuit-open behavior; `npm run verify` passes |
| Cron auth was too permissive (header/query fallbacks) | Added centralized strict Bearer auth in `src/lib/cron-auth.ts`; cron routes now reject missing/invalid auth and missing `CRON_SECRET` | `src/lib/__tests__/cron-auth.test.ts` covers fail-closed behavior; all cron examples now use `Authorization: Bearer <CRON_SECRET>` |
| Middleware auth boundary had spoofable bypass patterns | `src/middleware.ts` now only allows explicit public routes and removes referer/prefetch/RSC trust patterns | `src/__tests__/middleware-auth.test.ts` verifies protected routes cannot be bypassed by spoofable headers |
| Integration secrets were stored as plaintext | Added AES-256-GCM envelope utility in `src/lib/integration-secrets.ts`; integration credentials/webhooks are encrypted before DB write, decrypted at use sites | `src/lib/__tests__/integration-secrets.test.ts` validates round-trip encryption + plaintext backward compatibility |
| Realtime delivery could drop events with read-then-delete semantics | Replaced destructive consume with cursor-based `consumeUserEventsSince` and monotonic IDs in `src/lib/realtime.ts`; SSE sends/resumes using event IDs | `src/lib/__tests__/realtime.test.ts` validates at-least-once cursor semantics |

These changes are implementation-level hardening, not marketing claims. Remaining limits and tradeoffs are listed in this README and `ARCHITECTURE.md`.

---

## If Running at Scale

**Async ingestion.** CRM and calendar syncs are today triggered by cron or manual action. At scale, we’d move to a queue: cron or webhook enqueues a sync job; a worker (or serverless function) runs the sync and updates status. That isolates long-running syncs from request timeouts and allows retries and backpressure.

**Queue-based indexing and notifications.** Real-time events are pushed via Redis list and consumed by the SSE route. At higher volume, we’d consider a proper queue (e.g. Upstash Kafka, SQS) with per-user or per-team channels, dead-letter handling, and at-least-once delivery for critical notifications.

**Caching layers.** Deal lists and risk summaries could be cached per user with short TTLs (e.g. 60s) so repeated navigations don’t hit the DB every time. Cache keys would include `userId` (and `teamId` when relevant). Invalidation would happen on deal/team mutations and optionally on real-time events.

**Shardable storage.** PostgreSQL and Prisma scale with connection pooling and read replicas. If deal volume grew into the millions, we’d consider sharding by `userId` or tenant and routing reads/writes accordingly. Vector search, if added later, would be a separate store with its own scaling story.

**Background workers.** Risk precomputation, heavy analytics, and bulk exports would move to background jobs so the request path stays fast. Same for summarization or embedding if we ever add semantic search.

**Observability and metrics.** We’d add metrics for: sync duration and success rate per integration, AI request latency and token usage, SSE connection count and event delivery latency, and error rates per route. Logs are structured; we’d ship them to a central store and set alerts on sync failures and API errors.

**Cost control.** AI cost is dominated by token usage. We’d cap context size per request, set per-user or per-org limits, and optionally cache frequent queries. Sync and real-time costs are bounded by cron frequency and connection count; we’d monitor and tune those knobs.

**Fault tolerance.** Integrations fail; we already log and surface status. At scale we’d add circuit breakers per provider, automatic backoff on repeated failures, and clear degradation (e.g. “Salesforce sync paused due to errors”). Real-time degrades to polling when Redis or the stream fails; we’d extend that pattern to other optional services.

---

## Impact on Engineering Teams

**Onboarding.** New engineers see a single repo with clear domains: `actions/deals.ts`, `lib/dealRisk.ts`, `app/api/events/route.ts`. Auth, DB, and external services are centralized (Clerk, Prisma, OpenRouter, Redis). A new dev can run the app locally, read one slice (e.g. deals or integrations), and make a small change without touching the whole stack.

**Reduced tribal knowledge.** Risk logic, AI routing, and sync behavior live in code and README, not only in someone’s head. Technology Decisions and Design Philosophy sections explain why we chose PostgreSQL, OpenRouter, SSE, and optional Redis. New joiners can reason about tradeoffs without hunting for design docs.

**Code reviews.** Server Actions and API routes have a clear contract: actions for app-driven mutations, API for webhooks and cron. Reviewers can check auth, scoping (userId/teamId), and error handling in one place. Integration code is isolated (e.g. `salesforce.ts`, `hubspot.ts`), so changes to one provider don’t ripple everywhere.

**Documentation automation.** API routes are documented in the README and exposed via OpenAPI at `/api-docs`. Webhook payloads and env vars are specified in one file. That reduces “how do I call X?” questions and keeps docs close to the code. Real-time updates are delivered via SSE at `/api/events` and the `useRealtime` hook; deal and team actions are recorded in an immutable audit trail.

**Architectural clarity.** The stack diagram and project structure show where presentation, application, and services sit. Real-time, notifications, and deal risk are additive modules with clear entry points. That makes it easier to extend (e.g. a new integration or a new event type) without reworking the core.

---

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System overview, tech stack, directory structure, data flow, caching, security
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Prerequisites, local setup, Vercel deployment, env vars, [cron playbook](DEPLOYMENT.md#vercel-hobby-cron-playbook)
- **[TRY_THIS.md](TRY_THIS.md)** - Short product walkthrough
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to run locally, branch naming, PR checks, code style
- **[docs/API.md](docs/API.md)** - API index and links to full OpenAPI spec

In-app: [API Reference](/api-docs) (OpenAPI/Swagger), [Developer Docs](/docs/developers).

---

## Contributing

We welcome contributions. Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## Support

- Documentation: [docs](https://www.sentinels.in/docs)
- API Reference: [api-docs](https://www.sentinels.in/api-docs)
- Issues: [GitHub Issues](https://github.com/parbhatkapila4/Sentinel/issues)

---

## Acknowledgments

- [Next.js](https://nextjs.org) - The React framework for production
- [Prisma](https://prisma.io) - Next-generation ORM for Node.js
- [Clerk](https://clerk.com) - Authentication and user management
- [OpenRouter](https://openrouter.ai) - Unified API for AI models
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Vercel](https://vercel.com) - Deployment and hosting

---

## Ship checklist

Before production or a major release:

1. **`npm run verify`** — typecheck, ESLint, Vitest (Windows: run as a single command).
2. **Environment** — copy [.env.example](.env.example) → `.env.local` (or Vercel env UI): `DATABASE_URL`, `DIRECT_URL`, Clerk, `OPENROUTER_API_KEY`; add **`CRON_SECRET`** if cron is used; add **`INTEGRATION_ENCRYPTION_KEY`** if integrations encrypt at connect.
3. **Cron** — [Vercel Hobby cron playbook](DEPLOYMENT.md#vercel-hobby-cron-playbook): Hobby = one daily Vercel cron + Bearer; higher frequency = external scheduler with the same header.
4. **Optional CI** — [CONTRIBUTING.md](CONTRIBUTING.md): Actions → **Verify (manual)** (`workflow_dispatch` only).
5. **Demo** — [https://www.sentinels.in/](https://www.sentinels.in/) · [TRY_THIS.md](TRY_THIS.md) for a 2-minute walkthrough.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <br />
  <p>
    <sub>
      Built with precision by <a href="https://github.com/parbhatkapila4"><strong>Parbhat Kapila</strong></a>
    </sub>
  </p>
  <p>
    <a href="https://twitter.com/parbhatkapila4">Twitter</a>
    ·
    <a href="https://linkedin.com/in/parbhat-kapila">LinkedIn</a>
    ·
    <a href="https://github.com/parbhatkapila4">GitHub</a>
  </p>
  <br />
  <p>
    <sub>If Sentinel helped you, consider giving it a star.</sub>
  </p>
  <p>
    <a href="https://github.com/parbhatkapila4/Sentinel">
      <img src="https://img.shields.io/github/stars/parbhatkapila4/Sentinel?style=social" alt="Star on GitHub" />
    </a>
  </p>
</div>
