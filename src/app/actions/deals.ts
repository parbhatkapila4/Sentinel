"use server";

import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";
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

  const now = new Date();

  const deal = await prisma.deal.create({
    data: {
      userId,
      name,
      stage,
      value,
      status: "active",
      lastActivityAt: now,
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
    createdAt: e.createdAt,
    metadata:
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? (e.metadata as Record<string, unknown>)
        : null,
  }));

  const signals = calculateDealSignals(deal, timelineEventsInput);

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
    riskEvaluatedAt: deal.riskEvaluatedAt,
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
    const dealTimeline = timelineByDealId.get(deal.id) ?? [];

    const timelineEvents = dealTimeline.map((e) => ({
      eventType: e.eventType,
      createdAt: new Date(e.createdAt),
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
        status: deal.status,
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
      riskEvaluatedAt: deal.riskEvaluatedAt,
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
    createdAt: e.createdAt,
    metadata:
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? (e.metadata as Record<string, unknown>)
        : null,
  }));

  const signals = calculateDealSignals(deal, timelineEventsInput);

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
    riskEvaluatedAt: deal.riskEvaluatedAt,
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
