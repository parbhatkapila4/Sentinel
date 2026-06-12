import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSource(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("usage-counter centralization", () => {
  it("plans.ts uses REAL_DEAL_WHERE for the deals counter (no inline isDemo filter)", () => {
    const src = readSource("src/lib/plans.ts");

    expect(src).toContain('from "./deal-filters"');
    expect(src).toContain("REAL_DEAL_WHERE");

    const inlineDemoFilter = /isDemo\s*:\s*false/g.exec(src);
    expect(
      inlineDemoFilter,
      "plans.ts should reference REAL_DEAL_WHERE, not inline `isDemo: false`. The inline form is how the bug got introduced last time.",
    ).toBeNull();
  });

  it("plans.ts exposes a single getUsageBundle for all metrics", () => {
    const src = readSource("src/lib/plans.ts");
    expect(src).toContain("export async function getUsageBundle");

    const bundleBody = src.split("getUsageBundle")[1] ?? "";
    for (const metric of [
      '"deals"',
      '"teamMembers"',
      '"apiCalls"',
      '"webhooks"',
      '"integrations"',
    ]) {
      expect(
        bundleBody.includes(`checkUsageLimit(userId, ${metric})`),
        `getUsageBundle must include checkUsageLimit for ${metric}`,
      ).toBe(true);
    }
  });

  it("server-action layer exposes getCurrentUsage", () => {
    const src = readSource("src/app/actions/plans.ts");
    expect(src).toContain("export async function getCurrentUsage");
    expect(src).toContain("getUsageBundle");
  });

  it("SettingsClient uses getCurrentUsage, not a local deal filter", () => {
    const src = readSource(
      "src/components/sentinel/settings/SettingsClient.tsx",
    );

    expect(src).toContain("getCurrentUsage");

    expect(
      /deals\.filter\(\s*\(\s*d\s*\)\s*=>\s*!d\.isDemo\s*\)/.test(src),
      "SettingsClient must not filter deals locally - call getCurrentUsage()",
    ).toBe(false);
  });

  it("plan-enforcement.ts trusts checkUsageLimit instead of its own count", () => {
    const src = readSource("src/lib/plan-enforcement.ts");

    expect(
      src.includes("prisma.teamMember.count") ||
      src.includes("prisma.deal.count") ||
      src.includes("prisma.webhook.count"),
      "plan-enforcement.ts must not run its own counters - call checkUsageLimit()",
    ).toBe(false);
  });

  it("deal-filters.ts exists and exports the canonical filter", () => {
    const src = readSource("src/lib/deal-filters.ts");
    expect(src).toContain("export const REAL_DEAL_WHERE");
    expect(src).toContain("export function isRealDeal");
  });
});
