import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadProductClaims } from "@/lib/product-claims";

const PUBLIC_FILES = [
  "src/app/page.tsx",
  "src/app/sign-in/page.tsx",
  "src/app/security/page.tsx",
  "src/app/integrations/page.tsx",
  "src/app/about/page.tsx",
  "src/app/features/page.tsx",
  "src/app/changelog/page.tsx",
  "src/app/colophon/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/how/page.tsx",
  "src/app/resources/page.tsx",
  "src/app/docs/page.tsx",
  "README.md",
];

const ROADMAP_WORDS = /\broadmap|planned|coming soon|upcoming|not yet\b/i;

const HIGH_RISK_PHRASES = [
  "SOC 2",
  "read-only",
  "writes back",
  "OAuth",
  "API key",
  "webhook",
  "daily cron",
  "hourly",
  "HubSpot",
  "Salesforce",
  "Google Calendar",
  "Slack",
  "Gmail",
  "Linear",
  "$31",
  "$20",
  "$85",
  "$56",
];

describe("claims registry coverage", () => {
  const claims = loadProductClaims();
  const claimsText = claims.map((c) => c.claim_text).join("\n");

  it("each implemented/planned claim is represented in at least one public file", () => {
    const corpus = PUBLIC_FILES.map((p) =>
      readFileSync(resolve(process.cwd(), p), "utf8")
    ).join("\n");

    const missing = claims
      .filter((c) => c.status === "implemented" || c.status === "planned")
      .filter((c) => {
        const tokens = c.claim_text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((t) => t.length >= 4);
        const matched = tokens.filter((t) =>
          corpus.toLowerCase().includes(t)
        ).length;
        return matched < Math.min(3, tokens.length);
      });

    expect(
      missing,
      `Claims in PRODUCT_CLAIMS.md not represented in public copy: ${missing
        .map((m) => m.claim_id)
        .join(", ")}`
    ).toEqual([]);
  });

  for (const rel of PUBLIC_FILES) {
    const text = readFileSync(resolve(process.cwd(), rel), "utf8");
    describe(rel, () => {
      for (const phrase of HIGH_RISK_PHRASES) {
        it(`claim phrase "${phrase}" is represented in PRODUCT_CLAIMS.md (or explicitly roadmap wording)`, () => {
          const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          if (!re.test(text)) {
            return;
          }

          const lineHits = text
            .split(/\r?\n/)
            .filter((line) => re.test(line))
            .filter((line) => !ROADMAP_WORDS.test(line));
          if (lineHits.length === 0) {
            return;
          }

          const covered = claimsText.toLowerCase().includes(phrase.toLowerCase());
          expect(
            covered,
            `Public phrase "${phrase}" appears in ${rel} but is not represented in PRODUCT_CLAIMS.md`
          ).toBe(true);
        });
      }
    });
  }
});
