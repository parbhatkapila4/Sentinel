"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  validateSalesforceCredentials,
  fetchSalesforceOpportunities,
  mapSalesforceOpportunityToDeal,
} from "@/lib/salesforce";
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

export interface SalesforceStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
  instanceUrl: string | null;
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

const SALESFORCE_SYNC_ITEM_CONCURRENCY = 2;

async function findExistingSalesforceDeal(
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
      source: "salesforce",
    },
  });
  if (byExternal) return byExternal;

  return prisma.deal.findFirst({
    where: {
      userId,
      name: dealData.name,
      OR: [{ source: "salesforce" }, { source: null }],
    },
  });
}

export async function connectSalesforce(
  apiKey: string,
  instanceUrl: string
): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  const existing = await db.salesforceIntegration.findUnique({
    where: { userId },
  });

  const validation = await validateSalesforceCredentials(apiKey, instanceUrl);
  if (!validation.valid) {
    await logIntegrationAction(
      "salesforce",
      "connect",
      "failed",
      validation.error
    );
    throw new Error(validation.error || "Invalid Salesforce credentials");
  }

  if (!existing) {
    await enforceIntegrationLimit(userId, "salesforce");
  }

  await db.salesforceIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: encryptIntegrationSecret(apiKey),
      instanceUrl: instanceUrl.replace(/\/$/, ""),
      isActive: true,
      syncEnabled: true,
    },
    update: {
      apiKey: encryptIntegrationSecret(apiKey),
      instanceUrl: instanceUrl.replace(/\/$/, ""),
      isActive: true,
    },
  });

  if (!existing) {
    await incrementUsage(userId, "integrations", 1);
  }

  await logIntegrationAction(
    "salesforce",
    "connect",
    "success",
    "Successfully connected to Salesforce"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function disconnectSalesforce(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await db.salesforceIntegration.delete({
    where: { userId },
  }).catch(() => {
  });

  await logIntegrationAction(
    "salesforce",
    "disconnect",
    "success",
    "Disconnected from Salesforce"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncSalesforceDeals(): Promise<SyncResult> {
  const userId = await getAuthenticatedUserId();

  const integration = await db.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Salesforce is not connected");
  }

  try {
    const opportunities = await fetchSalesforceOpportunities(
      decryptIntegrationSecret(integration.apiKey),
      integration.instanceUrl
    );

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const opportunity of opportunities) {
      try {
        const dealData = mapSalesforceOpportunityToDeal(opportunity, userId);

        const existingDeal = await findExistingSalesforceDeal(userId, dealData);

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
        errors.push(`Failed to sync opportunity ${opportunity.Id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await db.salesforceIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + totalSynced,
        syncErrors: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    await logIntegrationAction(
      "salesforce",
      "sync",
      "success",
      `Synced ${totalSynced} deals (${created} created, ${updated} updated)`,
      { created, updated, total: opportunities.length }
    );

    revalidatePath("/settings");
    revalidatePath("/deals");
    revalidatePath("/dashboard");

    void notifySlackAfterCrmSync(userId, {
      provider: "salesforce",
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
    await db.salesforceIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: String(error),
      },
    });

    await logIntegrationAction(
      "salesforce",
      "sync",
      "failed",
      String(error)
    );

    throw error;
  }
}

export async function getSalesforceStatus(): Promise<SalesforceStatus> {
  const userId = await getAuthenticatedUserId();

  const integration = await db.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    return {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
      instanceUrl: null,
    };
  }

  const maskedUrl = integration.instanceUrl.replace(
    /^(https?:\/\/[^.]+)\..*$/,
    "$1.***"
  );

  return {
    connected: true,
    lastSyncAt: integration.lastSyncAt,
    lastSyncStatus: integration.lastSyncStatus,
    totalSynced: integration.totalSynced,
    syncEnabled: integration.syncEnabled,
    instanceUrl: maskedUrl,
  };
}

export async function updateSalesforceSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await db.salesforceIntegration.update({
    where: { userId },
    data: settings,
  });

  await logIntegrationAction(
    "salesforce",
    "settings_update",
    "success",
    `Updated settings: ${JSON.stringify(settings)}`
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncSalesforceDealsForUser(userId: string): Promise<SyncResult> {
  const startedAt = Date.now();
  const integration = await db.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const fetchedOpportunities = await fetchSalesforceOpportunities(
      decryptIntegrationSecret(integration.apiKey),
      integration.instanceUrl
    );
    const opportunities = fetchedOpportunities.filter((opportunity, index, arr) => {
      return arr.findIndex((candidate) => candidate.Id === opportunity.Id) === index;
    });

    const mappedDeals = opportunities.map((opportunity) =>
      mapSalesforceOpportunityToDeal(opportunity, userId)
    );
    const externalIds = mappedDeals.map((deal) => deal.externalId);
    const candidateNames = [...new Set(mappedDeals.map((deal) => deal.name))];
    const existingDeals = await prisma.deal.findMany({
      where: {
        userId,
        OR: [
          { externalId: { in: externalIds }, source: "salesforce" },
          { name: { in: candidateNames }, OR: [{ source: "salesforce" }, { source: null }] },
        ],
      },
      select: { id: true, externalId: true, name: true, source: true },
    });
    const existingByExternal = new Map(
      existingDeals
        .filter((deal) => deal.externalId && deal.source === "salesforce")
        .map((deal) => [deal.externalId as string, deal])
    );
    const existingByName = new Map(
      existingDeals
        .filter((deal) => deal.source === "salesforce" || deal.source === null)
        .map((deal) => [deal.name, deal])
    );

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    await runWithConcurrency(
      opportunities,
      SALESFORCE_SYNC_ITEM_CONCURRENCY,
      async (opportunity) => {
        try {
          const dealData = mapSalesforceOpportunityToDeal(opportunity, userId);
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
            `Failed to sync opportunity ${opportunity.Id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    await db.salesforceIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + created + updated,
        syncErrors: errors.length > 0 ? errors.join("; ") : null,
      },
    });

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.salesforce.duration_ms", durationMs);
    void incrementMetric("sync.salesforce.success", 1);
    if (errors.length > 0) {
      void incrementMetric("sync.salesforce.item_errors", errors.length);
    }
    logInfo("Salesforce user sync completed", {
      userId,
      scanned: opportunities.length,
      created,
      updated,
      failed: errors.length,
      failureReasons: errors.slice(0, 3),
      durationMs,
      concurrency: SALESFORCE_SYNC_ITEM_CONCURRENCY,
    });
    return {
      success: true,
      synced: created + updated,
      created,
      updated,
      scanned: opportunities.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await db.salesforceIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: String(error),
      },
    });

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.salesforce.errors", 1);
    logWarn("Salesforce user sync failed", {
      userId,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, synced: 0, created: 0, updated: 0, scanned: 0, failed: 1, errors: [String(error)] };
  }
}
