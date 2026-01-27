import { prisma } from "./prisma";

export type PlanType = "free" | "starter" | "pro" | "enterprise";

export interface PlanLimits {
  maxDeals: number;
  maxTeamMembers: number;
  maxApiCalls: number;
  maxWebhooks: number;
  maxIntegrations: number;
  features: string[];
}

export interface PlanDefinition {
  planType: PlanType;
  planName: string;
  limits: PlanLimits;
}

export const PLAN_DEFINITIONS: Record<PlanType, PlanDefinition> = {
  free: {
    planType: "free",
    planName: "Free",
    limits: {
      maxDeals: 25,
      maxTeamMembers: 1,
      maxApiCalls: 100,
      maxWebhooks: 1,
      maxIntegrations: 1,
      features: [
        "basic_risk_detection",
        "email_notifications",
        "7_day_history",
      ],
    },
  },
  starter: {
    planType: "starter",
    planName: "Starter",
    limits: {
      maxDeals: 100,
      maxTeamMembers: 3,
      maxApiCalls: 1000,
      maxWebhooks: 3,
      maxIntegrations: 2,
      features: [
        "basic_risk_detection",
        "email_notifications",
        "30_day_history",
        "team_collaboration",
      ],
    },
  },
  pro: {
    planType: "pro",
    planName: "Professional",
    limits: {
      maxDeals: 500,
      maxTeamMembers: 10,
      maxApiCalls: 50000,
      maxWebhooks: 10,
      maxIntegrations: 999,
      features: [
        "advanced_risk_detection",
        "ai_recommendations",
        "unlimited_history",
        "team_collaboration",
        "priority_support",
        "advanced_analytics",
      ],
    },
  },
  enterprise: {
    planType: "enterprise",
    planName: "Enterprise",
    limits: {
      maxDeals: 999999,
      maxTeamMembers: 999999,
      maxApiCalls: 999999,
      maxWebhooks: 999999,
      maxIntegrations: 999999,
      features: [
        "custom_risk_models",
        "ai_copilots",
        "custom_integrations",
        "dedicated_support",
        "sla_guarantees",
        "on_premise_deployment",
        "custom_reporting",
      ],
    },
  },
};

export function getPlanLimits(planType: PlanType): PlanLimits {
  const plan = PLAN_DEFINITIONS[planType];
  if (!plan) {

    return PLAN_DEFINITIONS.free.limits;
  }
  return plan.limits;
}

export function getPlanDefinition(planType: PlanType): PlanDefinition {
  return PLAN_DEFINITIONS[planType] || PLAN_DEFINITIONS.free;
}

export type MetricType = "deals" | "teamMembers" | "apiCalls" | "webhooks" | "integrations";

export interface UsageCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
}


export async function getOrCreateUserPlan(userId: string) {
  let plan = await prisma.userPlan.findUnique({
    where: { userId },
  });

  if (!plan) {
    const freePlan = PLAN_DEFINITIONS.free;
    plan = await prisma.userPlan.create({
      data: {
        userId,
        planType: freePlan.planType,
        planName: freePlan.planName,
        maxDeals: freePlan.limits.maxDeals,
        maxTeamMembers: freePlan.limits.maxTeamMembers,
        maxApiCalls: freePlan.limits.maxApiCalls,
        maxWebhooks: freePlan.limits.maxWebhooks,
        maxIntegrations: freePlan.limits.maxIntegrations,
        features: freePlan.limits.features,
      },
    });
  }

  return plan;
}


function getCurrentPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { periodStart, periodEnd };
}


function getLimitField(metricType: MetricType): keyof PlanLimits {
  const mapping: Record<MetricType, keyof PlanLimits> = {
    deals: "maxDeals",
    teamMembers: "maxTeamMembers",
    apiCalls: "maxApiCalls",
    webhooks: "maxWebhooks",
    integrations: "maxIntegrations",
  };
  return mapping[metricType];
}


export async function checkUsageLimit(
  userId: string,
  metricType: MetricType
): Promise<UsageCheckResult> {
  const plan = await getOrCreateUserPlan(userId);
  const limitField = getLimitField(metricType);
  const limit = plan[limitField] as number;

  if (metricType === "deals") {
    const current = await prisma.deal.count({
      where: { userId },
    });
    return {
      allowed: current < limit,
      limit,
      current,
    };
  }

  if (metricType === "teamMembers") {
    const current = await prisma.teamMember.count({
      where: { userId },
    });
    return {
      allowed: current < limit,
      limit,
      current,
    };
  }

  const { periodStart, periodEnd } = getCurrentPeriod();
  const tracking = await prisma.usageTracking.findUnique({
    where: {
      userId_metricType_periodStart: {
        userId,
        metricType,
        periodStart,
      },
    },
  });

  const current = tracking?.currentCount ?? 0;
  return {
    allowed: current < limit,
    limit,
    current,
  };
}


export async function incrementUsage(
  userId: string,
  metricType: MetricType,
  amount: number = 1
): Promise<void> {

  if (metricType === "deals" || metricType === "teamMembers") {
    return;
  }

  const plan = await getOrCreateUserPlan(userId);
  const { periodStart, periodEnd } = getCurrentPeriod();

  await prisma.usageTracking.upsert({
    where: {
      userId_metricType_periodStart: {
        userId,
        metricType,
        periodStart,
      },
    },
    create: {
      userId,
      planId: plan.id,
      metricType,
      currentCount: amount,
      periodStart,
      periodEnd,
    },
    update: {
      currentCount: {
        increment: amount,
      },
    },
  });
}
