"use server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getOrCreateUserPlan, PLAN_MONTHLY_PRICES } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";

export type UserPlanInfo = {
  planType: PlanType;
  planName: string;
  maxDeals: number;
  maxTeamMembers: number;
  maxApiCalls: number;
  maxWebhooks: number;
  maxIntegrations: number;
  priceDisplay: string;
  isPaidPlan: boolean;
  apiCallsDisplay: string;
};

export async function getCurrentUserPlan(): Promise<UserPlanInfo | null> {
  try {
    const userId = await getAuthenticatedUserId();
    const plan = await getOrCreateUserPlan(userId);
    const planType = plan.planType as PlanType;
    const price = PLAN_MONTHLY_PRICES[planType];
    const priceDisplay =
      price === null ? "Free" : price === -1 ? "Contact us" : `$${price}`;
    const isPaidPlan = planType === "pro" || planType === "enterprise";
    const apiCallsDisplay =
      plan.maxApiCalls >= 1000
        ? `${Math.round(plan.maxApiCalls / 1000)}K`
        : String(plan.maxApiCalls);
    return {
      planType,
      planName: plan.planName,
      maxDeals: plan.maxDeals,
      maxTeamMembers: plan.maxTeamMembers,
      maxApiCalls: plan.maxApiCalls,
      maxWebhooks: plan.maxWebhooks,
      maxIntegrations: plan.maxIntegrations,
      priceDisplay,
      isPaidPlan,
      apiCallsDisplay,
    };
  } catch {
    return null;
  }
}
