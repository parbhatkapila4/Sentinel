"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ValidationError } from "@/lib/errors";
import {
  validateHubSpotCredentials,
  fetchHubSpotDeals,
  mapHubSpotDealToDeal,
} from "@/lib/hubspot";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { getHubSpotAccessToken } from "@/lib/hubspot-auth";
import { logWarn } from "@/lib/logger";
import { deleteIfExists } from "@/lib/prisma-helpers";
import {
  syncHubSpotContactsForUser,
  type SyncResult,
} from "@/lib/sync/hubspot-sync";
import { acquireSyncLock, SYNC_IN_PROGRESS_MESSAGE } from "@/lib/sync/lock";

export interface HubSpotStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  lastContactsSyncedAt: Date | null;
  totalContactsSynced: number;
  syncEnabled: boolean;
  portalId: string | null;
}

export type { SyncResult };

async function findExistingHubSpotDeal(
  userId: string,
  dealData: {
    name: string;
    source: string;
    externalId: string;
  }
) {
  const byExternal = await prisma.deal.findFirst({
    where: {
      userId,
      externalId: dealData.externalId,
      source: "hubspot",
    },
  });
  if (byExternal) return byExternal;

  return prisma.deal.findFirst({
    where: {
      userId,
      name: dealData.name,
      OR: [{ source: "hubspot" }, { source: null }],
    },
  });
}

export async function connectHubSpot(
  apiKey: string
): Promise<{ success: boolean }> {
  return runIntegrationConnect({
    provider: "hubspot",
    hasExisting: async (userId) =>
      Boolean(
        await prisma.hubSpotIntegration.findUnique({ where: { userId } })
      ),
    validate: () => validateHubSpotCredentials(apiKey),
    upsert: async ({ userId }, validation) => {
      const portalId = validation.portalId || null;
      const encryptedKey = encryptIntegrationSecret(apiKey);
      await prisma.hubSpotIntegration.upsert({
        where: { userId },
        create: {
          userId,
          apiKey: encryptedKey,
          portalId,
          isActive: true,
          syncEnabled: true,
        },
        update: {
          apiKey: encryptedKey,
          portalId,
          isActive: true,
        },
      });
    },
    successMessage: (validation) =>
      `Successfully connected to HubSpot (Portal ID: ${validation.portalId})`,
  });
}

export async function disconnectHubSpot(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await deleteIfExists(
    () => prisma.hubSpotIntegration.delete({ where: { userId } }),
    { resource: "hubSpotIntegration", userId }
  );

  await logIntegrationAction(
    "hubspot",
    "disconnect",
    "success",
    "Disconnected from HubSpot"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncHubSpotDeals(): Promise<SyncResult> {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("HubSpot is not connected");
  }

  const lock = await acquireSyncLock(userId, "hubspot_deals");
  if (!lock.acquired) {
    throw new Error(SYNC_IN_PROGRESS_MESSAGE);
  }

  let dealsResult: SyncResult | null = null;
  let dealsError: unknown = null;

  try {
    const accessToken = await getHubSpotAccessToken(userId);
    const hubspotDeals = await fetchHubSpotDeals(accessToken);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const hubspotDeal of hubspotDeals) {
      try {
        const dealData = mapHubSpotDealToDeal(hubspotDeal, userId);

        const existingDeal = await findExistingHubSpotDeal(userId, dealData);

        if (existingDeal) {
          await prisma.deal.update({
            where: { id: existingDeal.id },
            data: {
              name: dealData.name,
              value: dealData.value,
              stage: dealData.stage,
            },
          });
          updated++;
        } else {
          await prisma.deal.create({
            data: {
              ...dealData,
              value: dealData.value,
            },
          });
          created++;
        }
      } catch (error) {
        errors.push(`Failed to sync deal ${hubspotDeal.id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await prisma.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + totalSynced,
        syncErrors: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    await logIntegrationAction(
      "hubspot",
      "sync",
      "success",
      `Synced ${totalSynced} deals (${created} created, ${updated} updated)`,
      { created, updated, total: hubspotDeals.length }
    );

    revalidatePath("/settings");
    revalidatePath("/deals");
    revalidatePath("/dashboard");

    void notifySlackAfterCrmSync(userId, {
      provider: "hubspot",
      created,
      updated,
    });

    dealsResult = {
      success: true,
      synced: totalSynced,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await prisma.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: String(error),
      },
    });

    await logIntegrationAction(
      "hubspot",
      "sync",
      "failed",
      String(error)
    );

    dealsError = error;
  } finally {
    await lock.release();
  }

  try {
    await syncHubSpotContactsForUser(userId);
  } catch (error) {
    logWarn("HubSpot manual contact sync threw unexpectedly", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (dealsError) throw dealsError;
  return dealsResult!;
}

export async function getHubSpotStatus(): Promise<HubSpotStatus> {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    return {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      lastContactsSyncedAt: null,
      totalContactsSynced: 0,
      syncEnabled: false,
      portalId: null,
    };
  }

  return {
    connected: true,
    lastSyncAt: integration.lastSyncAt,
    lastSyncStatus: integration.lastSyncStatus,
    totalSynced: integration.totalSynced,
    lastContactsSyncedAt: integration.lastContactsSyncedAt,
    totalContactsSynced: integration.totalContactsSynced,
    syncEnabled: integration.syncEnabled,
    portalId: integration.portalId,
  };
}

const hubSpotSettingsSchema = z.object({
  syncEnabled: z.boolean().optional(),
});

export async function updateHubSpotSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  const parsed = hubSpotSettingsSchema.safeParse(settings);
  if (!parsed.success) throw new ValidationError("Invalid HubSpot settings");

  await prisma.hubSpotIntegration.update({
    where: { userId },
    data: parsed.data,
  });

  await logIntegrationAction(
    "hubspot",
    "settings_update",
    "success",
    `Updated settings: ${JSON.stringify(parsed.data)}`
  );

  revalidatePath("/settings");
  return { success: true };
}
