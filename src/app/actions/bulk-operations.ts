"use server";

import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUserEditDeal } from "@/app/actions/deals";
import { invalidateCachePattern, invalidateCache } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { appendDealTimeline } from "@/lib/timeline";
import { notifyRealtimeEvent } from "@/lib/realtime";
import { seedDemoDataForUser } from "@/lib/demo-data";
import { ValidationError } from "@/lib/errors";
import { logInfo } from "@/lib/logger";

export type BulkUpdateResult = {
  updated: number;
  failed: number;
  errors?: string[];
};

export type BulkDeleteResult = {
  deleted: number;
  failed: number;
  errors?: string[];
};

const MAX_BULK_DEALS = 100;


async function validateDealAccess(
  userId: string,
  dealIds: string[]
): Promise<{
  editableDeals: Array<{ id: string; userId: string; teamId: string | null }>;
  errors: string[];
}> {
  if (dealIds.length === 0) {
    return { editableDeals: [], errors: [] };
  }

  if (dealIds.length > MAX_BULK_DEALS) {
    throw new ValidationError(
      `Cannot process more than ${MAX_BULK_DEALS} deals at once`,
      { dealIds: `Maximum ${MAX_BULK_DEALS} deals allowed` }
    );
  }

  const uniqueIds = [...new Set(dealIds)];
  const deals = await prisma.deal.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, userId: true, teamId: true, name: true, isDemo: true },
  });

  const dealMap = new Map(deals.map((d) => [d.id, d]));
  const editableDeals: Array<{ id: string; userId: string; teamId: string | null }> = [];
  const errors: string[] = [];

  for (const id of uniqueIds) {
    const deal = dealMap.get(id);
    if (!deal) {
      errors.push(`Deal ${id} not found`);
      continue;
    }
    if (deal.isDemo) {
      errors.push(`Cannot modify demo deal "${deal.name}"`);
      continue;
    }
    const canEdit = await canUserEditDeal(userId, deal);
    if (!canEdit) {
      errors.push(`No permission to edit deal "${deal.name}"`);
      continue;
    }
    editableDeals.push({ id: deal.id, userId: deal.userId, teamId: deal.teamId });
  }

  return { editableDeals, errors };
}


export async function bulkUpdateDeals(
  userId: string,
  dealIds: string[],
  updates: { stage?: string; assignedToId?: string | null }
): Promise<BulkUpdateResult> {
  if (!updates.stage && updates.assignedToId === undefined) {
    throw new ValidationError("No updates provided", {
      updates: "Provide stage and/or assignedToId",
    });
  }

  const { editableDeals, errors } = await validateDealAccess(userId, dealIds);

  if (editableDeals.length === 0) {
    return {
      updated: 0,
      failed: dealIds.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  const updateData: { stage?: string; assignedToId?: string | null } = {};
  if (updates.stage) updateData.stage = updates.stage;
  if (updates.assignedToId !== undefined) updateData.assignedToId = updates.assignedToId;

  const idsToUpdate = editableDeals.map((d) => d.id);

  await prisma.$transaction(
    idsToUpdate.map((id) =>
      prisma.deal.update({
        where: { id },
        data: updateData,
      })
    )
  );

  for (const id of idsToUpdate) {
    if (updates.stage) {
      await appendDealTimeline(id, "stage_changed", { stage: updates.stage });
    }
  }

  await invalidateCachePattern(`deals:all:${userId}:*`);
  await invalidateCachePattern(`deals:team:*:${userId}`);
  for (const id of idsToUpdate) {
    await invalidateCache(`deal:${id}:${userId}`);
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");

  try {
    for (const id of idsToUpdate) {
      await notifyRealtimeEvent(userId, { type: "deal.updated", dealId: id });
    }
  } catch {

  }

  logInfo("Bulk update completed", {
    userId,
    updated: idsToUpdate.length,
    failed: errors.length,
  });

  return {
    updated: idsToUpdate.length,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}


export async function bulkDeleteDeals(
  userId: string,
  dealIds: string[]
): Promise<BulkDeleteResult> {
  const { editableDeals, errors } = await validateDealAccess(userId, dealIds);

  if (editableDeals.length === 0) {
    return {
      deleted: 0,
      failed: dealIds.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  const idsToDelete = editableDeals.map((d) => d.id);

  await prisma.$transaction(async (tx) => {
    for (const dealId of idsToDelete) {
      await tx.dealTimeline.deleteMany({ where: { dealId } });
      await tx.dealEvent.deleteMany({ where: { dealId } });
      await tx.action.deleteMany({ where: { dealId } });
      await tx.deal.delete({ where: { id: dealId } });
    }
  });

  await invalidateCachePattern(`deals:all:${userId}:*`);
  await invalidateCachePattern(`deals:team:*:${userId}`);
  for (const id of idsToDelete) {
    await invalidateCache(`deal:${id}:${userId}`);
  }

  const remainingCount = await prisma.deal.count({ where: { userId } });
  if (remainingCount === 0) {
    await seedDemoDataForUser(userId);
    await invalidateCachePattern(`deals:all:${userId}:*`);
    await invalidateCachePattern(`deals:team:*:${userId}`);
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");

  try {
    for (const id of idsToDelete) {
      await notifyRealtimeEvent(userId, { type: "deal.deleted", dealId: id });
    }
  } catch {

  }

  logInfo("Bulk delete completed", {
    userId,
    deleted: idsToDelete.length,
    failed: errors.length,
  });

  return {
    deleted: idsToDelete.length,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
