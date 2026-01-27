import { checkUsageLimit, incrementUsage, getOrCreateUserPlan } from "./plans";
import { ForbiddenError } from "./errors";
import { prisma } from "./prisma";

export interface PlanLimitError {
  message: string;
  current: number;
  limit: number;
  metricType: string;
  upgradeUrl: string;
}


export async function enforceDealLimit(userId: string): Promise<void> {
  const usage = await checkUsageLimit(userId, "deals");

  if (!usage.allowed) {
    const plan = await getOrCreateUserPlan(userId);
    throw new ForbiddenError(
      `You've reached your plan limit of ${usage.limit} deals. You currently have ${usage.current} deals. Upgrade your plan to create more deals.`
    );
  }
}

export async function enforceTeamMemberLimit(
  userId: string,
  teamId: string
): Promise<void> {
  const userTeams = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });

  const uniqueTeamIds = [...new Set(userTeams.map((tm) => tm.teamId))];

  const totalMembers = await prisma.teamMember.count({
    where: {
      teamId: { in: uniqueTeamIds },
    },
  });

  const usage = await checkUsageLimit(userId, "teamMembers");

  if (usage.limit !== 999999 && totalMembers >= usage.limit) {
    throw new ForbiddenError(
      `You've reached your plan limit of ${usage.limit} team members across all teams. You currently have ${totalMembers} members. Upgrade your plan to add more team members.`
    );
  }
}

export async function enforceApiCallLimit(userId: string): Promise<void> {
  const usage = await checkUsageLimit(userId, "apiCalls");

  if (!usage.allowed) {
    const plan = await getOrCreateUserPlan(userId);
    throw new ForbiddenError(
      `You've reached your monthly API call limit of ${usage.limit.toLocaleString()}. You've made ${usage.current.toLocaleString()} API calls this month. Upgrade your plan for more API calls.`
    );
  }

  await incrementUsage(userId, "apiCalls", 1);
}

export async function enforceWebhookLimit(userId: string): Promise<void> {
  const usage = await checkUsageLimit(userId, "webhooks");

  if (!usage.allowed) {
    const plan = await getOrCreateUserPlan(userId);
    throw new ForbiddenError(
      `You've reached your plan limit of ${usage.limit} webhooks. You currently have ${usage.current} webhooks. Upgrade your plan to create more webhooks.`
    );
  }
}

export async function enforceIntegrationLimit(
  userId: string,
  integrationType: string
): Promise<void> {
  const usage = await checkUsageLimit(userId, "integrations");

  if (!usage.allowed) {
    const plan = await getOrCreateUserPlan(userId);
    throw new ForbiddenError(
      `You've reached your plan limit of ${usage.limit} integrations. You currently have ${usage.current} active integrations. Upgrade your plan to add more integrations.`
    );
  }
}


export function getPlanLimitError(
  metricType: string,
  current: number,
  limit: number
): PlanLimitError {
  const messages: Record<string, string> = {
    deals: `You've reached your plan limit of ${limit} deals. Upgrade to create more.`,
    teamMembers: `You've reached your plan limit of ${limit} team members. Upgrade to add more.`,
    apiCalls: `You've reached your monthly API call limit of ${limit.toLocaleString()}. Upgrade for more.`,
    webhooks: `You've reached your plan limit of ${limit} webhooks. Upgrade to create more.`,
    integrations: `You've reached your plan limit of ${limit} integrations. Upgrade to add more.`,
  };

  return {
    message: messages[metricType] || "Plan limit exceeded",
    current,
    limit,
    metricType,
    upgradeUrl: "/pricing",
  };
}
