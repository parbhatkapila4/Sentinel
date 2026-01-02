"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateAndPersistDealRisk } from "@/server/dealRiskEngine";

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

  await recalculateAndPersistDealRisk(deal.id);

  revalidatePath("/dashboard");

  const updatedDeal = await prisma.deal.findUnique({
    where: { id: deal.id },
  });

  return updatedDeal!;
}

export async function getAllDeals() {
  const userId = await getAuthenticatedUserId();

  const deals = await prisma.deal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return deals;
}

export async function getDealById(dealId: string) {
  const userId = await getAuthenticatedUserId();

  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      userId,
    },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  return deal;
}
