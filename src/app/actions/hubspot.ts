"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  validateHubSpotCredentials,
  fetchHubSpotDeals,
  mapHubSpotDealToDeal,
} from "@/lib/hubspot";
import { logIntegrationAction } from "./integrations";
import { enforceIntegrationLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface HubSpotStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
  portalId: string | null;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  created: number;
  updated: number;
  errors?: string[];
}

export async function connectHubSpot(
  apiKey: string
): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  const existing = await db.hubSpotIntegration.findUnique({
    where: { userId },
  });

  const validation = await validateHubSpotCredentials(apiKey);
  if (!validation.valid) {
    await logIntegrationAction(
      "hubspot",
      "connect",
      "failed",
      validation.error
    );
    throw new Error(validation.error || "Invalid HubSpot credentials");
  }

  if (!existing) {
    await enforceIntegrationLimit(userId, "hubspot");
  }

  await db.hubSpotIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey,
      portalId: validation.portalId || null,
      isActive: true,
      syncEnabled: true,
    },
    update: {
      apiKey,
      portalId: validation.portalId || null,
      isActive: true,
    },
  });

  if (!existing) {
    await incrementUsage(userId, "integrations", 1);
  }

  await logIntegrationAction(
    "hubspot",
    "connect",
    "success",
    `Successfully connected to HubSpot (Portal ID: ${validation.portalId})`
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function disconnectHubSpot(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await db.hubSpotIntegration.delete({
    where: { userId },
  }).catch(() => {
  });

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

  const integration = await db.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("HubSpot is not connected");
  }

  try {
    const hubspotDeals = await fetchHubSpotDeals(integration.apiKey);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const hubspotDeal of hubspotDeals) {
      try {
        const dealData = mapHubSpotDealToDeal(hubspotDeal, userId);

        const existingDeal = await prisma.deal.findFirst({
          where: {
            userId,
            ...(dealData.externalId ? { externalId: dealData.externalId, source: "hubspot" } : {}),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        });

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
            data: dealData,
          });
          created++;
        }
      } catch (error) {
        errors.push(`Failed to sync deal ${hubspotDeal.id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await db.hubSpotIntegration.update({
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

    return {
      success: true,
      synced: totalSynced,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await db.hubSpotIntegration.update({
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

    throw error;
  }
}

export async function getHubSpotStatus(): Promise<HubSpotStatus> {
  const userId = await getAuthenticatedUserId();

  const integration = await db.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    return {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
      portalId: null,
    };
  }

  return {
    connected: true,
    lastSyncAt: integration.lastSyncAt,
    lastSyncStatus: integration.lastSyncStatus,
    totalSynced: integration.totalSynced,
    syncEnabled: integration.syncEnabled,
    portalId: integration.portalId,
  };
}

export async function updateHubSpotSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await db.hubSpotIntegration.update({
    where: { userId },
    data: settings,
  });

  await logIntegrationAction(
    "hubspot",
    "settings_update",
    "success",
    `Updated settings: ${JSON.stringify(settings)}`
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncHubSpotDealsForUser(userId: string): Promise<SyncResult> {
  const integration = await db.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const hubspotDeals = await fetchHubSpotDeals(integration.apiKey);

    let created = 0;
    let updated = 0;

    for (const hubspotDeal of hubspotDeals) {
      const dealData = mapHubSpotDealToDeal(hubspotDeal, userId);

      const existingDeal = await prisma.deal.findFirst({
        where: {
          userId,
          ...(dealData.externalId ? { externalId: dealData.externalId, source: "hubspot" } : {}),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });

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
          data: dealData,
        });
        created++;
      }
    }

    await db.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + created + updated,
      },
    });

    return { success: true, synced: created + updated, created, updated };
  } catch (error) {
    await db.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: String(error),
      },
    });

    return { success: false, synced: 0, created: 0, updated: 0, errors: [String(error)] };
  }
}
