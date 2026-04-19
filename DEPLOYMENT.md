# Sentinel Deployment

Prerequisites, local setup, and deployment (Vercel) for Sentinel.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 12+ (local or hosted)
- **npm** (or compatible package manager)
- **Environment variables** - see [Environment variables](#environment-variables) and [README](README.md) for setup.

## Local Development

1. **Clone** the repository.
2. **Install dependencies**: `npm install`
3. **Environment**: `cp .env.example .env.local` and fill in required variables (see table below).
4. **Database**:
   - `npx prisma generate`
   - `npx prisma migrate dev` (creates/updates DB schema)
5. **Build**: `npm run build`
6. **Start**: `npm run start` (or `npm run dev` for development)

See [README](README.md) for detailed setup and optional services (Redis, Resend, Sentry).

## Vercel Deployment

1. **Connect** your Git repo to Vercel.
2. **Set environment variables** in the Vercel project (see table below). Critical ones:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - `OPENROUTER_API_KEY` (for AI insights)
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (optional; cache/rate limit)
   - `NEXT_PUBLIC_SENTRY_DSN`, Sentry env vars (optional)
   - `CRON_SECRET` (required to **invoke** `/api/cron/*`; routes fail closed if unset)
   - `INTEGRATION_ENCRYPTION_KEY` (required to **encrypt** new integration secrets at write time; see `src/lib/integration-secrets.ts`)
   - **Supabase**: `DATABASE_URL` = **Transaction pooler** (host `*.pooler.supabase.com`, port **6543**). `DIRECT_URL` = **Direct** connection (port **5432**). Set both in Vercel.
3. **Postgres**: Use [Vercel Postgres](https://vercel.com/storage/postgres) or attach an external PostgreSQL database and set `DATABASE_URL` (and `DIRECT_URL` when using Prisma migrations — same as `DATABASE_URL` for Vercel Postgres unless your provider documents otherwise).
4. **Migrations**: Run `npx prisma migrate deploy` as part of the build (e.g. in a custom build script) or in a one-off step after first deploy. The default `npm run build` runs `prisma generate`; add a postinstall or build step for `prisma migrate deploy` if you deploy migrations from Vercel.
5. **Crons**: Cron jobs are not defined in `vercel.json` by default. **Vercel plan limits** ([usage & pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)): On **Hobby**, each cron’s schedule must run **at most once per day** (hourly precision, ±59 min); expressions like hourly will **fail deployment**. **Pro** allows per-minute schedules. To enable Vercel Cron:
   - **Hobby**: Add at least one **daily** cron, e.g. `"schedule": "0 0 * * *"` (midnight UTC) for `/api/cron/sync-integrations` (repo example in `vercel.crons.example.json` → `vercel.json`).
   - **Pro**: Add crons with finer schedules (e.g. every 6 h for sync, every 15 min for process-emails/process-webhooks).
   - **Hobby + higher frequency**: Vercel cannot run a given route more than daily on Hobby—use an **external scheduler** (e.g. [cron-job.org](https://cron-job.org), GitHub Actions) and call the endpoints with `Authorization: Bearer <CRON_SECRET>`. See [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs). Set `CRON_SECRET` in the Vercel dashboard for auth. Full playbook: [Vercel Hobby cron playbook](#vercel-hobby-cron-playbook).
6. **Deploy** - Vercel will run `npm run build` and serve the app.

## Vercel Hobby cron playbook

Two-tier strategy for **Hobby** (Vercel cron schedules capped at **once per day** per job) vs higher frequency via an **external scheduler**. All cron HTTP calls must send **`Authorization: Bearer <CRON_SECRET>`** (`src/lib/cron-auth.ts`); no query-string secrets.

1. **Once/day on Vercel Cron (low-priority work)** — e.g. one daily `GET` to `/api/cron/sync-integrations` on Hobby (`vercel.crons.example.json` → `vercel.json`); add more **daily** crons only if you need separate routes/times.
2. **Higher frequency** — external scheduler (e.g. cron-job.org) calling the same routes with **`Authorization: Bearer <CRON_SECRET>`** (same enforcement as `src/lib/cron-auth.ts`; no query-param secrets). Assume **retries and overlaps**—handlers should stay idempotent (upsert by external IDs).

Example external scheduler call:

```bash
curl -X GET "https://your-domain.com/api/cron/process-emails" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Environment Variables

| Variable                            | Description                                                                                                                                    | Required                                                   | Example (no real secrets)                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`                      | PostgreSQL connection string (see Supabase below)                                                                                              | Yes                                                        | `postgresql://...`                                                               |
| `DIRECT_URL`                        | Direct Postgres URL for Prisma migrations (`migrate` / `db push`). Supabase: port **5432** (not pooler). Local/Docker: same as `DATABASE_URL`. | Yes for Prisma CLI                                         | `postgresql://...:5432/...`                                                      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                                                                                                                          | Yes                                                        | `pk_...`                                                                         |
| `CLERK_SECRET_KEY`                  | Clerk secret key (min 32 chars)                                                                                                                | Yes                                                        | `sk_...`                                                                         |
| `NEXT_PUBLIC_CLERK_*`               | Clerk URLs (sign-in, sign-up, after sign-in, etc.)                                                                                             | Optional                                                   | See [.env.example](.env.example)                                                 |
| `OPENROUTER_API_KEY`                | OpenRouter API key for AI                                                                                                                      | Yes (for insights)                                         | -                                                                                |
| `UPSTASH_REDIS_REST_URL`            | Upstash Redis REST URL                                                                                                                         | Optional                                                   | -                                                                                |
| `UPSTASH_REDIS_REST_TOKEN`          | Upstash Redis REST token                                                                                                                       | Optional                                                   | -                                                                                |
| `RESEND_API_KEY`                    | Resend for transactional email                                                                                                                 | Optional                                                   | -                                                                                |
| `NEXT_PUBLIC_APP_URL`               | App base URL                                                                                                                                   | Optional                                                   | `http://localhost:3000`                                                          |
| `NEXT_PUBLIC_SENTRY_DSN`            | Sentry DSN                                                                                                                                     | Optional                                                   | -                                                                                |
| `SENTRY_*`                          | Sentry config (sample rate, etc.)                                                                                                              | Optional                                                   | See [.env.example](.env.example)                                                 |
| `CRON_SECRET`                       | Bearer secret for `/api/cron/*`                                                                                                                | Required to **invoke** cron routes                         | Missing/blank → 503; wrong token → 401 (see `src/lib/cron-auth.ts`)              |
| `INTEGRATION_ENCRYPTION_KEY`        | Base64-encoded 32-byte key (`openssl rand -base64 32`)                                                                                         | Required to **encrypt** new integration secrets on connect | See `src/lib/integration-secrets.ts`; decrypt accepts legacy plaintext DB values |
| `NEXT_PUBLIC_ANALYTICS_ENABLED`     | Set to `false` to disable client-side analytics                                                                                                | Optional                                                   | Omit or `true` to enable                                                         |
| `ANALYTICS_API_KEY`                 | API key for GET `/api/metrics/summary` (internal)                                                                                              | Optional                                                   | Used by metrics summary endpoint                                                 |

### Supabase

- **`DATABASE_URL`**: Dashboard → **Project Settings → Database → Connection string** → **Transaction** / pooler (`:6543`). The app adds `pgbouncer=true` and a `connection_limit` if they are missing on pooler hosts.
- **`DIRECT_URL`**: Same page → **Direct connection** (`:5432`). Used only by `prisma migrate` / `db push`, not by the running Next.js app.
- **Local Postgres / Docker**: Set `DIRECT_URL` to the **same** value as `DATABASE_URL`.

## Docker

Docker is for local development and self-hosted deployment. Vercel remains the primary deployment target.

**Prerequisites:** Docker, Docker Compose

1. **Environment**: Copy `.env.example` to `.env.local` and fill in required vars (Clerk, OpenRouter, etc.). `DATABASE_URL` and `DIRECT_URL` are overridden in `docker-compose.yml` to use the `db` service (both point at the same local Postgres URL).
2. **Start stack**: `docker compose up --build` (or `docker-compose up --build`).
3. **Migrations**: Run after the app and DB are up:
   - `docker compose exec app npx prisma migrate deploy`
   - Or from the host: `DATABASE_URL=postgresql://sentinel:sentinel@localhost:5432/sentinel npx prisma migrate deploy`
4. **Open**: http://localhost:3000

**Optional Redis:** Start with Redis: `docker compose --profile with-redis up --build`. The app uses Upstash Redis (REST) by default; for local Redis you would need to configure a compatible client. The app runs without Redis (rate limiting and cache degrade gracefully).

**Note:** No `.env` files are copied into the image; provide env via `env_file` or `-e` at runtime.

## Post-Deploy Verification

- **Build + quality gate**: Run `npm run verify` before deployment; ensure all checks pass.
- **Health**: Open the app URL and verify protected routes require sign-in.
- **Cron security check**: Verify cron endpoints reject missing/invalid bearer token and accept only `Authorization: Bearer <CRON_SECRET>`.
- **AI reliability check**: Exercise `/api/insights/chat` and confirm graceful responses during transient provider failures (fallback path should prevent single-model outages from fully blocking chat).
- **Realtime check**: Verify `/api/events` reconnects cleanly and resumes using `lastEventId`.
- **Sentry/monitoring**: Confirm events are visible if DSN is configured.

## Quality gate (local and optional CI)

- **Before deploy or push**: `npm run verify` runs `typecheck`, `lint`, and `vitest run` (same chain as `npm run verify:ci`). Works on Windows via `npm run verify` (do not rely on hand-typed `&&` in older shells).
- **Optional GitHub Actions**: `.github/workflows/verify.yml` is **`workflow_dispatch` only** (manual); not a required PR check. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Links

- [README](README.md) - Setup and overview (includes [Ship checklist](README.md#ship-checklist))
- [ARCHITECTURE.md](ARCHITECTURE.md) - System overview
- [TRY_THIS.md](TRY_THIS.md) - Quick product walkthrough
