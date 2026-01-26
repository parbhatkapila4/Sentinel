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

Sentinel includes a cron job endpoint that automatically syncs all active integrations every 6 hours.

**Endpoint:** `GET /api/cron/sync-integrations`

**Security:** Protected by `CRON_SECRET` environment variable. Set in Vercel Cron or your scheduler:

```bash
CRON_SECRET=your-secret-key-here
```

**Vercel Cron Configuration:**

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-integrations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**What it does:**
- Syncs all Salesforce integrations with `syncEnabled: true`
- Syncs all HubSpot integrations with `syncEnabled: true`
- Syncs all Google Calendar integrations with `syncEnabled: true`
- Logs results and errors for monitoring

**Manual Trigger:**

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
  id           String    @id @default(cuid())
  userId       String
  teamId       String?
  assignedToId String?
  name         String
  stage        String
  value        Int
  location     String?
  source       String?      // "salesforce", "hubspot", or null
  externalId   String?      // External CRM deal ID
  createdAt    DateTime  @default(now())
  user         User      @relation("CreatedDeals", ...)
  team         Team?     @relation(...)
  assignedTo   User?     @relation("AssignedDeals", ...)
  events       DealEvent[]
  timeline     DealTimeline[]
  notifications Notification[]
  meetings     Meeting[]

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
# Queue & Caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=re_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Jobs
CRON_SECRET=your-secret-key-here  # Required for /api/cron/* endpoints
```

**Note:** Integration API keys (Salesforce, HubSpot, Google Calendar) are stored per-user in the database and configured through the Settings UI, not as environment variables.

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

#### Deals

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/deals`           | List deals (optional `stage`, `limit`) |
| POST   | `/api/deals`           | Create deal                          |
| GET    | `/api/deals/:id`       | Get deal by ID                       |
| PATCH  | `/api/deals/:id`       | Update deal                          |
| GET    | `/api/deals/search`    | Search deals (query params)          |
| POST   | `/api/deals/export`    | Export deals as CSV/JSON             |

#### AI & Insights

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/insights/chat`   | AI chat (body: `{ messages }`)       |

#### Notifications

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/notifications`   | List notifications                   |
| POST   | `/api/notifications/read-all` | Mark all as read              |

#### Authentication

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/auth/me`         | Current user                         |

#### Integrations

| Method | Endpoint                                    | Description                          |
|--------|---------------------------------------------|--------------------------------------|
| POST   | `/api/integrations/salesforce/sync`         | Manually sync Salesforce deals       |
| POST   | `/api/integrations/hubspot/sync`            | Manually sync HubSpot deals          |
| POST   | `/api/integrations/google-calendar/sync`    | Manually sync Google Calendar events |
| GET    | `/api/integrations/google-calendar/events`  | Get upcoming meetings (optional `?dealId=xxx`) |
| POST   | `/api/integrations/google-calendar/events`  | Create a new meeting                 |
| GET    | `/api/cron/sync-integrations`              | Auto-sync all integrations (cron)    |

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
│   ├── salesforce.ts      # Salesforce API client
│   ├── hubspot.ts         # HubSpot API client
│   ├── google-calendar.ts # Google Calendar API client
│   ├── slack.ts           # Slack webhook utilities
│   ├── auth.ts            # Authentication helpers
│   ├── dealRisk.ts        # Risk calculation
│   ├── ai-router.ts       # AI model routing
│   └── utils.ts           # Utility functions
├── hooks/                  # React hooks
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
