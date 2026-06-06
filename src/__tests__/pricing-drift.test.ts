import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CANONICAL_CHECKOUT_LINKS,
  CANONICAL_PRICING,
} from "@/lib/pricing-catalog";

const pricingCards = readFileSync(
  resolve(process.cwd(), "src/components/pricing-cards.tsx"),
  "utf8"
);
const pricingPage = readFileSync(
  resolve(process.cwd(), "src/app/pricing/page.tsx"),
  "utf8"
);
const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");

describe("pricing drift", () => {
  it("canonical monthly prices match intended values", () => {
    expect(CANONICAL_PRICING.starter.monthly).toBe(0);
    expect(CANONICAL_PRICING.pro.monthly).toBe(31);
    expect(CANONICAL_PRICING.pro.annualMonthlyEquivalent).toBe(20);
    expect(CANONICAL_PRICING.enterprise.monthly).toBe(85);
    expect(CANONICAL_PRICING.enterprise.annualMonthlyEquivalent).toBe(56);
  });

  it("pricing UI consumes canonical pricing helpers (no hardcoded premium prices)", () => {
    expect(pricingCards.includes("getDisplayedPrice(\"pro\"")).toBe(true);
    expect(pricingCards.includes("getDisplayedPrice(\"enterprise\"")).toBe(true);
    expect(pricingPage.includes("PricingCards")).toBe(true);
    expect(pricingCards.includes("$31")).toBe(false);
    expect(pricingCards.includes("$20")).toBe(false);
    expect(pricingCards.includes("$85")).toBe(false);
    expect(pricingCards.includes("$56")).toBe(false);
  });

  it("checkout links in UI match canonical checkout mapping", () => {
    expect(pricingCards.includes("CANONICAL_CHECKOUT_LINKS.pro.monthly")).toBe(true);
    expect(pricingCards.includes("CANONICAL_CHECKOUT_LINKS.enterprise.monthly")).toBe(
      true
    );
  });

  it("README pricing section matches canonical pricing values", () => {
    expect(
      readme.includes("`Professional`: **$31/month** (or **$20/month** annual billing)")
    ).toBe(true);
    expect(
      readme.includes("`Enterprise`: **$85/month** (or **$56/month** annual billing)")
    ).toBe(true);
    for (const url of [
      ...Object.values(CANONICAL_CHECKOUT_LINKS.pro),
      ...Object.values(CANONICAL_CHECKOUT_LINKS.enterprise),
    ]) {
      expect(readme.includes(url)).toBe(true);
    }
  });
});
