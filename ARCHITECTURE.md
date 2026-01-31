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
- **API layer**: Next.js 16 App Router — Route Handlers under `src/app/api/`, Server Actions under `src/app/actions/`.
- **Core logic**: `src/lib/` — auth, deal risk, AI router, cache, integrations, real-time, audit.
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
- **Integrations**: Salesforce, HubSpot, Google Calendar, Slack — sync and webhook APIs under `src/app/api/integrations/`; cron at `src/app/api/cron/sync-integrations/`.

## Key Features & Locations

| Feature          | Location                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Risk scoring     | `src/lib/dealRisk.ts` — `calculateDealSignals()`, thresholds in `src/lib/config.ts`                           |
| AI insights      | `src/lib/ai-router.ts` (task routing), `src/app/api/insights/chat/` (chat API)                                |
| Real-time events | `src/hooks/use-realtime.ts` (SSE client), `src/app/api/events/` (SSE stream), `src/lib/realtime.ts` (publish) |
| Caching          | `src/lib/cache.ts` — `getCache`, `setCache`, `withCache` (Redis-backed)                                       |
| Rate limiting    | Upstash Redis used for API rate limits (see `src/lib/api-rate-limit.ts` or similar)                           |
| Audit logging    | `src/lib/audit-log.ts` — deal and team actions                                                                |

## Caching (Redis)

- **Usage**: Deal lists and risk summaries cached per user with short TTL (e.g. 60s) via `withCache()` in `src/lib/cache.ts`. Keys include `userId` (and `teamId` when relevant).
- **Rate limiting**: Redis used for API rate limit state.
- **Real-time**: Optional Redis pub/sub for multi-instance event fan-out (see `src/lib/realtime.ts`).

## Security

- **Auth**: Clerk middleware; `getAuthenticatedUserId()` used in actions and API routes.
- **Rate limiting**: Applied on API routes (Redis-backed).
- **CSP**: Content-Security-Policy and other security headers in `next.config.ts`.
- **Request size**: Middleware caps body size (e.g. 10MB) for POST/PUT/PATCH.
- **Audit**: Sensitive actions (e.g. deal updates, team changes) logged via `src/lib/audit-log.ts`.

## Further Reading

- **Setup & usage**: [README](README.md)
- **API reference**: In-app [API Reference](/api-docs) (OpenAPI/Swagger)
- **Developer docs**: In-app [Developer Docs](/docs/developers)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
