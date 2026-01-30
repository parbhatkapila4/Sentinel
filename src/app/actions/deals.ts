"use server";

import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { logInfo, logError, logWarn } from "@/lib/logger";
import { withErrorContext } from "@/lib/error-context";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";
import { STAGE_PRIORITY_FOR_RISK, TEAM_ROLES } from "@/lib/config";
import { assertRiskFieldIntegrity } from "@/lib/riskAssertions";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appendDealTimeline } from "@/lib/timeline";
import {
  triggerStageChangeNotification,
  triggerDealAtRiskNotification,
  triggerActionOverdueNotification,
} from "@/lib/notification-triggers";
import { dispatchWebhookEvent } from "@/lib/webhooks";
import {
  sendSlackNotification,
  formatDealAtRiskSlackMessage,
  formatDealWonSlackMessage,
  formatStageChangeSlackMessage,
} from "@/lib/slack";
import { removeDemoDataForUser, hasDemoData, seedDemoDataForUser } from "@/lib/demo-data";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";
import { getUserTeamRole } from "@/lib/team-utils";
import { enforceDealLimit } from "@/lib/plan-enforcement";
import { withCache, invalidateCachePattern, invalidateCache } from "@/lib/cache";
import type { GetDealsOptions } from "@/types";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit-log";
import { notifyRealtimeEvent } from "@/lib/realtime";

const DEAL_VALUE_AUDIT_THRESHOLD = 100000;

async function logDealValueChangeIfNeeded(
  userId: string,
  dealId: string,
  oldValue: number,
  newValue: number
): Promise<void> {
  if (
    (oldValue >= DEAL_VALUE_AUDIT_THRESHOLD || newValue >= DEAL_VALUE_AUDIT_THRESHOLD) &&
    oldValue !== newValue
  ) {
    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.DEAL_VALUE_CHANGED,
      "deal",
      dealId,
      {
        oldValue,
        newValue,
        change: newValue - oldValue,
        changePercent: oldValue > 0 ? ((newValue - oldValue) / oldValue) * 100 : 0,
      }
    );
  }
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
      const name = formData.get("name") as string;
      const stage = formData.get("stage") as string;
      const value = parseInt(formData.get("value") as string, 10);
      const location = (formData.get("location") as string) || null;
      const teamId = (formData.get("teamId") as string) || null;
      const assignedToId = (formData.get("assignedToId") as string) || null;

      if (!name || !stage || isNaN(value)) {
        const errors: Record<string, string> = {};
        if (!name) errors.name = "Required";
        if (!stage) errors.stage = "Required";
        if (isNaN(value)) errors.value = "Required";
        throw new ValidationError("Missing required fields", errors);
      }

      await enforceDealLimit(userId);

      if (teamId) {
        const role = await getUserTeamRole(userId, teamId);
        if (!role) throw new ForbiddenError("You are not a member of this team");
      }

      logInfo("Creating deal", {
        userId,
        name,
        stage,
        value,
        teamId,
        assignedToId,
      });

      const deal = await prisma.deal.create({
        data: {
          userId,
          name,
          stage,
          value,
          location,
          ...(teamId && { teamId }),
          ...(assignedToId && { assignedToId }),
        },
      });

      await appendDealTimeline(deal.id, "stage_changed", {
        stage,
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);

      try {
        await dispatchWebhookEvent(userId, teamId, "deal.created", {
          id: deal.id,
          name: deal.name,
          value: deal.value,
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
        value: deal.value,
      });

      try {
        await notifyRealtimeEvent(userId, { type: "deal.created", dealId: deal.id });
      } catch {
      }

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

      const timelineEventsInput = timeline.map((e) => ({
        eventType: e.eventType,
        createdAt: e.createdAt || new Date(),
        metadata:
          e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
            ? (e.metadata as Record<string, unknown>)
            : null,
      }));

      const riskSettings = await prisma.userRiskSettings.findUnique({
        where: { userId: deal.userId },
        select: {
          inactivityThresholdDays: true,
          enableCompetitiveSignals: true,
        },
      });

      const signals = calculateDealSignals(
        {
          stage: deal.stage,
          value: deal.value,
          status: "active",
          createdAt: deal.createdAt,
        },
        timelineEventsInput,
        riskSettings ?? undefined
      );

      return {
        id: deal.id,
        userId: deal.userId,
        teamId: deal.teamId,
        assignedToId: deal.assignedToId,
        name: deal.name,
        stage: deal.stage,
        value: deal.value,
        lastActivityAt: signals.lastActivityAt,
        riskScore: signals.riskScore,
        riskLevel: formatRiskLevel(signals.riskScore),
        status: signals.status,
        nextAction: signals.nextAction,
        nextActionReason: null,
        riskReasons: signals.reasons,
        primaryRiskReason: getPrimaryRiskReason(signals.reasons),
        recommendedAction: signals.recommendedAction,
        riskStartedAt: signals.riskStartedAt,
        riskAgeInDays: signals.riskAgeInDays,
        actionDueAt: signals.actionDueAt,
        actionOverdueByDays: signals.actionOverdueByDays,
        isActionOverdue: signals.isActionOverdue,
        createdAt: deal.createdAt,
      };
    }
  );
}

export async function getAllDeals(options?: GetDealsOptions) {
  noStore();
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
      include: {
        assignedTo: { select: { id: true, name: true, surname: true } },
      },
    });

    const dealIds = deals.map((d) => d.id);
    const allTimelineEvents = await prisma.dealTimeline.findMany({
      where: { dealId: { in: dealIds } },
      orderBy: { createdAt: "desc" },
    });

    const timelineByDealId = new Map<string, typeof allTimelineEvents>();
    for (const event of allTimelineEvents) {
      if (!timelineByDealId.has(event.dealId)) {
        timelineByDealId.set(event.dealId, []);
      }
      timelineByDealId.get(event.dealId)!.push(event);
    }

    const uniqueUserIds = [...new Set(deals.map((d) => d.userId))];
    const riskSettingsMap = new Map<string, { inactivityThresholdDays: number; enableCompetitiveSignals: boolean }>();
    if (uniqueUserIds.length > 0) {
      const riskSettings = await prisma.userRiskSettings.findMany({
        where: { userId: { in: uniqueUserIds } },
        select: {
          userId: true,
          inactivityThresholdDays: true,
          enableCompetitiveSignals: true,
        },
      });
      for (const setting of riskSettings) {
        riskSettingsMap.set(setting.userId, {
          inactivityThresholdDays: setting.inactivityThresholdDays,
          enableCompetitiveSignals: setting.enableCompetitiveSignals,
        });
      }
    }

    return deals.map((deal) => {
      assertRiskFieldIntegrity(deal);

      const dealTimeline = timelineByDealId.get(deal.id) ?? [];

      const timelineEvents = dealTimeline.map((e) => ({
        eventType: e.eventType,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
        metadata:
          e.metadata &&
            typeof e.metadata === "object" &&
            !Array.isArray(e.metadata)
            ? ({ ...e.metadata } as Record<string, unknown>)
            : null,
      }));

      const userRiskSettings = riskSettingsMap.get(deal.userId);

      const signals = calculateDealSignals(
        {
          stage: deal.stage,
          value: deal.value,
          status: "active",
          createdAt: deal.createdAt,
        },
        timelineEvents,
        userRiskSettings
      );

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
        value: deal.value,
        isDemo: deal.isDemo,
        lastActivityAt: signals.lastActivityAt,
        riskScore: signals.riskScore,
        riskLevel: formatRiskLevel(signals.riskScore),
        status: signals.status,
        nextAction: signals.nextAction,
        nextActionReason: null,
        riskReasons: signals.reasons,
        primaryRiskReason: getPrimaryRiskReason(signals.reasons),
        recommendedAction: signals.recommendedAction,
        riskStartedAt: signals.riskStartedAt,
        riskAgeInDays: signals.riskAgeInDays,
        actionDueAt: signals.actionDueAt,
        actionOverdueByDays: signals.actionOverdueByDays,
        isActionOverdue: signals.isActionOverdue,
        createdAt: deal.createdAt,
      };
    });
  });
}

export async function getTeamDeals(teamId: string) {
  noStore();
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  if (!role) throw new ForbiddenError("You are not a member of this team");

  const cacheKey = `deals:team:${teamId}:${userId}`;
  return withCache(cacheKey, 60, async () => {
    const deals = await prisma.deal.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, surname: true, email: true },
        },
      },
    });

    const dealIds = deals.map((d) => d.id);
    const allTimelineEvents = await prisma.dealTimeline.findMany({
      where: { dealId: { in: dealIds } },
      orderBy: { createdAt: "desc" },
    });

    const timelineByDealId = new Map<string, typeof allTimelineEvents>();
    for (const event of allTimelineEvents) {
      if (!timelineByDealId.has(event.dealId)) {
        timelineByDealId.set(event.dealId, []);
      }
      timelineByDealId.get(event.dealId)!.push(event);
    }

    const uniqueUserIds = [...new Set(deals.map((d) => d.userId))];
    const riskSettingsMap = new Map<string, { inactivityThresholdDays: number; enableCompetitiveSignals: boolean }>();
    if (uniqueUserIds.length > 0) {
      const riskSettings = await prisma.userRiskSettings.findMany({
        where: { userId: { in: uniqueUserIds } },
        select: {
          userId: true,
          inactivityThresholdDays: true,
          enableCompetitiveSignals: true,
        },
      });
      for (const setting of riskSettings) {
        riskSettingsMap.set(setting.userId, {
          inactivityThresholdDays: setting.inactivityThresholdDays,
          enableCompetitiveSignals: setting.enableCompetitiveSignals,
        });
      }
    }

    return deals.map((deal) => {
      assertRiskFieldIntegrity(deal);
      const dealTimeline = timelineByDealId.get(deal.id) ?? [];
      const timelineEvents = dealTimeline.map((e) => ({
        eventType: e.eventType,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
        metadata:
          e.metadata &&
            typeof e.metadata === "object" &&
            !Array.isArray(e.metadata)
            ? ({ ...e.metadata } as Record<string, unknown>)
            : null,
      }));

      const userRiskSettings = riskSettingsMap.get(deal.userId);

      const signals = calculateDealSignals(
        {
          stage: deal.stage,
          value: deal.value,
          status: "active",
          createdAt: deal.createdAt,
        },
        timelineEvents,
        userRiskSettings ?? undefined
      );

      return {
        id: deal.id,
        userId: deal.userId,
        teamId: deal.teamId,
        assignedToId: deal.assignedToId,
        name: deal.name,
        stage: deal.stage,
        value: deal.value,
        isDemo: deal.isDemo,
        lastActivityAt: signals.lastActivityAt,
        riskScore: signals.riskScore,
        riskLevel: formatRiskLevel(signals.riskScore),
        status: signals.status,
        nextAction: signals.nextAction,
        nextActionReason: null,
        riskReasons: signals.reasons,
        primaryRiskReason: getPrimaryRiskReason(signals.reasons),
        recommendedAction: signals.recommendedAction,
        riskStartedAt: signals.riskStartedAt,
        riskAgeInDays: signals.riskAgeInDays,
        actionDueAt: signals.actionDueAt,
        actionOverdueByDays: signals.actionOverdueByDays,
        isActionOverdue: signals.isActionOverdue,
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

    const timelineEventsInput = timeline.map((e) => ({
      eventType: e.eventType,
      createdAt: e.createdAt || new Date(),
      metadata:
        e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
          ? (e.metadata as Record<string, unknown>)
          : null,
    }));

    const signals = calculateDealSignals(
      {
        stage: deal.stage,
        value: deal.value,
        status: "active",
        createdAt: deal.createdAt,
      },
      timelineEventsInput
    );

    const events = await prisma.dealEvent.findMany({
      where: { dealId: deal.id },
      orderBy: { createdAt: "desc" },
    });

    const dealWithSource = deal as typeof deal & { source?: string | null; externalId?: string | null };

    return {
      id: deal.id,
      userId: deal.userId,
      teamId: deal.teamId,
      assignedToId: deal.assignedToId,
      name: deal.name,
      stage: deal.stage,
      value: deal.value,
      source: dealWithSource.source ?? null,
      externalId: dealWithSource.externalId ?? null,
      lastActivityAt: signals.lastActivityAt,
      riskScore: signals.riskScore,
      riskLevel: formatRiskLevel(signals.riskScore),
      status: signals.status,
      nextAction: signals.nextAction,
      nextActionReason: null,
      riskReasons: signals.reasons,
      primaryRiskReason: getPrimaryRiskReason(signals.reasons),
      recommendedAction: signals.recommendedAction,
      riskStartedAt: signals.riskStartedAt,
      riskAgeInDays: signals.riskAgeInDays,
      actionDueAt: signals.actionDueAt,
      actionOverdueByDays: signals.actionOverdueByDays,
      isActionOverdue: signals.isActionOverdue,
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
        await seedDemoDataForUser(userId);
        await invalidateCachePattern(`deals:all:${userId}:*`);
        await invalidateCachePattern(`deals:team:*:${userId}`);
      }

      revalidatePath("/dashboard");
      revalidatePath("/deals");
      revalidatePath(`/deals/${dealId}`);
      if (deal.teamId) revalidatePath(`/teams/${deal.teamId}`);

      try {
        await notifyRealtimeEvent(userId, { type: "deal.deleted", dealId });
      } catch {
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
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new NotFoundError("Deal");

      const canEdit = await canUserEditDeal(userId, deal);
      if (!canEdit) throw new ForbiddenError("You cannot edit this deal");

      const oldStage = deal.stage;

      logInfo("Updating deal stage", {
        userId,
        dealId,
        oldStage,
        newStage,
      });

      await prisma.deal.update({
        where: { id: dealId },
        data: { stage: newStage },
      });

      await invalidateCachePattern(`deals:all:${userId}:*`);
      await invalidateCachePattern(`deals:team:*:${userId}`);
      await invalidateCache(`deal:${dealId}:${userId}`);

      await appendDealTimeline(dealId, "stage_changed", {
        stage: newStage,
      });

      revalidatePath(`/deals/${dealId}`);
      revalidatePath("/dashboard");
      if (deal.teamId) revalidatePath(`/teams/${deal.teamId}`);

      try {
        if (oldStage !== newStage) {
          await triggerStageChangeNotification(
            { id: deal.id, name: deal.name, userId: deal.userId },
            oldStage,
            newStage
          );
          await dispatchWebhookEvent(userId, deal.teamId, "deal.stage_changed", {
            id: deal.id,
            name: deal.name,
            oldStage,
            newStage,
          });
          await sendSlackNotification(
            userId,
            deal.teamId,
            "deal.stage_changed",
            formatStageChangeSlackMessage({
              name: deal.name,
              value: deal.value,
              oldStage,
              newStage,
            })
          );
        }
        if (newStage === "closed_won") {
          logInfo("Deal closed won", {
            userId,
            dealId: deal.id,
            dealName: deal.name,
            value: deal.value,
          });
          await dispatchWebhookEvent(userId, deal.teamId, "deal.closed_won", {
            id: deal.id,
            name: deal.name,
            value: deal.value,
          });
          await sendSlackNotification(
            userId,
            deal.teamId,
            "deal.closed_won",
            formatDealWonSlackMessage({ name: deal.name, value: deal.value })
          );
        }
        const enriched = await getDealById(dealId);
        const riskLevel = enriched.riskLevel ?? formatRiskLevel(enriched.riskScore);
        if (
          riskLevel === "High" ||
          (riskLevel as string).toLowerCase() === "critical"
        ) {
          await triggerDealAtRiskNotification({
            id: enriched.id,
            name: enriched.name,
            userId: enriched.userId,
            riskLevel: riskLevel as string,
            primaryRiskReason: enriched.primaryRiskReason ?? undefined,
          });
          await dispatchWebhookEvent(userId, deal.teamId, "deal.at_risk", {
            id: enriched.id,
            name: enriched.name,
            value: enriched.value,
            stage: enriched.stage,
            riskLevel: riskLevel as string,
            primaryRiskReason: enriched.primaryRiskReason ?? undefined,
          });
          await sendSlackNotification(
            userId,
            deal.teamId,
            "deal.at_risk",
            formatDealAtRiskSlackMessage({
              name: enriched.name,
              value: enriched.value,
              stage: enriched.stage,
              riskLevel: riskLevel as string,
              riskReason: enriched.primaryRiskReason ?? undefined,
            })
          );
        }
        if (
          enriched.isActionOverdue &&
          enriched.recommendedAction &&
          enriched.actionOverdueByDays != null
        ) {
          await triggerActionOverdueNotification(
            { id: enriched.id, name: enriched.name, userId: enriched.userId },
            enriched.recommendedAction.label,
            enriched.actionOverdueByDays
          );
        }
        try {
          await notifyRealtimeEvent(userId, {
            type: "deal.updated",
            dealId,
            stage: newStage,
          });
          if (
            riskLevel === "High" ||
            (riskLevel as string).toLowerCase() === "critical"
          ) {
            await notifyRealtimeEvent(userId, { type: "deal.at_risk", dealId });
          }
        } catch {
        }
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
        newStage,
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
  noStore();
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
  noStore();
  const userId = await getAuthenticatedUserId();

  const cacheKey = `deals:counts:country:${userId}`;
  return withCache(cacheKey, 120, async () => {
    const deals = await prisma.deal.findMany({
      where: { userId },
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
  noStore();
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
