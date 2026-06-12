# Verify - Gmail CRM permission filter (manual E2E smoke test)

The unit tests in `src/lib/__tests__/email-participants.test.ts` and
`src/lib/__tests__/crm-permission.test.ts` cover the parser and the
filter logic in isolation. This document is the **human-in-the-loop**
verification that the end-to-end Gmail sync refuses to persist
messages from non-CRM participants. **Do not automate.** It must be
run by a developer with access to a real Gmail account connected to
Sentinel and a known CRM contact set.

---

## Prerequisites

- You are logged in as a Sentinel user (note your `User.id` and `User.email`).
- Your Gmail integration is connected and `syncEnabled = true`.
- HubSpot or Salesforce has been connected and a sync has populated at
  least one row in the `Contact` table for your user.

---

## Step 1 - Confirm your CRM contact set

Run against the app's Postgres (Supabase pooled URL):

```sql
SELECT email, source, "firstName", "lastName"
FROM "Contact"
WHERE "userId" = '<your-user-id>'
ORDER BY "lastSyncedAt" DESC;
```

Write down a handful of these - you'll cross-check them against the
emails that survive filtering.

## Step 2 - Trigger a manual Gmail sync

In Sentinel: **Settings → Integrations → Gmail → Sync now**. Watch the
toast / response payload. It should look like:

```json
{
  "success": true,
  "synced": <small number>,
  "scanned": 25,
  "skipped": <usually > 0>,
  "errors": null
}
```

`skipped` should typically be greater than zero - most consumer Gmail
inboxes carry mailing-list noise, newsletter delivery, and personal
mail that does NOT involve a CRM contact. If `skipped === 0` and
`synced === scanned`, double-check that your Contact table is not
accidentally storing every email you've ever received.

## Step 3 - Count what landed in `EmailMessage`

```sql
SELECT COUNT(*)
FROM "EmailMessage"
WHERE "userId" = '<your-user-id>'
  AND source = 'gmail'
  AND "createdAt" > now() - interval '5 minutes';
```

This should equal the `synced` value from step 2.

## Step 4 - Verify every retained email has a CRM participant

For each row above, the `from` or one of the `toEmails` must match a
row in `Contact` for the same user. The query that proves it:

```sql
WITH recent_gmail AS (
  SELECT id, "fromEmail", "toEmails"
  FROM "EmailMessage"
  WHERE "userId" = '<your-user-id>'
    AND source = 'gmail'
    AND "createdAt" > now() - interval '5 minutes'
),
crm AS (
  SELECT email FROM "Contact" WHERE "userId" = '<your-user-id>'
)
SELECT id, "fromEmail", "toEmails"
FROM recent_gmail
WHERE LOWER(TRIM("fromEmail")) NOT IN (SELECT email FROM crm)
  AND NOT EXISTS (
    SELECT 1 FROM unnest("toEmails") t
    WHERE LOWER(TRIM(t)) IN (SELECT email FROM crm)
  );
```

**Expected result: zero rows.** Any row this query returns is a leak
- a message persisted whose From and every To address are outside the
CRM contact book. If that happens, STOP and investigate:
- Is the message Cc'd to a CRM contact (Cc is excluded from
  `toEmails` storage but IS checked by the filter)? That's fine.
- Otherwise: the parser may have extracted an email that doesn't
  match what's in `EmailMessage.fromEmail` / `toEmails` after the
  filter pass. Capture the failing row's Gmail `externalId` and
  inspect the raw headers via the Gmail API directly.

## Step 5 - Verify a known-good interaction surfaces

Send yourself a test message FROM one of the CRM contact addresses
(easiest: forward an existing message from `alice@crm.com` to your
inbox, or ask someone in your CRM to send you a one-liner). Wait a
minute, then **Sync now**. Confirm:

```sql
SELECT "externalId", "fromEmail", "sentAt"
FROM "EmailMessage"
WHERE "userId" = '<your-user-id>'
  AND "fromEmail" ILIKE '%alice@crm.com%'
ORDER BY "sentAt" DESC
LIMIT 5;
```

The test message should be in the results.

## Step 6 - Verify metrics fire

If you have a metrics dashboard wired (Redis), confirm the following
counters incremented during your sync:

- `crm_permission.email_filter.passed` → bumped by `synced`
- `crm_permission.email_filter.dropped` → bumped by `skipped`
- `crm_permission.check.total` → bumped by total participants
  examined across messages
- `crm_permission.check.in_book` / `…out_of_book` → split of the above

The metrics are observability for filter health: a sudden spike in
`crm_permission.email_filter.fail_closed` means the filter is
erroring out (DB hiccup, user.email missing) and silently dropping
mail; treat as a P2 page.

---

## What this does NOT cover

- **Calendar and Slack ingestion paths.** They enforce the same
  CRM-participant gate (see the `calendar-participants` and
  `slack-signature` / `slack-events` test suites); this runbook is
  Gmail-specific.
- **Backfill of pre-filter Gmail rows** from before the filter
  shipped - that's the dedicated backfill script and intentionally
  not covered here.
- **Domain-level matching** (`anyone@acme.com`) - future feature, not
  in scope.
