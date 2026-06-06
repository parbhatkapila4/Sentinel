import type { PlanType } from "@/lib/plans";

export type BillingCycle = "monthly" | "annual";

export type PlanPrice = {
  monthly: number | null;
  annualMonthlyEquivalent: number | null;
  annualOriginalMonthly?: number | null;
};

export const CANONICAL_PRICING: Record<PlanType, PlanPrice> = {
  free: {
    monthly: 0,
    annualMonthlyEquivalent: 0,
    annualOriginalMonthly: 0,
  },
  starter: {
    monthly: 0,
    annualMonthlyEquivalent: 0,
    annualOriginalMonthly: 0,
  },
  pro: {
    monthly: 31,
    annualMonthlyEquivalent: 20,
    annualOriginalMonthly: 31,
  },
  enterprise: {
    monthly: 85,
    annualMonthlyEquivalent: 56,
    annualOriginalMonthly: 85,
  },
};

export const CANONICAL_CHECKOUT_LINKS: Record<
  Exclude<PlanType, "free" | "starter">,
  Record<BillingCycle, string>
> = {
  pro: {
    monthly: "https://www.paypal.com/ncp/payment/VMD5RE6KLUJUE",
    annual: "https://www.paypal.com/ncp/payment/ZVFF5ALD7ZYMJ",
  },
  enterprise: {
    monthly: "https://www.paypal.com/ncp/payment/X6JYZYK6WBRBA",
    annual: "https://www.paypal.com/ncp/payment/RD8DBKTWRS8EY",
  },
};

export function formatPriceDisplayForPlan(planType: PlanType): string {
  if (planType === "free" || planType === "starter") return "Free";
  if (planType === "enterprise") return "Contact us";
  return `$${CANONICAL_PRICING[planType].monthly}`;
}

export function getDisplayedPrice(planType: PlanType, isAnnual: boolean): string {
  const price = CANONICAL_PRICING[planType];
  const value = isAnnual ? price.annualMonthlyEquivalent : price.monthly;
  if (value === null) return "Contact us";
  return `$${value}`;
}

export function getDisplayedOriginalPrice(
  planType: PlanType,
  isAnnual: boolean
): string | null {
  if (!isAnnual) return null;
  const value = CANONICAL_PRICING[planType].annualOriginalMonthly ?? null;
  return value === null ? null : `$${value}`;
}
