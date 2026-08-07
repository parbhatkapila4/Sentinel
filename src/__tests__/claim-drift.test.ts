import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadProductClaims } from "@/lib/product-claims";

const MONITORED_DIRS = [
  "src/components/landing-new",
  "src/components/sentinel/settings",
];

const MONITORED_FILES = [
  "src/app/page.tsx",
  "src/app/sign-in/page.tsx",
  "src/app/sign-in/sign-in-client.tsx",
  "src/app/security/page.tsx",
  "src/app/integrations/page.tsx",
  "src/app/about/page.tsx",
  "src/app/features/page.tsx",
  "src/app/changelog/page.tsx",
  "src/app/colophon/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/support/page.tsx",
  "src/app/how/page.tsx",
  "src/app/resources/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/docs/page.tsx",
  "src/app/docs/developers/page.tsx",
  "src/app/terms/page.tsx",
  "src/components/pricing-cards.tsx",
  "README.md",
];

function walkTsx(dir: string): string[] {
  const abs = resolve(process.cwd(), dir);
  const out: string[] = [];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      out.push(...walkTsx(rel));
    } else if (/\.(tsx|ts|md)$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

const ALL_MONITORED = [
  ...MONITORED_FILES,
  ...MONITORED_DIRS.flatMap(walkTsx),
];

const claims = loadProductClaims();

const BANNED_PHRASES: Array<{ pattern: RegExp; why: string }> = claims
  .filter((c) => c.status === "explicitly_not_supported")
  .filter((c) => /\s|\d/.test(c.claim_text))
  .map((c) => ({
    pattern: new RegExp(c.claim_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    why: `Claim ${c.claim_id} is explicitly_not_supported in PRODUCT_CLAIMS.md`,
  }));

const CONTRADICTION_PAIRS: Array<{
  a: RegExp;
  b: RegExp;
  why: string;
}> = [
    {
      a: /(?<!\bnot\s)\bSOC\s*2\s*(?:Type\s*II\s*)?certified\b/i,
      b: /\bSOC\s*2[^\n]*roadmap\b/i,
      why: "SOC 2 certified vs SOC 2 on roadmap contradiction.",
    },
    {
      a: /\bnever\s+writes?\s+back\b/i,
      b: /\bwrites?\s+back\s+(?:risk|notes?|flags?)\b/i,
      why: "'Never writes back' vs 'writes risk back' contradiction.",
    },
  ];

const UNBACKED_CLAIM_PATTERNS: Array<{
  pattern: RegExp;
  why: string;
  unless?: RegExp;
}> = [
  {
    pattern:
      /\bsub-second\b|\bin (?:milli)?seconds\b|(?:scan|scor|sync|diagnos|analy|respon|flag|refresh|updat|deliver|authoriz|connect|complet|process|import)\w*\b[^\n]{0,30}?\b\d+(?:\.\d+)?\s*(?:ms|s)\b|\b\d+(?:\.\d+)?\s*(?:ms|s)\b[^\n]{0,30}?\b(?:scan|scor|sync|diagnos|analy|respon|flag|refresh|updat|deliver|authoriz|connect|complet|process|import)/i,
    why:
      "Latency claim. No timing code runs in production - src/lib/performance.ts::measureAsync has no call sites. " +
      "Re-allow only once a real measurement is wired up and published.",
  },
  {
    pattern: /\bbacktest|\bvalidation sample\b|\bmatch rate\b|\b\d+%\s*(?:accuracy|confidence|precision|recall)\b/i,
    why:
      "Accuracy/eval claim. There is no eval set or scored harness in the repo. " +
      "Re-allow only alongside a committed eval test that produces the number.",
  },
  {
    pattern: /\bhourly\b(?![^.]*\bnot\b)/i,
    why:
      "Sync cadence. vercel.json runs sync-integrations on '0 6 * * *' (daily). " +
      "PRODUCT_CLAIMS.md marks hourly sync explicitly_not_supported.",
  },
  {
    pattern:
      /\bcall\s+transcripts?\b|\btranscripts?\b[^\n]{0,30}\bcalls?\b|(?<!\bAPI\s)(?<!\bapi\s)\bcalls\b(?=[^\n]{0,60}\b(?:ingest|transcript|sentiment|source|analy|scan|thread|signal|mention|attende|track|email|calendar|meeting)\w*\b)|\b(?:ingest|transcript|sentiment|source|analy|scan|thread|signal|mention|attende|email|calendar|meeting)\w*\b[^\n]{0,60}?(?<!\bAPI\s)(?<!\bapi\s)\bcalls\b/i,
    why:
      "Call ingestion. No call/transcript provider is integrated; the 'call_held' branch in " +
      "competitiveSignals.ts is never written to by any code path.",
  },
  {
    pattern:
      /\bzipped?\s+archive\b|\bexport request queued\b|\barchive is ready\b|\bwe'?ll email you when\b/i,
    why:
      "Bulk/async export. There is no zip or archive export and no export queue - " +
      "/api/deals/export returns a single CSV, JSON or PDF synchronously. " +
      "Re-allow once a real archive job and its notification exist.",
  },
  {
    pattern:
      /\binvoices?\b[^\n]{0,40}\b(?:are|is|will be)\b[^\n]{0,20}\b(?:emailed|sent|generated|issued)\b|\binvoices? (?:emailed|sent|generated)\b/i,
    why:
      "Invoicing. Sentinel generates and sends nothing - there is no invoice code and no " +
      "billing email template. PayPal issues its own receipts; say that instead.",
  },
  {
    pattern:
      /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\s+(?:morning|afternoon|evening|brief)\b|\bbefore your \d{1,2}\s*(?:am|pm)\b|\bdelivered (?:every|each)\s+\w+day\b|\b(?:daily|weekly|nightly|monthly|hourly)[\s-]+(?:digest|summary|brief|roundup|report)s?\b|\b(?:digest|brief|roundup)s?\s+(?:every|each)\s+\w+\b/i,
    why:
      "Scheduled-delivery claim. No digest job exists at all - dailyDigestEmailHtml " +
      "has no caller, emailDigestFrequency is never read when sending, and no digest " +
      "cron is scheduled. Slack posts per-event alerts (deal at risk / closed won / " +
      "stage changed / CRM sync summary), not a digest. There is also no weekday or " +
      "hour scheduling and no per-user timezone column. Describe the real trigger.",
  },
  {
    pattern:
      /\bALWAYS ON\b|\b(?:can'?t|cannot|can&apos;t|won'?t)\s+be\s+(?:turned\s+off|disabled|changed|switched\s+off)\b|\byou'?ll always (?:get|receive)\b|\balways[- ]on\b/i,
    why:
      "Immutability claim about a user setting. If the row renders a <Toggle>, the " +
      "setting is a preference and this copy is false. Either remove the control " +
      "server-side and gate the field, or describe it as a preference.",
  },
  {
    pattern:
      /\bbecomes? an? (?:Manager|Superadmin|Super Admin)\b|\bManager role\b/i,
    why:
      "Role name that does not exist. TEAM_ROLES in src/lib/config.ts is " +
      "owner / admin / member / viewer. Use one of those.",
  },
  {
    pattern: /\bcross-tenant\b|\bworkspace(?:s)?\s+(?:is|are)\s+(?:fully\s+)?isolated\b/i,
    why:
      "Tenancy claim. There is no Workspace model - isolation is per-userId row scoping, " +
      "and README.md lists multi-workspace tenancy under 'not built yet'.",
  },
  {
    pattern:
      /\bretr(?:y|ies|ied)\w*\b[^\n]{0,60}\bbackoff\b|\bbackoff\b[^\n]{0,60}\bretr|\bretr(?:y|ies|ied)\b[^\n]{0,60}\b(?:webhook|delivery|deliveries|delivered|endpoint|event)s?\b|\b(?:webhook|delivery|deliveries|endpoint|event)s?\b[^\n]{0,60}\bretr(?:y|ies|ied)\b/i,
    unless:
      /\b(?:provider|upstream|external call|rate limit|5xx|circuit)\w*\b|\bno\s+retr(?:y|ies)\b|\bnot\s+retr(?:y|ied)\b|\bwithout\s+retr|\bdelivered once\b|\bsingle\b[^\n]{0,24}\battempt\b|\bsynchronous\b|\bnot built\b|\bnext step\b|\bat-least-once\b|\bcollapse\w*\s+retr|\bduplicate_event\b|\bP2002\b|\bdedup\w*\b/i,
    why:
      "Webhook retry claim. src/lib/webhooks.ts::deliverWebhook makes a single fetch with no retry. " +
      "README.md lists the durable retry queue under 'not built yet'. " +
      "(Provider-call retry in src/lib/retry.ts is real - describe that as provider retry, not webhook delivery.)",
  },
];

const LINE_LOCAL_IMPLIED_BANS: Array<{
  pattern: RegExp;
  disclaimerPattern: RegExp;
  why: string;
}> = [
    {
      pattern: /\bSOC\s*2(?:\s*Type\s*(?:II|2))?\b/i,
      disclaimerPattern:
        /\b(not|no\s+SOC|on\s+the\s+(?:2026\s+)?roadmap|roadmap|planned|coming\s+soon|target(?:ed|ing)?|preparation|preparing|aiming|considering)\b/i,
      why:
        "SOC 2 mention without an inline disclaimer reads as an active certification claim. Either remove it or qualify the same line (e.g. 'on the 2026 roadmap, not certified today').",
    },
  ];

const KNOWN_VIOLATIONS: string[] = [
  "3 deals flagged at-risk in 0.6s",
  "Pipeline scored in 2.4s",
  "Connector 'hubspot' authorized in 5.4s",
  "Sub-second sync",
  "0.6s diagnosis",
  "Score updates in seconds, scale to zero between syncs",
  "Confidence: 91% · backtest vs. 40 closed opportunities",
  "94% match rate vs. CRM primary contact (validation sample)",
  "Refresh hourly",
  "CRM + calendar + email + calls",
  "Track where competitors appear in calls and threads",
  "Sentiment trend: -0.34 over 4 calls",
  "Scanning recent calls for competitor name matches",
  "Engagement scoring: emails, meetings, and calls tracked together",
  "Workspace isolation validated · 0 cross-tenant leaks",
  "Each workspace is fully isolated",
  "Every delivery attempt is logged with its response status, retried with backoff on failure",
  "Retry failed deliveries with exponential backoff and log the full history",
  "Delivery retries with exponential backoff; every attempt logged with response code",
  "Download everything - deals, calls, emails, signals, insights - as a zipped archive.",
  "Export request queued - we'll email you when the archive is ready.",
  "Hand the account to another admin. You'll become a Manager until they confirm.",
  "Invoices are emailed on the 1st of each month.",
  "Connect your CRM, calls, email, and chat so Sentinel can read the signal",
  "flag deals when a competitor is mentioned in call transcripts, email threads",
  "Email alerts <Pill>ALWAYS ON</Pill>",
  "errors. <SerifEm>Can&apos;t be turned off.</SerifEm>",
  "Email, in-app, and Slack alerts. You'll always get risk flags - everything else is optional.",
  "A Monday morning brief - pipeline velocity, top movers, anomalies - delivered before your 9am.",
  "posts per-event alerts (risk, stage change, new deal, daily digest).",
  "filtered by event type (risk, stage change, new deal, daily digest)",
  "Weekly digest with pipeline summary, risk distribution, and top movements.",
  "posts deal-at-risk, stage-change, and daily-summary alerts back to your team.",
  "stage-change notifications, weekly digests) and account email",
  "Outbound webhooks: HMAC-SHA256 signed, with retries, delivery logs, and a 30-day history you can inspect.",
  "A real API, documented against an OpenAPI spec, with an interactive explorer. Webhooks are signed, logged, and retried.",
  "Add outbound endpoints to send deal and risk events to other tools. Signed with HMAC-SHA256 and retried on failure.",
];

const MUST_NOT_FLAG: string[] = [
  "Unlimited API calls",
  "50,000 API calls/month",
  "Activity tracking (emails & meetings)",
  "Email sentiment: negative on recent threads",
  "0.00 - 1.00 composite",
  "Risk recomputed on read",
  "Daily sync",
  "Deleting the account deletes your stored integration tokens immediately.",
  "src/lib/retry.ts retries transient upstream failures",
  "- **Provider rate limits / transient 5xx.** External calls go through retry-with-backoff and a per-provider circuit breaker",
  "Permanently delete your account and all data. This cannot be undone - no restores",
  "Deleting this team cannot be undone.",
  "Every one of these is a preference you can switch on or off at any time.",
  "CRM and calendar sync runs on a daily cron, with manual sync available.",
  "Daily integration sync with manual sync available.",
  "No digest job is scheduled, so this preference is saved but no digest email goes out.",
  "A CRM sync summary posted to Slack after a sync completes, with counts per source.",
  "Post alerts to channels the bot is in, filtered by event type (deal at risk, deal closed won, deal stage changed, CRM sync summary)",
  '.digest("hex");',
  "crypto.createHmac(\"sha256\", secret).update(baseString).digest(\"hex\");",
  "External calls go through retry-with-backoff and a per-provider circuit breaker",
  "src/lib/retry.ts retries transient upstream failures and skips retries when the circuit is already open.",
  "Persistent retries against a bad model amplify the outage.",
  "One delivery attempt per event - no retry queue yet.",
  "Each event is delivered once - there is no retry on failure yet.",
  "Delivery is a single synchronous attempt today - a durable retry queue is not built yet.",
  "- **Async webhook-delivery retry queue.** Delivery is synchronous with structured logging - sufficient at current volume; a durable retry queue is the next step when volume justifies it.",
  "- **Idempotent ingestion under at-least-once delivery.** Slack retries events; the same `event_id` can arrive several times",
  "- **Duplicate event / webhook delivery.** Unique indexes plus `P2002` handling collapse retries to a `duplicate_event` outcome with no double-write.",
];

function flagFor(line: string) {
  return UNBACKED_CLAIM_PATTERNS.find(
    (p) => p.pattern.test(line) && !(p.unless?.test(line) ?? false),
  );
}

describe("unbacked-claim guard self-test", () => {
  for (const sample of KNOWN_VIOLATIONS) {
    it(`still catches: "${sample.slice(0, 52)}"`, () => {
      expect(
        flagFor(sample) !== undefined,
        `No UNBACKED_CLAIM_PATTERNS entry matches "${sample}". ` +
        "This string shipped on the site before the honesty pass - a guard that " +
        "no longer catches it has been loosened too far.",
      ).toBe(true);
    });
  }

  for (const sample of MUST_NOT_FLAG) {
    it(`does not over-match: "${sample.slice(0, 52)}"`, () => {
      expect(
        flagFor(sample)?.pattern,
        `"${sample}" is backed by real code but was flagged. Narrow the pattern.`,
      ).toBeUndefined();
    });
  }
});

describe("claim drift", () => {
  for (const rel of ALL_MONITORED) {
    const abs = resolve(process.cwd(), rel);
    const text = readFileSync(abs, "utf8");

    describe(rel, () => {
      for (const { pattern, why } of BANNED_PHRASES) {
        it(`does not contain banned phrase: ${pattern} (${why})`, () => {
          if (/\bnot\s+/i.test(text) && /soc\s*2/i.test(String(pattern))) {
            const denied = /not\s+soc\s*2\s*(type\s*ii\s*)?certified/i.test(text);
            if (denied) return;
          }
          expect(
            pattern.test(text),
            `${rel} contains banned phrase ${pattern}: ${why}`
          ).toBe(false);
        });
      }

      for (const { pattern, why, unless } of UNBACKED_CLAIM_PATTERNS) {
        it(`makes no unbacked claim matching ${pattern}`, () => {  
          const offenders = text
            .split(/\r?\n/)
            .filter(
              (line) => pattern.test(line) && !(unless?.test(line) ?? false),
            );
          expect(
            offenders.length,
            `${rel} makes an unbacked claim matching ${pattern}.\n${why}\n` +
            offenders.map((l) => `  > ${l.trim()}`).join("\n"),
          ).toBe(0);
        });
      }

      for (const { a, b, why } of CONTRADICTION_PAIRS) {
        it(`does not contain contradictory pair ${a} vs ${b}`, () => {
          const hasA = a.test(text);
          const hasB = b.test(text);
          expect(
            hasA && hasB,
            `${rel} contains contradictory phrases ${a} AND ${b}: ${why}`
          ).toBe(false);
        });
      }

      for (const { pattern, disclaimerPattern, why } of LINE_LOCAL_IMPLIED_BANS) {
        it(`each line matching ${pattern} has an inline disclaimer`, () => {
          const lines = text.split(/\r?\n/);
          const offenders = lines.filter(
            (line) => pattern.test(line) && !disclaimerPattern.test(line)
          );
          expect(
            offenders.length,
            `${rel} has line(s) matching ${pattern} with no inline disclaimer: ${why}\n` +
            offenders.map((l) => `  > ${l.trim()}`).join("\n")
          ).toBe(0);
        });
      }
    });
  }
});
