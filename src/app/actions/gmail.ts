"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { logIntegrationAction } from "./integrations";
import { deleteIfExists } from "@/lib/prisma-helpers";
import { syncGmailForUser } from "@/lib/sync/gmail-sync";
import { SYNC_IN_PROGRESS_MESSAGE } from "@/lib/sync/lock";

export interface GmailStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
}

export async function getGmailStatus(): Promise<GmailStatus> {
  const userId = await getAuthenticatedUserId();
  const integration = await prisma.gmailIntegration.findUnique({ where: { userId } });
  if (!integration || !integration.isActive) {
    return {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
    };
  }
  return {
    connected: true,
    lastSyncAt: integration.lastSyncAt,
    lastSyncStatus: integration.lastSyncStatus,
    totalSynced: integration.totalSynced,
    syncEnabled: integration.syncEnabled,
  };
}

export async function disconnectGmail(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();
  await deleteIfExists(
    () => prisma.gmailIntegration.delete({ where: { userId } }),
    { resource: "gmailIntegration", userId }
  );
  await logIntegrationAction("gmail", "disconnect", "success", "Disconnected Gmail");
  revalidatePath("/settings");
  return { success: true };
}

export async function updateGmailSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();
  await prisma.gmailIntegration.update({ where: { userId }, data: settings });
  await logIntegrationAction("gmail", "settings_update", "success", JSON.stringify(settings));
  revalidatePath("/settings");
  return { success: true };
}

export async function syncGmailSignals() {
  const userId = await getAuthenticatedUserId();
  const result = await syncGmailForUser(userId);
  if (result.lockSkipped) {
    throw new Error(SYNC_IN_PROGRESS_MESSAGE);
  }
  return result;
}
