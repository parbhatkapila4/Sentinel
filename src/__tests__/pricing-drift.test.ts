import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CANONICAL_CHECKOUT_LINKS,
  CANONICAL_PRICING,
} from "@/lib/pricing-catalog";
import { PLAN_DEFINITIONS } from "@/lib/plans";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

const pricingCards = read("src/components/pricing-cards.tsx");
const pricingPage = read("src/app/pricing/page.tsx");
const readme = read("README.md");

describe("pricing drift", () => {
  it("canonical monthly prices match intended values", () => {
    expect(CANONICAL_PRICING.free.monthly).toBe(0);
    expect(CANONICAL_PRICING.pro.monthly).toBe(31);
    expect(CANONICAL_PRICING.pro.annualMonthlyEquivalent).toBe(20);
    expect(CANONICAL_PRICING.enterprise.monthly).toBe(85);
    expect(CANONICAL_PRICING.enterprise.annualMonthlyEquivalent).toBe(56);
  });

  it("pricing UI consumes canonical pricing helpers (no hardcoded premium prices)", () => {
    expect(pricingCards.includes('getDisplayedPrice("pro"')).toBe(true);
    expect(pricingCards.includes('getDisplayedPrice("enterprise"')).toBe(true);
    expect(pricingPage.includes("PricingCards")).toBe(true);
    expect(pricingCards.includes("$31")).toBe(false);
    expect(pricingCards.includes("$20")).toBe(false);
    expect(pricingCards.includes("$85")).toBe(false);
    expect(pricingCards.includes("$56")).toBe(false);
  });

  it("checkout links in UI match canonical checkout mapping", () => {
    expect(pricingCards.includes("CANONICAL_CHECKOUT_LINKS.pro.monthly")).toBe(
      true,
    );
    expect(
      pricingCards.includes("CANONICAL_CHECKOUT_LINKS.enterprise.monthly"),
    ).toBe(true);
  });
  it("exactly one $0 tier exists", () => {
    const zeroTiers = Object.entries(CANONICAL_PRICING)
      .filter(([, price]) => price.monthly === 0)
      .map(([name]) => name);
    expect(
      zeroTiers,
      "Two $0 tiers is how the 5-vs-25 deal contradiction happened.",
    ).toEqual(["free"]);
  });

  it("no surface still references the retired starter tier", () => {
    const surfaces: Array<[string, string]> = [
      ["src/components/pricing-cards.tsx", pricingCards],
      ["src/app/pricing/page.tsx", pricingPage],
      ["README.md", readme],
    ];
    for (const [name, text] of surfaces) {
      expect(
        /\bstarter\b/i.test(text),
        `${name} still names the retired "starter" tier.`,
      ).toBe(false);
    }
  });

  it("the free-tier deal allowance is quoted identically everywhere", () => {
    const freeMaxDeals = PLAN_DEFINITIONS.free.limits.maxDeals;
    expect(freeMaxDeals).toBe(25);

    const surfaces: Array<[string, string]> = [
      ["pricing card", pricingCards],
      ["pricing page", pricingPage],
      [
        "landing final CTA",
        read("src/components/landing-new/sections/FinalCTA.tsx"),
      ],
      ["sign-in panel", read("src/app/sign-in/sign-in-client.tsx")],
    ];
    for (const [name, text] of surfaces) {
      expect(
        text.includes(String(freeMaxDeals)),
        `${name} does not quote the real free-tier allowance (${freeMaxDeals} deals).`,
      ).toBe(true);
    }
  });

  it("README pricing section matches canonical pricing values", () => {
    expect(
      readme.includes(
        "`Professional`: **$31/month** (or **$20/month** annual billing)",
      ),
    ).toBe(true);
    expect(
      readme.includes(
        "`Enterprise`: **$85/month** (or **$56/month** annual billing)",
      ),
    ).toBe(true);
    for (const url of [
      ...Object.values(CANONICAL_CHECKOUT_LINKS.pro),
      ...Object.values(CANONICAL_CHECKOUT_LINKS.enterprise),
    ]) {
      expect(readme.includes(url)).toBe(true);
    }
  });
});
