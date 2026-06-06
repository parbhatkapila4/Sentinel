import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadProductClaims } from "@/lib/product-claims";

const PROVIDERS = [
  "HubSpot",
  "Salesforce",
  "Google Calendar",
  "Slack",
  "Webhooks",
  "Gmail",
  "Linear",
  "Outlook",
  "Pipedrive",
] as const;

const claims = loadProductClaims();
const claimsText = claims.map((c) => c.claim_text).join("\n");
const IMPLEMENTED_PROVIDERS = new Set<string>(
  PROVIDERS.filter((p) => {
    const inClaims = new RegExp(`\\b${p}\\b`, "i").test(claimsText);
    if (!inClaims) return false;
    return claims.some(
      (c) =>
        new RegExp(`\\b${p}\\b`, "i").test(c.claim_text) &&
        (c.status === "implemented" || c.status === "planned")
    );
  })
);
const PLANNED_OR_UNIMPLEMENTED_PROVIDERS = PROVIDERS.filter((p) => {
  const inClaims = new RegExp(`\\b${p}\\b`, "i").test(claimsText);
  if (!inClaims) return false;
  return claims.some(
    (c) =>
      new RegExp(`\\b${p}\\b`, "i").test(c.claim_text) &&
      c.status === "explicitly_not_supported"
  );
});

const MARKETING_FILES = [
  "src/app/page.tsx",
  "src/app/sign-in/page.tsx",
  "src/app/features/page.tsx",
  "src/app/integrations/page.tsx",
  "src/app/changelog/page.tsx",
  "src/app/colophon/page.tsx",
  "src/app/about/page.tsx",
  "src/app/how/page.tsx",
  "src/app/resources/page.tsx",
];

const PLANNED_CONTEXT_WORDS = /roadmap|coming soon|planned|upcoming|soon/i;

describe("capability consistency", () => {
  for (const rel of MARKETING_FILES) {
    const abs = resolve(process.cwd(), rel);
    const raw = readFileSync(abs, "utf8");
    const text = raw
      .replace(/className=\{?["'`][^"'`]*["'`]\}?/g, "")
      .replace(/`[\s\S]*?`/g, " ");

    describe(rel, () => {
      for (const provider of PLANNED_OR_UNIMPLEMENTED_PROVIDERS) {
        const re = new RegExp(`\\b${provider}\\b`, "i");
        it(`does not mention unimplemented provider "${provider}" without planning context`, () => {
          if (!re.test(text)) {
            return;
          }

          const lines = text.split(/\r?\n/);
          const problematicLines = lines.filter((line) => {
            if (!re.test(line)) return false;
            return !PLANNED_CONTEXT_WORDS.test(line);
          });

          expect(
            problematicLines.length,
            `${rel} mentions "${provider}" without planning context on:\n${problematicLines.join("\n")}`
          ).toBe(0);
        });
      }

      for (const provider of IMPLEMENTED_PROVIDERS) {
        it(`can safely mention implemented provider "${provider}"`, () => {
          const re = new RegExp(`\\b${provider}\\b`, "i");
          expect(typeof re.test(text)).toBe("boolean");
        });
      }
    });
  }
});
