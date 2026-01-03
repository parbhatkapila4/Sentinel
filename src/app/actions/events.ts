"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendDealTimeline } from "@/lib/timeline";

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

  await appendDealTimeline(dealId, "event_created", {
    eventType: type,
  });

  await prisma.dealEvent.create({
    data: {
      dealId,
      type,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard");

  return { success: true };
}
