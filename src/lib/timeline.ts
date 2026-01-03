import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function appendDealTimeline(
  dealId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  await prisma.dealTimeline.create({
    data: {
      dealId,
      eventType,
      metadata: metadata
        ? (metadata as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  });
}
