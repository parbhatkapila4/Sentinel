# Sentinel

**AI-Powered Revenue Intelligence Platform**

Early warning for pipeline risk. Predictions, recommendations, and real-time visibility.

[Demo](https://www.sentinel.parbhat.dev) · [API Reference](https://www.sentinel.parbhat.dev/api-docs) · [Documentation](https://www.sentinel.parbhat.dev/docs/developers)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

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
- **Composite risk score**: Single 0–1 score with Low / Medium / High bands and reason strings.

---

### Intelligent AI Assistant

Natural-language queries over your deals and pipeline. Example prompts:

- "Which deals need my attention today?"
- "Tell me about the Acme Corp deal."
- "Why is my pipeline health declining?"
- "Compare my performance this month vs. last month."

The AI router maps query intent to specialized models:

| Query type       | Model                    | Use case                          |
|------------------|--------------------------|-----------------------------------|
| Semantic search  | OpenAI GPT-4 Turbo       | Find, similar, match, embedding   |
| Financial / deal | Anthropic Claude 3.5     | Pipeline, revenue, risk, forecast |
| Deal-specific    | Anthropic Claude 3.5     | Single-deal detail, follow-ups    |
| Code / SQL       | OpenAI GPT-4o            | Queries, scripts, database        |
| Planning / docs  | Google Gemini Pro        | Strategy, roadmap, multimodal     |
| General          | OpenAI GPT-4 Turbo       | Everything else                   |

---

### Team Collaboration

- **RBAC**: Owner, admin, member, viewer roles; team-scoped deal access.
- **Team workspaces**: Create teams, invite by email, assign deals to members.
- **Activity timeline**: Immutable audit trail per deal; stage changes and events.
- **Real-time notifications**: In-app plus optional email (deal at risk, action overdue, stage change).

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

Core `Deal` model (Prisma):

```prisma
model Deal {
  id           String    @id @default(cuid())
  userId       String
  teamId       String?
  assignedToId String?
  name         String
  stage        String
  value        Int
  location     String?
  createdAt    DateTime  @default(now())
  user         User      @relation("CreatedDeals", ...)
  team         Team?     @relation(...)
  assignedTo   User?     @relation("AssignedDeals", ...)
  events       DealEvent[]
  timeline     DealTimeline[]
  notifications Notification[]

  @@index([userId, createdAt])
  @@index([userId, stage])
  @@index([teamId])
  @@index([assignedToId])
}
```

---

## Technology Decisions

| Component     | Choice            | Rationale                                              |
|---------------|-------------------|--------------------------------------------------------|
| Framework     | Next.js 16        | App Router, RSC, Server Actions, Vercel-ready          |
| Language      | TypeScript 5      | Type safety, Prisma alignment, editor support          |
| Database      | PostgreSQL        | ACID, JSON, scaling; Supabase/Railway-friendly         |
| ORM           | Prisma            | Type-safe queries, migrations, generated client        |
| Authentication| Clerk             | MFA, sessions, OAuth; minimal backend code             |
| AI            | OpenRouter        | Multi-model routing; Claude, GPT, Gemini via one API   |
| Queue         | Upstash Redis     | Optional email/webhook queue; serverless-friendly      |
| Email         | Resend            | Transactional email; simple API, deliverability        |
| Testing       | Vitest, Playwright| Unit + E2E; fast feedback, CI integration              |

---

## Local Development

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 12 (or Supabase)
- **npm** >= 9

### Setup

```bash
git clone https://github.com/parbhatkapila4/Sentinel.git
cd Sentinel
npm install
cp .env.example .env.local
```

Edit `.env.local` with required variables (see below). Then:

```bash
npm run db:generate
npm run db:push
npm run dev
```

App runs at `http://localhost:3000`.

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
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Reference

### Authentication

All API requests use Bearer auth. Include the token in the `Authorization` header:

```bash
curl -X GET "https://your-domain.com/api/deals" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/deals`           | List deals (optional `stage`, `limit`) |
| POST   | `/api/deals`           | Create deal                          |
| GET    | `/api/deals/:id`       | Get deal by ID                       |
| PATCH  | `/api/deals/:id`       | Update deal                          |
| POST   | `/api/insights/chat`   | AI chat (body: `{ messages }`)       |
| GET    | `/api/notifications`   | List notifications                   |
| GET    | `/api/auth/me`         | Current user                         |

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
│   ├── actions/            # Server Actions (deals, teams, webhooks, etc.)
│   ├── api/                # REST routes (deals, insights, notifications, cron)
│   ├── dashboard/          # Dashboard, deals, reports, settings pages
│   └── ...                 # Auth, pricing, docs, static pages
├── components/             # React UI (dashboard, forms, charts, AI chat)
│   └── ui/                 # Shared primitives (sidebar, skeleton, etc.)
├── lib/                    # Core logic (auth, risk, AI router, webhooks, etc.)
├── hooks/                  # useKeyboardShortcuts, useOptimisticAction
├── types/                  # Shared TypeScript types
├── test/                   # Mocks and Vitest setup
└── middleware.ts           # Auth boundary
```

---

## Testing

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run test`    | Vitest watch mode              |
| `npm run test:run`| Unit tests (CI)                |
| `npm run test:coverage` | Coverage report          |
| `npm run test:e2e`| Playwright E2E                 |

Unit tests live in `src/app/actions/__tests__` and `src/lib/__tests__`. E2E specs are in `e2e/` (home, dashboard, deals). Use `src/test/mocks` for auth and Prisma in tests.

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
- **Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy via `next.config`.
- **Input validation**: Zod in `src/lib/env`; validate request bodies in API routes.
- **Rate limiting**: Recommended at edge/CDN for production (e.g. Vercel, Cloudflare).

---

## Performance

| Metric        | Target  |
|---------------|---------|
| Lighthouse    | 98      |
| FCP           | 0.8 s   |
| TTI           | 1.2 s   |
| LCP           | < 1.5 s |
| CLS           | < 0.1   |

- React Server Components and Server Actions to reduce client JS.
- Dynamic imports for heavy UI (e.g. Swagger, charts).
- Prisma query tuning; indexed access on `userId`, `teamId`, `dealId`.
- Optional Redis for queue and caching.
- Image optimization via `next/image` where used.

---

## Contributing

We welcome contributions. Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## Support

- Documentation: [docs](https://www.sentinel.parbhat.dev/docs)
- API Reference: [api-docs](https://www.sentinel.parbhat.dev/api-docs)
- Issues: [GitHub Issues](https://github.com/parbhatkapila4/Sentinel/issues)

---

## Acknowledgments

- [Next.js](https://nextjs.org) — The React framework for production
- [Prisma](https://prisma.io) — Next-generation ORM for Node.js
- [Clerk](https://clerk.com) — Authentication and user management
- [OpenRouter](https://openrouter.ai) — Unified API for AI models
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Vercel](https://vercel.com) — Deployment and hosting

---

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
