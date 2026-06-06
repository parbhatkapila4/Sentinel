"use server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getOrCreateUserPlan, getUsageBundle } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";
import { formatPriceDisplayForPlan } from "@/lib/pricing-catalog";

export type CurrentUsage = Awaited<ReturnType<typeof getUsageBundle>>;

export async function getCurrentUsage(): Promise<CurrentUsage | null> {
  try {
    const userId = await getAuthenticatedUserId();
    return await getUsageBundle(userId);
  } catch (error) {
    console.error("[plans] getCurrentUsage failed", error);
    return null;
  }
}

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
    const priceDisplay = formatPriceDisplayForPlan(planType);
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
