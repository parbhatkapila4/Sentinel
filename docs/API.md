# Sentinel API Index

Short index of the main API areas. For the full OpenAPI/Swagger spec, see the in-app [API Reference](https://www.sentinel.parbhat.dev/api-docs).

## Overview

- **Base URL**: Same origin as the app (e.g. `https://your-app.vercel.app` for production).
- **Auth**: Clerk session; use the session cookie for browser requests, or a Bearer token for API clients where supported.
- **Rate limits**: Applied on API routes; see response headers or README for rate-limit details.

## Main API Areas

| Method      | Path                                       | Description                                                 |
| ----------- | ------------------------------------------ | ----------------------------------------------------------- |
| GET         | `/api/auth/me`                             | Current authenticated user (Clerk).                         |
| GET         | `/api/deals/search`                        | Search deals (query params).                                |
| GET / POST  | `/api/deals/export`                        | Export deals (e.g. CSV).                                    |
| GET         | `/api/insights/chat`                       | AI chat over pipeline (streaming or JSON).                  |
| GET / POST  | `/api/notifications`                       | List or create notifications.                               |
| GET         | `/api/notifications/read-all`              | Mark all notifications read.                                |
| GET / PATCH | `/api/notifications/[id]`                  | Get or update a notification (e.g. mark read).              |
| GET         | `/api/events`                              | Server-Sent Events (SSE) stream for real-time updates.      |
| GET         | `/api/teams/me`                            | Current user’s teams.                                       |
| GET         | `/api/metrics/performance`                 | Performance metrics.                                        |
| GET         | `/api/metrics/summary`                     | Aggregate business metrics (internal; `x-api-key` or auth). |
| POST        | `/api/analytics/track`                     | Client analytics events (rate-limited; no PII).             |
| GET / POST  | `/api/reports/export`                      | Export reports.                                             |
| GET         | `/api/alerts`                              | Deal alerts / at-risk summary.                              |
| POST        | `/api/integrations/salesforce/sync`        | Trigger Salesforce sync.                                    |
| POST        | `/api/integrations/hubspot/sync`           | Trigger HubSpot sync.                                       |
| GET / POST  | `/api/integrations/google-calendar/sync`   | Google Calendar sync.                                       |
| GET / POST  | `/api/integrations/google-calendar/events` | Google Calendar events.                                     |
| POST        | `/api/cron/sync-integrations`              | Cron: sync integrations (requires `CRON_SECRET`).           |
| POST        | `/api/cron/process-emails`                 | Cron: process email queue.                                  |
| POST        | `/api/cron/process-webhooks`               | Cron: process webhooks.                                     |
| DELETE      | `/api/user/delete`                         | Delete current user (or account).                           |

**Full spec**: [API Reference](https://www.sentinel.parbhat.dev/api-docs) — OpenAPI/Swagger with request/response schemas.

## Example Requests

**GET deals (via app)**  
Deals are typically loaded via Server Actions (e.g. `getAllDeals`) from the app. For API access to search:

```bash
curl -X GET "https://your-app.vercel.app/api/deals/search?q=Acme" \
  -H "Cookie: __session=YOUR_CLERK_SESSION"
```

**POST insights chat**  
AI chat over pipeline (streaming or JSON):

```bash
curl -X POST "https://your-app.vercel.app/api/insights/chat" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_CLERK_SESSION" \
  -d '{"message": "Which deals need my attention today?"}'
```

Replace `YOUR_CLERK_SESSION` with a valid Clerk session cookie (or Bearer token if the route supports it). See [API Reference](https://www.sentinel.parbhat.dev/api-docs) for exact request/response shapes and auth.
