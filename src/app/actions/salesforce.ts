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
  errors?: string[];
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
      apiKey,
      instanceUrl: instanceUrl.replace(/\/$/, ""),
      isActive: true,
      syncEnabled: true,
    },
    update: {
      apiKey,
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
      integration.apiKey,
      integration.instanceUrl
    );

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const opportunity of opportunities) {
      try {
        const dealData = mapSalesforceOpportunityToDeal(opportunity, userId);

        const existingDeal = await prisma.deal.findFirst({
          where: {
            userId,
            ...(dealData.externalId ? { externalId: dealData.externalId, source: "salesforce" } : {}),
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
  const integration = await db.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const opportunities = await fetchSalesforceOpportunities(
      integration.apiKey,
      integration.instanceUrl
    );

    let created = 0;
    let updated = 0;

    for (const opportunity of opportunities) {
      const dealData = mapSalesforceOpportunityToDeal(opportunity, userId);

      const existingDeal = await prisma.deal.findFirst({
        where: {
          userId,
          ...(dealData.externalId ? { externalId: dealData.externalId, source: "salesforce" } : {}),
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

    await db.salesforceIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + created + updated,
      },
    });

    return { success: true, synced: created + updated, created, updated };
  } catch (error) {
    await db.salesforceIntegration.update({
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
