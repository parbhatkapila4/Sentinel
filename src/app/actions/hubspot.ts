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
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "@/lib/integration-secrets";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";
import { runWithConcurrency } from "@/lib/async-pool";

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
  scanned?: number;
  failed?: number;
  errors?: string[];
}

const HUBSPOT_SYNC_ITEM_CONCURRENCY = 2;

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
      apiKey: encryptIntegrationSecret(apiKey),
      portalId: validation.portalId || null,
      isActive: true,
      syncEnabled: true,
    },
    update: {
      apiKey: encryptIntegrationSecret(apiKey),
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
    const hubspotDeals = await fetchHubSpotDeals(
      decryptIntegrationSecret(integration.apiKey)
    );

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

    void notifySlackAfterCrmSync(userId, {
      provider: "hubspot",
      created,
      updated,
    });

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
  const startedAt = Date.now();
  const integration = await db.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const fetchedHubspotDeals = await fetchHubSpotDeals(
      decryptIntegrationSecret(integration.apiKey)
    );
    const hubspotDeals = fetchedHubspotDeals.filter((deal, index, arr) => {
      return arr.findIndex((candidate) => candidate.id === deal.id) === index;
    });

    const mappedDeals = hubspotDeals.map((hubspotDeal) =>
      mapHubSpotDealToDeal(hubspotDeal, userId)
    );
    const externalIds = mappedDeals.map((deal) => deal.externalId);
    const candidateNames = [...new Set(mappedDeals.map((deal) => deal.name))];
    const existingDeals = await prisma.deal.findMany({
      where: {
        userId,
        OR: [
          { externalId: { in: externalIds }, source: "hubspot" },
          { name: { in: candidateNames }, OR: [{ source: "hubspot" }, { source: null }] },
        ],
      },
      select: { id: true, externalId: true, name: true, source: true },
    });
    const existingByExternal = new Map(
      existingDeals
        .filter((deal) => deal.externalId && deal.source === "hubspot")
        .map((deal) => [deal.externalId as string, deal])
    );
    const existingByName = new Map(
      existingDeals
        .filter((deal) => deal.source === "hubspot" || deal.source === null)
        .map((deal) => [deal.name, deal])
    );

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    await runWithConcurrency(
      hubspotDeals,
      HUBSPOT_SYNC_ITEM_CONCURRENCY,
      async (hubspotDeal) => {
        try {
          const dealData = mapHubSpotDealToDeal(hubspotDeal, userId);
          const existingDeal =
            existingByExternal.get(dealData.externalId) ?? existingByName.get(dealData.name);

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
            existingByExternal.set(dealData.externalId, existingDeal);
            existingByName.set(dealData.name, existingDeal);
            return;
          }

          const createdDeal = await prisma.deal.create({
            data: dealData,
            select: { id: true, externalId: true, name: true, source: true },
          });
          created++;
          if (createdDeal.externalId) {
            existingByExternal.set(createdDeal.externalId, createdDeal);
          }
          existingByName.set(createdDeal.name, createdDeal);
        } catch (error) {
          errors.push(
            `Failed to sync deal ${hubspotDeal.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    await db.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + created + updated,
        syncErrors: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.hubspot.duration_ms", durationMs);
    void incrementMetric("sync.hubspot.success", 1);
    if (errors.length > 0) {
      void incrementMetric("sync.hubspot.item_errors", errors.length);
    }
    logInfo("HubSpot user sync completed", {
      userId,
      scanned: hubspotDeals.length,
      created,
      updated,
      failed: errors.length,
      failureReasons: errors.slice(0, 3),
      durationMs,
      concurrency: HUBSPOT_SYNC_ITEM_CONCURRENCY,
    });
    return {
      success: true,
      synced: created + updated,
      created,
      updated,
      scanned: hubspotDeals.length,
      failed: errors.length,
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

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.hubspot.errors", 1);
    logWarn("HubSpot user sync failed", {
      userId,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, synced: 0, created: 0, updated: 0, scanned: 0, failed: 1, errors: [String(error)] };
  }
}
