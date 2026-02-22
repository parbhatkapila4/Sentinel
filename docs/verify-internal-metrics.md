# Verify internal metrics endpoint

Step-by-step checks for `GET /api/internal/metrics` (CRON_SECRET–protected).

---

## Prerequisites

- App running (local or deployed).
- You know your `CRON_SECRET` value (from `.env` or Vercel env vars).

**Local:** base URL = `http://localhost:3000`  
**Deployed:** base URL = `https://your-app.vercel.app` (replace with your real URL).

Use that base URL wherever you see `BASE_URL` below.

---

## Step 1: No auth → must get 401

Call the endpoint **without** any `Authorization` header.

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "BASE_URL/api/internal/metrics" -Method GET
```

**Or curl (if you have it):**
```bash
curl -i "BASE_URL/api/internal/metrics"
```

**Expected:**
- Status: **401 Unauthorized**
- Body: `{"error":"Unauthorized"}`

If you get a redirect to sign-in or something else, the route or middleware config is wrong.

---

## Step 2: Wrong secret → must get 401

Call with a wrong Bearer token.

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "BASE_URL/api/internal/metrics" -Method GET -Headers @{ "Authorization" = "Bearer wrong-secret-123" }
```

**Or curl:**
```bash
curl -i -H "Authorization: Bearer wrong-secret-123" "BASE_URL/api/internal/metrics"
```

**Expected:**
- Status: **401 Unauthorized**
- Body: `{"error":"Unauthorized"}`

---

## Step 3: Correct secret → must get 200 + JSON

Use your real `CRON_SECRET` from `.env` or Vercel.

**PowerShell (replace `YOUR_CRON_SECRET` with the actual value):**
```powershell
$secret = "YOUR_CRON_SECRET"
Invoke-WebRequest -Uri "BASE_URL/api/internal/metrics" -Method GET -Headers @{ "Authorization" = "Bearer $secret" }
```

**Or curl:**
```bash
curl -i -H "Authorization: Bearer YOUR_CRON_SECRET" "BASE_URL/api/internal/metrics"
```

**Expected:**
- Status: **200 OK**
- Body: JSON with three top-level keys, for example:
  ```json
  {
    "dealMetrics": { "created": 0, "updated": 0, "deleted": 0 },
    "apiMetrics": { "totalCalls": 0, "averageResponseTime": 0, "errorRate": 0 },
    "userMetrics": { "activeUsers": 0, "totalUsers": 0 }
  }
  ```
  Numbers may differ; shape must match.

---

## Step 4: CRON_SECRET unset → must get 503

Only do this if you can temporarily change env (e.g. local or a preview deployment).

1. **Temporarily** remove or empty `CRON_SECRET`:
   - **Local:** Comment out or delete `CRON_SECRET` in `.env`, then restart: `npm run dev`.
   - **Vercel:** In Project → Settings → Environment Variables, remove `CRON_SECRET` (or set to empty) and redeploy if needed.
2. Call the endpoint **with** a token (it should still be disabled):

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "BASE_URL/api/internal/metrics" -Method GET -Headers @{ "Authorization" = "Bearer any-token" }
```

**Or curl:**
```bash
curl -i -H "Authorization: Bearer any-token" "BASE_URL/api/internal/metrics"
```

**Expected:**
- Status: **503 Service Unavailable**
- Body: `{"error":"Metrics endpoint is disabled"}`

3. **Restore** `CRON_SECRET` and restart/redeploy so cron and metrics work again.

---

## Quick checklist

| Step | What you do | Expected result |
|------|-------------|-----------------|
| 1 | GET with no `Authorization` | 401, `{"error":"Unauthorized"}` |
| 2 | GET with `Authorization: Bearer wrong` | 401, `{"error":"Unauthorized"}` |
| 3 | GET with `Authorization: Bearer YOUR_CRON_SECRET` | 200, JSON with dealMetrics, apiMetrics, userMetrics |
| 4 | Unset CRON_SECRET, then GET (with any token) | 503, `{"error":"Metrics endpoint is disabled"}` |

If all four match, the metrics endpoint is verified.
