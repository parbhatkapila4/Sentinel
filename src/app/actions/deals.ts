"use server";

import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";
import { assertRiskFieldIntegrity } from "@/lib/riskAssertions";
import { prisma } from "@/lib/prisma";
import { appendDealTimeline } from "@/lib/timeline";

export async function createDeal(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  const name = formData.get("name") as string;
  const stage = formData.get("stage") as string;
  const value = parseInt(formData.get("value") as string, 10);

  if (!name || !stage || isNaN(value)) {
    throw new Error("Missing required fields");
  }

  const deal = await prisma.deal.create({
    data: {
      userId,
      name,
      stage,
      value,
    },
  });

  await appendDealTimeline(deal.id, "stage_changed", {
    stage,
  });

  revalidatePath("/dashboard");

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

  return {
    id: deal.id,
    userId: deal.userId,
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

export async function getAllDeals() {
  noStore();
  const userId = await getAuthenticatedUserId();

  const deals = await prisma.deal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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

    const signals = calculateDealSignals(
      {
        stage: deal.stage,
        value: deal.value,
        status: "active",
        createdAt: deal.createdAt,
      },
      timelineEvents
    );

    return {
      id: deal.id,
      userId: deal.userId,
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
  });
}

export async function getDealById(dealId: string) {
  const userId = await getAuthenticatedUserId();

  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      userId,
    },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

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

  return {
    id: deal.id,
    userId: deal.userId,
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
    events,
    timeline,
  };
}

export async function updateDealStage(dealId: string, newStage: string) {
  const userId = await getAuthenticatedUserId();

  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      userId,
    },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  await prisma.deal.update({
    where: { id: dealId },
    data: { stage: newStage },
  });

  await appendDealTimeline(dealId, "stage_changed", {
    stage: newStage,
  });

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard");
}

export async function getFounderRiskOverview() {
  noStore();
  const deals = await getAllDeals();

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
}

export async function getFounderActionQueue() {
  noStore();
  const deals = await getAllDeals();

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

  const stagePriority: Record<string, number> = {
    negotiation: 2,
    discover: 1,
  };

  safe.sort((a, b) => {
    const aPriority = stagePriority[a.stage] ?? 0;
    const bPriority = stagePriority[b.stage] ?? 0;
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
}
