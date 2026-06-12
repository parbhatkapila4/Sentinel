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
  "claim_id": "pricing_starter_monthly",
  "claim_text": "Starter plan is $0/month.",
  "status": "implemented",
  "evidence_paths": [
    "src/lib/pricing-catalog.ts",
    "src/components/pricing-cards.tsx",
    "src/app/pricing/page.tsx"
  ],
  "last_verified_at": "2026-04-23"
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
