# Sentinel Deployment

Prerequisites, local setup, and deployment (Vercel) for Sentinel.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 12+ (local or hosted)
- **npm** (or compatible package manager)
- **Environment variables** — see [Environment variables](#environment-variables) and [README](README.md) for setup.

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
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - `OPENROUTER_API_KEY` (for AI insights)
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (optional; cache/rate limit)
   - `NEXT_PUBLIC_SENTRY_DSN`, Sentry env vars (optional)
   - `CRON_SECRET` (optional; for cron routes like sync-integrations, process-emails, process-webhooks)
3. **Postgres**: Use [Vercel Postgres](https://vercel.com/storage/postgres) or attach an external PostgreSQL database and set `DATABASE_URL`.
4. **Migrations**: Run `npx prisma migrate deploy` as part of the build (e.g. in a custom build script) or in a one-off step after first deploy. The default `npm run build` runs `prisma generate`; add a postinstall or build step for `prisma migrate deploy` if you deploy migrations from Vercel.
5. **Crons**: Cron jobs are not defined in `vercel.json` by default. **Vercel plan limits:** On **Hobby**, cron can run only **once per day** with hourly precision (no every-5-min or every-15-min). On **Pro**, you can use per-minute intervals. To enable Vercel Cron:
   - **Hobby**: Add a single cron that runs once per day, e.g. `"schedule": "0 0 * * *"` (midnight UTC) for `/api/cron/sync-integrations`.
   - **Pro**: You can add multiple crons with finer schedules (e.g. every 6 h for sync, every 15 min for process-emails/process-webhooks).
   - **Any plan**: For more frequent runs on Hobby (e.g. every 5 or 15 minutes), use an **external scheduler** (e.g. [cron-job.org](https://cron-job.org), GitHub Actions) and call the endpoints with `Authorization: Bearer <CRON_SECRET>`. See [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) for limits. Set `CRON_SECRET` in the Vercel dashboard for auth. An example once-daily cron config is in `vercel.crons.example.json` (copy the `crons` array into `vercel.json`).
6. **Deploy** — Vercel will run `npm run build` and serve the app.

## Environment Variables

| Variable                            | Description                                        | Required           | Example (no real secrets)             |
| ----------------------------------- | -------------------------------------------------- | ------------------ | ------------------------------------- |
| `DATABASE_URL`                      | PostgreSQL connection string                       | Yes                | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                              | Yes                | `pk_...`                              |
| `CLERK_SECRET_KEY`                  | Clerk secret key (min 32 chars)                    | Yes                | `sk_...`                              |
| `NEXT_PUBLIC_CLERK_*`               | Clerk URLs (sign-in, sign-up, after sign-in, etc.) | Optional           | See [.env.example](.env.example)      |
| `OPENROUTER_API_KEY`                | OpenRouter API key for AI                          | Yes (for insights) | —                                     |
| `UPSTASH_REDIS_REST_URL`            | Upstash Redis REST URL                             | Optional           | —                                     |
| `UPSTASH_REDIS_REST_TOKEN`          | Upstash Redis REST token                           | Optional           | —                                     |
| `RESEND_API_KEY`                    | Resend for transactional email                     | Optional           | —                                     |
| `NEXT_PUBLIC_APP_URL`               | App base URL                                       | Optional           | `http://localhost:3000`               |
| `NEXT_PUBLIC_SENTRY_DSN`            | Sentry DSN                                         | Optional           | —                                     |
| `SENTRY_*`                          | Sentry config (sample rate, etc.)                  | Optional           | See [.env.example](.env.example)      |
| `CRON_SECRET`                       | Secret for cron route auth (Bearer token)          | Optional           | Used by `/api/cron/*`                 |
| `NEXT_PUBLIC_ANALYTICS_ENABLED`     | Set to `false` to disable client-side analytics    | Optional           | Omit or `true` to enable              |
| `ANALYTICS_API_KEY`                 | API key for GET `/api/metrics/summary` (internal)  | Optional           | Used by metrics summary endpoint      |

## Docker

Docker is for local development and self-hosted deployment. Vercel remains the primary deployment target.

**Prerequisites:** Docker, Docker Compose

1. **Environment**: Copy `.env.example` to `.env.local` and fill in required vars (Clerk, OpenRouter, etc.). `DATABASE_URL` is overridden in `docker-compose.yml` to use the `db` service.
2. **Start stack**: `docker compose up --build` (or `docker-compose up --build`).
3. **Migrations**: Run after the app and DB are up:
   - `docker compose exec app npx prisma migrate deploy`
   - Or from the host: `DATABASE_URL=postgresql://sentinel:sentinel@localhost:5432/sentinel npx prisma migrate deploy`
4. **Open**: http://localhost:3000

**Optional Redis:** Start with Redis: `docker compose --profile with-redis up --build`. The app uses Upstash Redis (REST) by default; for local Redis you would need to configure a compatible client. The app runs without Redis (rate limiting and cache degrade gracefully).

**Note:** No `.env` files are copied into the image; provide env via `env_file` or `-e` at runtime.

## Post-Deploy Verification

- **Health**: Open the app URL and sign in (or hit a public route).
- **Cron**: If using Vercel Cron or external scheduler for `/api/cron/sync-integrations`, `/api/cron/process-emails`, `/api/cron/process-webhooks`, call them with `Authorization: Bearer <CRON_SECRET>` and verify logs.
- **Sentry**: Confirm events appear in Sentry if DSN is set.
- **Clerk**: Confirm sign-in/sign-up and webhooks (if configured) work in production.

## Links

- [README](README.md) — Setup and overview
- [ARCHITECTURE.md](ARCHITECTURE.md) — System overview
