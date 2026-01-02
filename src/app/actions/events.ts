"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EventType = "email_received" | "email_sent" | "meeting_held";

export async function createDealEvent(
  dealId: string,
  type: EventType,
  payload: Record<string, unknown> = {}
) {
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

  const now = new Date();

  await prisma.$transaction([
    prisma.dealEvent.create({
      data: {
        dealId,
        type,
        payload: payload as Prisma.InputJsonValue,
      },
    }),
    prisma.deal.update({
      where: { id: dealId },
      data: { lastActivityAt: now },
    }),
  ]);

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard");
}
