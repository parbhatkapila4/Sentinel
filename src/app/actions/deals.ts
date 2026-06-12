"use server";

import { unstable_noStore, revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { logInfo, logWarn } from "@/lib/logger";
import { withErrorContext } from "@/lib/error-context";
import {
  STAGE_PRIORITY_FOR_RISK,
  STAGES,
  TEAM_ROLES,
  normalizeStage,
  normalizeChannel,
} from "@/lib/config";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appendDealTimeline } from "@/lib/timeline";
import {
  triggerStageChangeNotification,
} from "@/lib/notification-triggers";
import { dispatchWebhookEvent } from "@/lib/webhooks";
import {
  sendSlackNotification,
  formatDealWonSlackMessage,
  formatStageChangeSlackMessage,
} from "@/lib/slack";
import { removeDemoDataForUser, hasDemoData, seedDemoDataForUser } from "@/lib/demo-data";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";
import { getUserTeamRole } from "@/lib/team-utils";
import { enforceDealLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";
import { withCache, invalidateCachePattern, invalidateCache } from "@/lib/cache";
import type { GetDealsOptions } from "@/types";
import { notifyRealtimeEvent } from "@/lib/realtime";
import { incrementMetric } from "@/lib/business-metrics";
import {
  assertRiskFieldIntegrity,
  buildRiskSettingsMap,
  buildTimelineByDealId,
  computeDealRiskSnapshot,
} from "@/lib/deal-risk-enrichment";
import { runDealStageRiskSideEffects } from "@/lib/deal-stage-side-effects";

const MAX_DEAL_VALUE = 20_000_000_000;

function toDealValueNumber(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value;
}

export async function canUserAccessDeal(
  userId: string,
  deal: { userId: string; teamId: string | null }
): Promise<boolean> {
  if (deal.userId === userId) return true;
  if (!deal.teamId) return false;
  const role = await getUserTeamRole(userId, deal.teamId);
  return role !== null;
}

export async function canUserEditDeal(
  userId: string,
  deal: { userId: string; teamId: string | null }
): Promise<boolean> {
  if (deal.userId === userId) return true;
  if (!deal.teamId) return false;
  const role = await getUserTeamRole(userId, deal.teamId);
  if (!role) return false;
  return role !== TEAM_ROLES.VIEWER;
}

export async function createDeal(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "create_deal" },
    async () => {
      const name = ((formData.get("name") as string) ?? "").trim();
      const stage = formData.get("stage") as string;
      const rawValue = parseInt(formData.get("value") as string, 10);
      const location = (formData.get("location") as string) || null;
      const teamId = (formData.get("teamId") as string) || null;
      const assignedToId = (formData.get("assignedToId") as string) || null;
      const rawChannel = (formData.get("channel") as string) || null;
      const channel = rawChannel ? normalizeChannel(rawChannel) : null;
      if (rawChannel && !channel) {
        throw new ValidationError("Invalid channel value", {
          channel: "Pick one of the listed channels",
        });
      }

      if (!name || !stage || isNaN(rawValue)) {
        const errors: Record<string, string> = {};
        if (!name) errors.name = "Required";
        if (!stage) errors.stage = "Required";
        if (isNaN(rawValue)) errors.value = "Required";
        throw new ValidationError("Missing required fields", errors);
      }
      if (rawValue <= 0) {
        throw new ValidationError("Deal value must be greater than 0", {
          value: "Must be greater than 0",
        });
      }
      if (rawValue > MAX_DEAL_VALUE) {
        throw new ValidationError(
          `Deal value cannot exceed $${MAX_DEAL_VALUE.toLocaleString("en-US")} (20 billion).`,
          { value: "Exceeds maximum allowed amount" }
        );
      }
      const value = BigInt(rawValue);

      const canonicalStage = normalizeStage(stage);
      if (!canonicalStage) {
        throw new ValidationError("Invalid stage value", { stage: "Invalid" });
      }

      const duplicate = await prisma.deal.findFirst({
        where: {
          userId,
          name: { equals: name, mode: "insensitive" },
        },
        select: { id: true, name: true },
      });
      if (duplicate) {
        throw new ValidationError(
          `A deal named "${duplicate.name}" already exists. Please choose a different name.`,
          { name: "Already in use - choose a different name" }
        );
      }

      await enforceDealLimit(userId);

      if (teamId) {
        const role = await getUserTeamRole(userId, teamId);
        if (!role) throw new ForbiddenError("You are not a member of this team");
      }

      const deal = await prisma.deal.create({
        data: {
          userId,
          name,
          stage: canonicalStage,
          value,
          location,
          ...(channel && { channel }),
          ...(teamId && { teamId }),
          ...(assignedToId && { assignedToId }),
        },
      });

      await incrementUsage(userId, "deals");

      await appendDealTimeline(deal.id, "stage_changed", {
        stage: canonicalStage,
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);

      try {
        await dispatchWebhookEvent(userId, teamId, "deal.created", {
          id: deal.id,
          name: deal.name,
          value: toDealValueNumber(deal.value),
          stage: deal.stage,
        });
      } catch (e) {
        logWarn("Webhook dispatch failed", {
          userId,
          dealId: deal.id,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      logInfo("Deal created successfully", {
        userId,
        dealId: deal.id,
        name: deal.name,
        stage: deal.stage,
        value: toDealValueNumber(deal.value),
      });

      void incrementMetric("deal_created");

      try {
        await notifyRealtimeEvent(userId, { type: "deal.created", dealId: deal.id });
      } catch (err) {
        logWarn("Failed to publish realtime event for deal.created", {
          userId,
          dealId: deal.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { hasCreatedAnyDeal: true },
      });

      const hadDemo = await hasDemoData(userId);
      if (hadDemo) {
        await removeDemoDataForUser(userId);
        await invalidateCachePattern(`deals:all:${userId}:*`);
        await invalidateCachePattern(`deals:team:*:${userId}`);
      }

      revalidatePath("/dashboard");
      revalidatePath("/deals");
      if (teamId) revalidatePath(`/teams/${teamId}`);

      const timeline = await prisma.dealTimeline.findMany({
        where: { dealId: deal.id },
        orderBy: { createdAt: "desc" },
      });

      const riskSettingsMap = await buildRiskSettingsMap([deal.userId]);
      const riskSettings = riskSettingsMap.get(deal.userId);

      const riskSnapshot = computeDealRiskSnapshot(
        {
          id: deal.id,
          userId: deal.userId,
          stage: deal.stage,
          value: toDealValueNumber(deal.value),
          createdAt: deal.createdAt,
        },
        timeline.map((e) => ({
          dealId: deal.id,
          eventType: e.eventType,
          createdAt: e.createdAt,
          metadata: e.metadata,
        })),
        riskSettings ?? undefined
      );

      return {
        id: deal.id,
        userId: deal.userId,
        teamId: deal.teamId,
        assignedToId: deal.assignedToId,
        name: deal.name,
        stage: deal.stage,
        value: toDealValueNumber(deal.value),
        ...riskSnapshot,
        createdAt: deal.createdAt,
      };
    }
  );
}

export async function getAllDeals(options?: GetDealsOptions) {
  unstable_noStore();
  const userId = await getAuthenticatedUserId();

  await seedDemoDataForUser(userId);

  const cacheKey = `deals:all:${userId}:${JSON.stringify(options ?? {})}`;

  return withCache(cacheKey, 60, async () => {
    let where: Prisma.DealWhereInput = { userId };

    if (options?.teamId) {
      const role = await getUserTeamRole(userId, options.teamId);
      if (!role) throw new ForbiddenError("You are not a member of this team");
      where = { teamId: options.teamId };
    } else if (options?.includeTeamDeals) {
      const memberships = await prisma.teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      });
      const teamIds = memberships.map((m) => m.teamId);
      where = {
        OR: [
          { userId },
          ...(teamIds.length ? [{ teamId: { in: teamIds } }] : []),
        ],
      };
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        teamId: true,
        assignedToId: true,
        name: true,
        stage: true,
        value: true,
        location: true,
        channel: true,
        isDemo: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true, surname: true } },
      },
    });

    const hasRealDeals = deals.some((d) => !d.isDemo);
    const visibleDeals = hasRealDeals
      ? deals.filter((d) => !d.isDemo)
      : deals;

    const dealIds = visibleDeals.map((d) => d.id);
    const allTimelineEvents = await prisma.dealTimeline.findMany({
      where: { dealId: { in: dealIds } },
      orderBy: { createdAt: "desc" },
    });

    const timelineByDealId = buildTimelineByDealId(
      allTimelineEvents as Array<{
        dealId: string;
        eventType: string;
        createdAt: Date | null;
        metadata: unknown;
      }>
    );

    const uniqueUserIds = [...new Set(visibleDeals.map((d) => d.userId))];
    const riskSettingsMap = await buildRiskSettingsMap(uniqueUserIds);

    return visibleDeals.map((deal) => {
      assertRiskFieldIntegrity(deal);

      const dealTimeline = timelineByDealId.get(deal.id) ?? [];

      const userRiskSettings = riskSettingsMap.get(deal.userId);
      const riskSnapshot = computeDealRiskSnapshot(
        {
          id: deal.id,
          userId: deal.userId,
          stage: deal.stage,
          value: toDealValueNumber(deal.value),
          createdAt: deal.createdAt,
        },
        dealTimeline as Array<{
          dealId: string;
          eventType: string;
          createdAt: Date | null;
          metadata: unknown;
        }>,
        userRiskSettings
      );

      const dealWithExtras = deal as typeof deal & { channel?: string | null };
      return {
        id: deal.id,
        userId: deal.userId,
        teamId: deal.teamId,
        assignedToId: deal.assignedToId,
        assignedTo: deal.assignedTo
          ? { id: deal.assignedTo.id, name: deal.assignedTo.name, surname: deal.assignedTo.surname }
          : null,
        name: deal.name,
        stage: deal.stage,
        value: toDealValueNumber(deal.value),
        location: deal.location,
        channel: dealWithExtras.channel ?? null,
        isDemo: deal.isDemo,
        ...riskSnapshot,
        createdAt: deal.createdAt,
      };
    });
  });
}

export async function getTeamDeals(teamId: string) {
  unstable_noStore();
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  if (!role) throw new ForbiddenError("You are not a member of this team");

  const cacheKey = `deals:team:${teamId}:${userId}`;
  return withCache(cacheKey, 60, async () => {
    const deals = await prisma.deal.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        teamId: true,
        assignedToId: true,
        name: true,
        stage: true,
        value: true,
        isDemo: true,
        createdAt: true,
        assignedTo: {
          select: { id: true, name: true, surname: true, email: true },
        },
      },
    });

    const hasRealDeals = deals.some((d) => !d.isDemo);
    const visibleDeals = hasRealDeals
      ? deals.filter((d) => !d.isDemo)
      : deals;

    const dealIds = visibleDeals.map((d) => d.id);
    const allTimelineEvents = await prisma.dealTimeline.findMany({
      where: { dealId: { in: dealIds } },
      orderBy: { createdAt: "desc" },
    });

    const timelineByDealId = buildTimelineByDealId(
      allTimelineEvents as Array<{
        dealId: string;
        eventType: string;
        createdAt: Date | null;
        metadata: unknown;
      }>
    );

    const uniqueUserIds = [...new Set(visibleDeals.map((d) => d.userId))];
    const riskSettingsMap = await buildRiskSettingsMap(uniqueUserIds);

    return visibleDeals.map((deal) => {
      assertRiskFieldIntegrity(deal);
      const dealTimeline = timelineByDealId.get(deal.id) ?? [];
      const userRiskSettings = riskSettingsMap.get(deal.userId);
      const riskSnapshot = computeDealRiskSnapshot(
        {
          id: deal.id,
          userId: deal.userId,
          stage: deal.stage,
          value: toDealValueNumber(deal.value),
          createdAt: deal.createdAt,
        },
        dealTimeline as Array<{
          dealId: string;
          eventType: string;
          createdAt: Date | null;
          metadata: unknown;
        }>,
        userRiskSettings ?? undefined
      );

      return {
        id: deal.id,
        userId: deal.userId,
        teamId: deal.teamId,
        assignedToId: deal.assignedToId,
        name: deal.name,
        stage: deal.stage,
        value: toDealValueNumber(deal.value),
        isDemo: deal.isDemo,
        ...riskSnapshot,
        createdAt: deal.createdAt,
        assignedTo: deal.assignedTo,
      };
    });
  });
}

export async function getDealById(dealId: string) {
  const userId = await getAuthenticatedUserId();

  const cacheKey = `deal:${dealId}:${userId}`;
  return withCache(cacheKey, 30, async () => {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        team: true,
        assignedTo: {
          select: { id: true, name: true, surname: true, email: true },
        },
      },
    });

    if (!deal) throw new NotFoundError("Deal");

    const canAccess = await canUserAccessDeal(userId, deal);
    if (!canAccess) throw new ForbiddenError("You do not have access to this deal");

    const timeline = await prisma.dealTimeline.findMany({
      where: { dealId: deal.id },
      orderBy: { createdAt: "desc" },
    });

    const riskSnapshot = computeDealRiskSnapshot(
      {
        id: deal.id,
        userId: deal.userId,
        stage: deal.stage,
        value: toDealValueNumber(deal.value),
        createdAt: deal.createdAt,
      },
      timeline.map((e) => ({
        dealId: deal.id,
        eventType: e.eventType,
        createdAt: e.createdAt,
        metadata: e.metadata,
      }))
    );

    const events = await prisma.dealEvent.findMany({
      where: { dealId: deal.id },
      orderBy: { createdAt: "desc" },
    });

    const dealWithSource = deal as typeof deal & {
      source?: string | null;
      channel?: string | null;
      externalId?: string | null;
    };

    return {
      id: deal.id,
      userId: deal.userId,
      teamId: deal.teamId,
      assignedToId: deal.assignedToId,
      name: deal.name,
      stage: deal.stage,
      value: toDealValueNumber(deal.value),
      source: dealWithSource.source ?? null,
      channel: dealWithSource.channel ?? null,
      externalId: dealWithSource.externalId ?? null,
      ...riskSnapshot,
      createdAt: deal.createdAt,
      isDemo: deal.isDemo,
      events,
      timeline,
      team: deal.team ?? undefined,
      assignedTo: deal.assignedTo ?? undefined,
    };
  });
}

export async function deleteDeal(dealId: string) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "delete_deal", dealId },
    async () => {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");

      const canEdit = await canUserEditDeal(userId, deal);
      if (!canEdit) throw new ForbiddenError("You cannot delete this deal");

      if (deal.isDemo) throw new ValidationError("Cannot delete demo deals; they are removed when you add your first real deal.");

      await prisma.dealTimeline.deleteMany({ where: { dealId } });
      await prisma.dealEvent.deleteMany({ where: { dealId } });
      await prisma.action.deleteMany({ where: { dealId } });
      await prisma.deal.delete({ where: { id: dealId } });
      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      const remainingCount = await prisma.deal.count({ where: { userId } });
      if (remainingCount === 0) {
        try {
          await seedDemoDataForUser(userId);
          await invalidateCachePattern(`deals:all:${userId}:*`);
          await invalidateCachePattern(`deals:team:*:${userId}`);
        } catch (error) {
          const errMessage =
            error instanceof Error ? error.message : String(error);
          logWarn("Failed to seed demo data after deleting deal", {
            userId,
            dealId,
            error: errMessage,
          });
        }
      }

      revalidatePath("/dashboard");
      revalidatePath("/deals");
      revalidatePath(`/deals/${dealId}`);
      if (deal.teamId) revalidatePath(`/teams/${deal.teamId}`);

      try {
        await notifyRealtimeEvent(userId, { type: "deal.deleted", dealId });
      } catch (err) {
        logWarn("Failed to publish realtime event for deal.deleted", {
          userId,
          dealId,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      logInfo("Deal deleted", { userId, dealId, dealName: deal.name });

      return { success: true };
    }
  );
}

export async function updateDealStage(dealId: string, newStage: string) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "update_deal_stage", dealId },
    async () => {
      const canonicalNewStage = normalizeStage(newStage);
      if (!canonicalNewStage) {
        throw new ValidationError("Invalid stage value", { stage: "Invalid" });
      }

      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");

      const canEdit = await canUserEditDeal(userId, deal);
      if (!canEdit) throw new ForbiddenError("You cannot edit this deal");

      const oldStage = deal.stage;

      logInfo("Updating deal stage", {
        userId,
        dealId,
        oldStage,
        newStage: canonicalNewStage,
      });

      await prisma.deal.update({
        where: { id: dealId },
        data: { stage: canonicalNewStage },
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      await appendDealTimeline(dealId, "stage_changed", {
        stage: canonicalNewStage,
      });

      revalidatePath(`/deals/${dealId}`);
      revalidatePath("/dashboard");
      if (deal.teamId) revalidatePath(`/teams/${deal.teamId}`);

      try {
        if (oldStage !== canonicalNewStage) {
          await triggerStageChangeNotification(
            { id: deal.id, name: deal.name, userId: deal.userId },
            oldStage,
            canonicalNewStage
          );
          await dispatchWebhookEvent(userId, deal.teamId, "deal.stage_changed", {
            id: deal.id,
            name: deal.name,
            oldStage,
            newStage: canonicalNewStage,
          });
          await sendSlackNotification(
            userId,
            deal.teamId,
            "deal.stage_changed",
            formatStageChangeSlackMessage({
              name: deal.name,
              value: toDealValueNumber(deal.value),
              oldStage,
              newStage: canonicalNewStage,
            })
          );
        }
        if (canonicalNewStage === "closed_won") {
          logInfo("Deal closed won", {
            userId,
            dealId: deal.id,
            dealName: deal.name,
            value: toDealValueNumber(deal.value),
          });
          await dispatchWebhookEvent(userId, deal.teamId, "deal.closed_won", {
            id: deal.id,
            name: deal.name,
            value: toDealValueNumber(deal.value),
          });
          await sendSlackNotification(
            userId,
            deal.teamId,
            "deal.closed_won",
            formatDealWonSlackMessage({
              name: deal.name,
              value: toDealValueNumber(deal.value),
            })
          );
        }
        await runDealStageRiskSideEffects({
          dealId,
          userId,
          teamId: deal.teamId,
          loadEnrichedDeal: () => getDealById(dealId),
        });
      } catch (e) {
        logWarn("Notification triggers failed", {
          userId,
          dealId,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      logInfo("Deal stage updated successfully", {
        userId,
        dealId,
        oldStage,
        newStage: canonicalNewStage,
      });
    }
  );
}

export async function assignDeal(
  dealId: string,
  assignedToId: string | null
) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "assign_deal", dealId },
    async () => {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");
      if (!deal.teamId) throw new ForbiddenError("Deal must belong to a team");

      const myRole = await getUserTeamRole(userId, deal.teamId);
      if (!myRole) throw new ForbiddenError("You are not a member of this team");
      if (myRole !== "owner" && myRole !== "admin") {
        throw new ForbiddenError("Only owners and admins can assign deals");
      }

      if (assignedToId) {
        const assigneeMembership = await prisma.teamMember.findUnique({
          where: { userId_teamId: { userId: assignedToId, teamId: deal.teamId } },
        });
        if (!assigneeMembership) {
          throw new ForbiddenError("Assignee must be a member of the team");
        }
      }

      logInfo("Assigning deal", {
        userId,
        dealId,
        assignedToId,
        teamId: deal.teamId,
      });

      await prisma.deal.update({
        where: { id: dealId },
        data: { assignedToId },
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      await appendDealTimeline(dealId, "activity", {
        type: "assignment_changed",
        assignedToId,
      });

      revalidatePath(`/deals/${dealId}`);
      revalidatePath(`/teams/${deal.teamId}`);
      revalidatePath("/dashboard");
    }
  );
}

export async function moveDealToTeam(dealId: string, teamId: string) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "move_deal_to_team", dealId, teamId },
    async () => {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");
      if (deal.userId !== userId) throw new ForbiddenError("You do not own this deal");
      if (deal.teamId) throw new ForbiddenError("Deal is already a team deal");

      const role = await getUserTeamRole(userId, teamId);
      if (!role) throw new ForbiddenError("You are not a member of this team");

      logInfo("Moving deal to team", {
        userId,
        dealId,
        teamId,
      });

      await prisma.deal.update({
        where: { id: dealId },
        data: { teamId },
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      await appendDealTimeline(dealId, "activity", {
        type: "moved_to_team",
        teamId,
      });

      revalidatePath(`/deals/${dealId}`);
      revalidatePath(`/teams/${teamId}`);
      revalidatePath("/dashboard");
    }
  );
}

export async function moveDealToPersonal(dealId: string) {
  const userId = await getAuthenticatedUserId();

  return await withErrorContext(
    { userId, actionType: "move_deal_to_personal", dealId },
    async () => {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");
      if (!deal.teamId) throw new ForbiddenError("Deal is not a team deal");

      const myRole = await getUserTeamRole(userId, deal.teamId);
      if (!myRole) throw new ForbiddenError("You are not a member of this team");
      if (myRole !== "owner" && myRole !== "admin") {
        throw new ForbiddenError("Only owners and admins can move deals to personal");
      }

      logInfo("Moving deal to personal", {
        userId,
        dealId,
        previousTeamId: deal.teamId,
      });

      await prisma.deal.update({
        where: { id: dealId },
        data: { teamId: null, assignedToId: null, userId },
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      await appendDealTimeline(dealId, "activity", {
        type: "moved_to_personal",
      });

      revalidatePath(`/deals/${dealId}`);
      revalidatePath(`/teams/${deal.teamId}`);
      revalidatePath("/dashboard");
    }
  );
}

export async function getFounderRiskOverview(teamId?: string) {
  unstable_noStore();
  const userId = await getAuthenticatedUserId();
  const cacheKey = `deals:risk:overview:${userId}:${teamId ?? "personal"}`;

  return withCache(cacheKey, 60, async () => {
    const deals = await getAllDeals(
      teamId ? { teamId } : undefined
    );

    const totalDeals = deals.length;
    const atRiskDealsCount = deals.filter((d) => d.status === "at_risk").length;
    const overdueDealsCount = deals.filter((d) => d.isActionOverdue).length;
    const highUrgencyDealsCount = deals.filter(
      (d) => d.recommendedAction?.urgency === "high"
    ).length;
    const dealsOverdueMoreThan3Days = deals.filter(
      (d) => d.actionOverdueByDays !== null && d.actionOverdueByDays > 3
    ).length;

    const criticalDeals = deals
      .filter((d) => d.status === "at_risk" && d.recommendedAction)
      .sort((a, b) => {
        if (a.isActionOverdue !== b.isActionOverdue) {
          return a.isActionOverdue ? -1 : 1;
        }
        const aOverdue = a.actionOverdueByDays ?? 0;
        const bOverdue = b.actionOverdueByDays ?? 0;
        if (aOverdue !== bOverdue) {
          return bOverdue - aOverdue;
        }
        return b.riskScore - a.riskScore;
      })
      .slice(0, 3)
      .map((deal) => ({
        id: deal.id,
        name: deal.name,
        riskLevel: deal.riskLevel,
        primaryRiskReason: deal.primaryRiskReason,
        recommendedAction: deal.recommendedAction,
        actionOverdueByDays: deal.actionOverdueByDays,
      }));

    return {
      totalDeals,
      atRiskDealsCount,
      overdueDealsCount,
      highUrgencyDealsCount,
      dealsOverdueMoreThan3Days,
      top3MostCriticalDeals: criticalDeals,
    };
  });
}

export async function getDealCountsByCountry() {
  unstable_noStore();
  const userId = await getAuthenticatedUserId();
  const cacheKey = `deals:counts:country:active:${userId}`;
  return withCache(cacheKey, 120, async () => {
    const hasRealDeals = await prisma.deal.count({
      where: { userId, isDemo: false },
    });

    const deals = await prisma.deal.findMany({
      where: {
        userId,
        ...(hasRealDeals > 0 ? { isDemo: false } : {}),
        stage: { notIn: [STAGES.CLOSED_WON, STAGES.CLOSED_LOST, "closed"] },
      },
      select: { location: true },
    });

    const countryCounts = new Map<string, number>();

    for (const deal of deals) {
      if (deal.location) {
        const count = countryCounts.get(deal.location) || 0;
        countryCounts.set(deal.location, count + 1);
      }
    }

    const result = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    return result;
  });
}

export async function getFounderActionQueue(teamId?: string) {
  unstable_noStore();
  const userId = await getAuthenticatedUserId();
  const cacheKey = `deals:action:queue:${userId}:${teamId ?? "personal"}`;

  return withCache(cacheKey, 60, async () => {
    const deals = await getAllDeals(
      teamId ? { teamId } : undefined
    );

    const urgent: typeof deals = [];
    const important: typeof deals = [];
    const safe: typeof deals = [];

    for (const deal of deals) {
      if (
        deal.status === "at_risk" &&
        (deal.isActionOverdue || deal.recommendedAction?.urgency === "high")
      ) {
        urgent.push(deal);
      } else if (deal.status === "at_risk") {
        important.push(deal);
      } else if (deal.status === "active") {
        safe.push(deal);
      }
    }

    urgent.sort((a, b) => {
      if (a.isActionOverdue !== b.isActionOverdue) {
        return a.isActionOverdue ? -1 : 1;
      }
      const aOverdue = a.actionOverdueByDays ?? 0;
      const bOverdue = b.actionOverdueByDays ?? 0;
      if (aOverdue !== bOverdue) {
        return bOverdue - aOverdue;
      }
      return b.riskScore - a.riskScore;
    });

    important.sort((a, b) => b.riskScore - a.riskScore);

    safe.sort((a, b) => {
      const aPriority = STAGE_PRIORITY_FOR_RISK[a.stage] ?? 0;
      const bPriority = STAGE_PRIORITY_FOR_RISK[b.stage] ?? 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return (
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
      );
    });

    return {
      urgent: urgent.slice(0, 5).map((deal) => ({
        id: deal.id,
        name: deal.name,
        stage: deal.stage,
        riskLevel: deal.riskLevel,
        primaryRiskReason: deal.primaryRiskReason,
        recommendedAction: deal.recommendedAction,
        isActionOverdue: deal.isActionOverdue,
        actionOverdueByDays: deal.actionOverdueByDays,
      })),
      important: important.slice(0, 5).map((deal) => ({
        id: deal.id,
        name: deal.name,
        stage: deal.stage,
        riskLevel: deal.riskLevel,
        primaryRiskReason: deal.primaryRiskReason,
        recommendedAction: deal.recommendedAction,
        isActionOverdue: deal.isActionOverdue,
        actionOverdueByDays: deal.actionOverdueByDays,
      })),
      safe: safe.slice(0, 5).map((deal) => ({
        id: deal.id,
        name: deal.name,
        stage: deal.stage,
        riskLevel: deal.riskLevel,
        primaryRiskReason: deal.primaryRiskReason,
        recommendedAction: deal.recommendedAction,
        isActionOverdue: deal.isActionOverdue,
        actionOverdueByDays: deal.actionOverdueByDays,
      })),
    };
  });
}
