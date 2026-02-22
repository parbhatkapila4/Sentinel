# Verify request ID in logs

Use these steps to confirm that every request gets a stable `requestId` and that all log lines for that request share the same id.

## 1. Start the app

```bash
npm run dev
```

Keep the terminal open so you can see the Next.js logs.

## 2. Trigger a request that hits the chat API

**Option A – From the app (easiest)**  
Sign in, open the dashboard, and use the chat (send any message). The chat calls `/api/insights/chat`.

**Option B – With curl (no auth)**  
You’ll get 401, but the request still goes through middleware and may hit the route; for a clear success-path test, use Option A.

## 3. Check the terminal logs

In the dev server terminal you should see lines like:

```
ℹ️ [2025-02-13T...] [req:abc12345-6789-...] INFO: Chat API request started
  Context: { "path": "/api/insights/chat" }
...
ℹ️ [2025-02-13T...] [req:abc12345-6789-...] INFO: Chat API request completed
  Context: { "path": "/api/insights/chat", "durationMs": 1234 }
```

- **Same request** → the two lines must have the **same** `[req:...]` value.
- That value is the request ID for that single HTTP request.

## 4. Second request → different ID

Send another chat message (or trigger the API again). In the logs you should see a **different** `[req:...]` for the new request. So:

- Request 1: `[req:aaaaaaaa-...]` on both “started” and “completed”.
- Request 2: `[req:bbbbbbbb-...]` on both “started” and “completed”.

## 5. Optional: custom `X-Request-Id`

If you can send a request with a custom id (e.g. from Postman or curl with a header), set:

```http
X-Request-Id: my-custom-id-123
```

Then trigger the chat API. In the logs you should see:

```
[req:my-custom-id-123]
```

So the same id you sent is the one used in all log lines for that request.

## 6. Optional: production-style JSON logs

To see the production format (one JSON object per line with `requestId`):

1. Build and run in production mode:
   ```bash
   npm run build
   npm run start
   ```
2. Trigger the chat API as above.
3. In the terminal, each log line should be a single JSON object containing `"requestId":"..."` (and the same value for all lines belonging to that request).

## Summary

| Check | What to do | What you should see |
|-------|------------|----------------------|
| Same id per request | One chat request | Two log lines with the **same** `[req:...]` |
| Different id per request | Two chat requests | Two different `[req:...]` values |
| Custom id (optional) | Send `X-Request-Id: my-id` | Logs show `[req:my-id]` |

If any of these fail, the request-context or middleware wiring may need to be checked (e.g. that the chat route is wrapped with `withRequestId` and that middleware sets the `x-request-id` header).
