import { prisma } from "./prisma";
import { CANONICAL_PRICING } from "@/lib/pricing-catalog";
import { REAL_DEAL_WHERE } from "./deal-filters";

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
      maxDeals: 5,
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
      maxDeals: 100,
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
      maxDeals: 500,
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

export const PLAN_MONTHLY_PRICES: Record<PlanType, number | null> = {
  free: CANONICAL_PRICING.free.monthly,
  starter: CANONICAL_PRICING.starter.monthly,
  pro: CANONICAL_PRICING.pro.monthly,
  enterprise: CANONICAL_PRICING.enterprise.monthly,
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
    const starterPlan = PLAN_DEFINITIONS.starter;
    plan = await prisma.userPlan.create({
      data: {
        userId,
        planType: starterPlan.planType,
        planName: starterPlan.planName,
        maxDeals: starterPlan.limits.maxDeals,
        maxTeamMembers: starterPlan.limits.maxTeamMembers,
        maxApiCalls: starterPlan.limits.maxApiCalls,
        maxWebhooks: starterPlan.limits.maxWebhooks,
        maxIntegrations: starterPlan.limits.maxIntegrations,
        features: starterPlan.limits.features,
      },
    });
  }

  return plan;
}

export async function setUserPlanByType(userId: string, planType: PlanType) {
  const definition = getPlanDefinition(planType);
  const updated = await prisma.userPlan.upsert({
    where: { userId },
    create: {
      userId,
      planType: definition.planType,
      planName: definition.planName,
      maxDeals: definition.limits.maxDeals,
      maxTeamMembers: definition.limits.maxTeamMembers,
      maxApiCalls: definition.limits.maxApiCalls,
      maxWebhooks: definition.limits.maxWebhooks,
      maxIntegrations: definition.limits.maxIntegrations,
      features: definition.limits.features,
    },
    update: {
      planType: definition.planType,
      planName: definition.planName,
      maxDeals: definition.limits.maxDeals,
      maxTeamMembers: definition.limits.maxTeamMembers,
      maxApiCalls: definition.limits.maxApiCalls,
      maxWebhooks: definition.limits.maxWebhooks,
      maxIntegrations: definition.limits.maxIntegrations,
      features: definition.limits.features,
    },
  });

  return updated;
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


const LIFETIME_PERIOD = {
  periodStart: new Date(0),
  periodEnd: new Date("9999-12-31T23:59:59Z"),
} as const;

export async function checkUsageLimit(
  userId: string,
  metricType: MetricType
): Promise<UsageCheckResult> {
  const plan = await getOrCreateUserPlan(userId);
  const limitField = getLimitField(metricType);
  const limit = plan[limitField] as number;

  if (metricType === "deals") {
    const tracking = await prisma.usageTracking.findUnique({
      where: {
        userId_metricType_periodStart: {
          userId,
          metricType: "deals",
          periodStart: LIFETIME_PERIOD.periodStart,
        },
      },
    });
    if (tracking) {
      return {
        allowed: tracking.currentCount < limit,
        limit,
        current: tracking.currentCount,
      };
    }

    const seed = await prisma.deal.count({
      where: { userId, ...REAL_DEAL_WHERE },
    });
    await prisma.usageTracking.upsert({
      where: {
        userId_metricType_periodStart: {
          userId,
          metricType: "deals",
          periodStart: LIFETIME_PERIOD.periodStart,
        },
      },
      create: {
        userId,
        planId: plan.id,
        metricType: "deals",
        currentCount: seed,
        periodStart: LIFETIME_PERIOD.periodStart,
        periodEnd: LIFETIME_PERIOD.periodEnd,
      },
      update: {},
    });
    return {
      allowed: seed < limit,
      limit,
      current: seed,
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

  const { periodStart } = getCurrentPeriod();
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

export async function getUsageBundle(userId: string): Promise<{
  deals: UsageCheckResult;
  teamMembers: UsageCheckResult;
  apiCalls: UsageCheckResult;
  webhooks: UsageCheckResult;
  integrations: UsageCheckResult;
}> {
  const [deals, teamMembers, apiCalls, webhooks, integrations] =
    await Promise.all([
      checkUsageLimit(userId, "deals"),
      checkUsageLimit(userId, "teamMembers"),
      checkUsageLimit(userId, "apiCalls"),
      checkUsageLimit(userId, "webhooks"),
      checkUsageLimit(userId, "integrations"),
    ]);
  return { deals, teamMembers, apiCalls, webhooks, integrations };
}


export async function incrementUsage(
  userId: string,
  metricType: MetricType,
  amount: number = 1
): Promise<void> {
  if (metricType === "teamMembers") {
    return;
  }

  const plan = await getOrCreateUserPlan(userId);

  if (metricType === "deals") {
    await prisma.usageTracking.upsert({
      where: {
        userId_metricType_periodStart: {
          userId,
          metricType: "deals",
          periodStart: LIFETIME_PERIOD.periodStart,
        },
      },
      create: {
        userId,
        planId: plan.id,
        metricType: "deals",
        currentCount: amount,
        periodStart: LIFETIME_PERIOD.periodStart,
        periodEnd: LIFETIME_PERIOD.periodEnd,
      },
      update: {
        currentCount: { increment: amount },
      },
    });
    return;
  }

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
