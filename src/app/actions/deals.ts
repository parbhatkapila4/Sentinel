"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendDealTimeline } from "@/lib/timeline";
import { calculateDealRiskFromTimeline } from "@/server/dealRiskEngine";

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

  const dealResult = await prisma.$queryRaw<
    Array<{
      id: string;
      userId: string;
      name: string;
      stage: string;
      value: number;
      lastActivityAt: Date;
      riskScore: number;
      riskLevel: string | null;
      status: string;
      nextAction: string | null;
      nextActionReason: string | null;
      riskEvaluatedAt: Date | null;
      createdAt: Date;
    }>
  >`
    SELECT 
      d.id,
      d."userId",
      d.name,
      d.stage,
      d.value,
      COALESCE(MAX(dt.created_at), d."createdAt") as "lastActivityAt",
      d."riskScore",
      d."riskLevel",
      d.status,
      d."nextAction",
      d."nextActionReason",
      d."riskEvaluatedAt",
      d."createdAt"
    FROM "Deal" d
    LEFT JOIN "DealTimeline" dt ON d.id = dt.deal_id
    WHERE d.id = ${deal.id}
    GROUP BY d.id, d."userId", d.name, d.stage, d.value, d."createdAt", 
             d."riskScore", d."riskLevel", d.status, d."nextAction", 
             d."nextActionReason", d."riskEvaluatedAt"
  `;

  const updatedDeal = dealResult[0];
  if (!updatedDeal) {
    throw new Error("Deal not found after creation");
  }

  return {
    ...updatedDeal,
    lastActivityAt: new Date(updatedDeal.lastActivityAt),
    createdAt: new Date(updatedDeal.createdAt),
    riskEvaluatedAt: updatedDeal.riskEvaluatedAt
      ? new Date(updatedDeal.riskEvaluatedAt)
      : null,
  };
}

export async function getAllDeals() {
  const userId = await getAuthenticatedUserId();

  const deals = await prisma.deal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  await Promise.all(
    deals.map((deal) => calculateDealRiskFromTimeline(deal.id))
  );

  const updatedDeals = await prisma.$queryRaw<
    Array<{
      id: string;
      userId: string;
      name: string;
      stage: string;
      value: number;
      lastActivityAt: Date;
      riskScore: number;
      riskLevel: string | null;
      status: string;
      nextAction: string | null;
      nextActionReason: string | null;
      riskEvaluatedAt: Date | null;
      createdAt: Date;
    }>
  >`
    SELECT 
      d.id,
      d."userId",
      d.name,
      d.stage,
      d.value,
      COALESCE(MAX(dt.created_at), d."createdAt") as "lastActivityAt",
      d."riskScore",
      d."riskLevel",
      d.status,
      d."nextAction",
      d."nextActionReason",
      d."riskEvaluatedAt",
      d."createdAt"
    FROM "Deal" d
    LEFT JOIN "DealTimeline" dt ON d.id = dt.deal_id
    WHERE d."userId" = ${userId}
    GROUP BY d.id, d."userId", d.name, d.stage, d.value, d."createdAt", 
             d."riskScore", d."riskLevel", d.status, d."nextAction", 
             d."nextActionReason", d."riskEvaluatedAt"
    ORDER BY d."createdAt" DESC
  `;

  return updatedDeals.map((deal) => ({
    ...deal,
    lastActivityAt: new Date(deal.lastActivityAt),
    createdAt: new Date(deal.createdAt),
    riskEvaluatedAt: deal.riskEvaluatedAt
      ? new Date(deal.riskEvaluatedAt)
      : null,
  }));
}

export async function getDealById(dealId: string) {
  const userId = await getAuthenticatedUserId();

  await calculateDealRiskFromTimeline(dealId);

  const dealResult = await prisma.$queryRaw<
    Array<{
      id: string;
      userId: string;
      name: string;
      stage: string;
      value: number;
      lastActivityAt: Date;
      riskScore: number;
      riskLevel: string | null;
      status: string;
      nextAction: string | null;
      nextActionReason: string | null;
      riskEvaluatedAt: Date | null;
      createdAt: Date;
    }>
  >`
    SELECT 
      d.id,
      d."userId",
      d.name,
      d.stage,
      d.value,
      COALESCE(MAX(dt.created_at), d."createdAt") as "lastActivityAt",
      d."riskScore",
      d."riskLevel",
      d.status,
      d."nextAction",
      d."nextActionReason",
      d."riskEvaluatedAt",
      d."createdAt"
    FROM "Deal" d
    LEFT JOIN "DealTimeline" dt ON d.id = dt.deal_id
    WHERE d.id = ${dealId} AND d."userId" = ${userId}
    GROUP BY d.id, d."userId", d.name, d.stage, d.value, d."createdAt", 
             d."riskScore", d."riskLevel", d.status, d."nextAction", 
             d."nextActionReason", d."riskEvaluatedAt"
  `;

  if (dealResult.length === 0) {
    throw new Error("Deal not found");
  }

  const deal = dealResult[0];

  const events = await prisma.dealEvent.findMany({
    where: { dealId: deal.id },
    orderBy: { createdAt: "desc" },
  });

  const timeline = await prisma.dealTimeline.findMany({
    where: { dealId: deal.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    ...deal,
    lastActivityAt: new Date(deal.lastActivityAt),
    createdAt: new Date(deal.createdAt),
    riskEvaluatedAt: deal.riskEvaluatedAt
      ? new Date(deal.riskEvaluatedAt)
      : null,
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
