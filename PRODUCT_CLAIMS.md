## Compliance

```json
{
  "claim_id": "compliance_soc2_roadmap_only",
  "claim_text": "A formal SOC 2 audit is on the 2026 roadmap, not something we claim today.",
  "status": "planned",
  "evidence_paths": [
    "src/app/page.tsx",
    "src/app/security/page.tsx",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "compliance_soc2_type2_certified_not_supported",
  "claim_text": "SOC 2 Type II certified",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/app/security/page.tsx",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

## Data handling

```json
{
  "claim_id": "data_read_only_crm_calendar",
  "claim_text": "Sentinel is read-only for Salesforce, HubSpot, and Google Calendar and does not write back.",
  "status": "implemented",
  "evidence_paths": [
    "src/app/security/page.tsx",
    "src/app/integrations/page.tsx",
    "src/app/actions/salesforce.ts",
    "src/app/actions/hubspot.ts",
    "src/lib/slack.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "data_oauth_credentials",
  "claim_text": "Integrations authenticate via OAuth redirect with scoped tokens.",
  "status": "implemented",
  "evidence_paths": [
    "src/app/security/page.tsx",
    "src/app/integrations/page.tsx",
    "README.md"
  ],
  "last_verified_at": "2026-06-13"
}
```

```json
{
  "claim_id": "data_legacy_api_key_auth_historical",
  "claim_text": "Earlier releases authenticated integrations with API key credentials; these have since been migrated to OAuth.",
  "status": "implemented",
  "evidence_paths": [
    "src/app/changelog/page.tsx"
  ],
  "last_verified_at": "2026-06-13"
}
```

```json
{
  "claim_id": "data_writes_risk_back_not_supported",
  "claim_text": "writes back risk",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/app/security/page.tsx",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "integrations_oauth2_not_supported",
  "claim_text": "OAuth 2.0",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/app/integrations/page.tsx",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "data_no_shared_model_training",
  "claim_text": "Pipeline data is never used to train shared models.",
  "status": "implemented",
  "evidence_paths": [
    "src/app/page.tsx",
    "src/app/security/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
}
```

## Integrations

```json
{
  "claim_id": "integrations_supported_providers",
  "claim_text": "Supported integrations are HubSpot, Salesforce, Google Calendar, Slack, and outbound webhooks.",
  "status": "implemented",
  "evidence_paths": [
    "src/app/integrations/page.tsx",
    "src/app/page.tsx",
    "README.md"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "integrations_gmail_implemented",
  "claim_text": "Gmail",
  "status": "implemented",
  "evidence_paths": [
    "src/app/actions/gmail.ts",
    "src/app/api/oauth/gmail/callback/route.ts",
    "src/app/api/cron/sync-integrations/route.ts",
    "prisma/schema.prisma"
  ],
  "last_verified_at": "2026-05-10"
}
```

```json
{
  "claim_id": "integrations_linear_not_supported",
  "claim_text": "Linear",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/__tests__/capability-consistency.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

## Sync cadence

```json
{
  "claim_id": "sync_daily_cron",
  "claim_text": "CRM and calendar sync runs on a daily cron, with manual sync available.",
  "status": "implemented",
  "evidence_paths": [
    "vercel.crons.example.json",
    "src/app/api/cron/sync-integrations/route.ts",
    "README.md"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "sync_hourly_not_supported",
  "claim_text": "hourly sync",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "vercel.crons.example.json",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "sync_bidirectional_not_supported",
  "claim_text": "bi-directional sync",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/app/integrations/page.tsx",
    "README.md",
    "src/__tests__/claim-drift.test.ts"
  ],
  "last_verified_at": "2026-04-23"
}
```

## Measurement

```json
{
  "claim_id": "perf_latency_numbers_not_supported",
  "claim_text": "Published latency numbers (e.g. sub-second scan, 0.6s diagnosis)",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/lib/performance.ts",
    "src/__tests__/claim-drift.test.ts"
  ],
  "notes": "measureAsync/measureSync exist but have zero call sites, so nothing is timed. A latency claim requires a wired-up measurement first.",
  "last_verified_at": "2026-08-02"
}
```

```json
{
  "claim_id": "eval_accuracy_numbers_not_supported",
  "claim_text": "backtest",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/lib/predictions.ts",
    "src/__tests__/claim-drift.test.ts"
  ],
  "notes": "predictions.ts is heuristic. No eval set, no held-out scoring, no calibration run exists.",
  "last_verified_at": "2026-08-02"
}
```

## Tenancy

```json
{
  "claim_id": "tenancy_workspace_isolation_not_supported",
  "claim_text": "cross-tenant",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "prisma/schema.prisma",
    "README.md",
    "src/__tests__/claim-drift.test.ts"
  ],
  "notes": "No Workspace model. Isolation is per-userId row scoping. README lists multi-workspace tenancy under 'not built yet'.",
  "last_verified_at": "2026-08-02"
}
```

## Webhook delivery

```json
{
  "claim_id": "webhook_delivery_retry_not_supported",
  "claim_text": "Outbound webhook delivery retries with backoff",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/lib/webhooks.ts",
    "README.md",
    "src/__tests__/claim-drift.test.ts"
  ],
  "notes": "deliverWebhook makes a single fetch. Provider-call retry (src/lib/retry.ts) IS real and may be described as such.",
  "last_verified_at": "2026-08-02"
}
```

```json
{
  "claim_id": "webhook_signature_header",
  "claim_text": "Outbound webhooks are signed with the X-Webhook-Signature header.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/webhooks.ts",
    "src/app/integrations/page.tsx"
  ],
  "last_verified_at": "2026-08-02"
}
```

## Token lifecycle

```json
{
  "claim_id": "token_provider_revocation_not_supported",
  "claim_text": "revokes tokens on connected providers",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/app/actions/hubspot.ts",
    "src/app/actions/gmail.ts",
    "src/app/security/page.tsx"
  ],
  "notes": "disconnect* deletes the stored row immediately but never calls a provider revoke endpoint.",
  "last_verified_at": "2026-08-02"
}
```

## AI behavior

```json
{
  "claim_id": "ai_risk_recomputed_on_read",
  "claim_text": "Risk scoring is recomputed on read with auditable reasons.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/dealRisk.ts",
    "src/lib/__tests__/dealRisk.test.ts",
    "src/app/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "ai_call_sentiment_not_supported",
  "claim_text": "call sentiment",
  "status": "explicitly_not_supported",
  "evidence_paths": [
    "src/lib/competitiveSignals.ts",
    "src/app/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
}
```

## Pricing

```json
{
  "claim_id": "pricing_free_monthly",
  "claim_text": "Free plan is $0/month and covers 25 active deals.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/pricing-catalog.ts",
    "src/lib/plans.ts",
    "src/components/pricing-cards.tsx",
    "src/app/pricing/page.tsx"
  ],
  "notes": "The former $0 'starter' tier was collapsed into 'free'. Both were $0 and differed only in limits, so the pricing page advertised one allowance while new accounts received another. Legacy starter rows normalise to free via normalizeLegacyPlanType.",
  "last_verified_at": "2026-08-04"
}
```

```json
{
  "claim_id": "pricing_professional_monthly",
  "claim_text": "Professional plan is $31/month monthly billing, $20/month annual billing.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/pricing-catalog.ts",
    "src/components/pricing-cards.tsx",
    "src/app/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
}
```

```json
{
  "claim_id": "pricing_enterprise_monthly",
  "claim_text": "Enterprise plan is $85/month monthly billing, $56/month annual billing.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/pricing-catalog.ts",
    "src/components/pricing-cards.tsx",
    "src/app/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
}
```
