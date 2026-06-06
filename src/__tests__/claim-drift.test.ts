import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadProductClaims } from "@/lib/product-claims";

const MONITORED_FILES = [
  "src/app/page.tsx",
  "src/app/sign-in/page.tsx",
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
  "README.md",
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

describe("claim drift", () => {
  for (const rel of MONITORED_FILES) {
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
