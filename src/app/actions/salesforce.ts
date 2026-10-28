"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ValidationError } from "@/lib/errors";
import {
  validateSalesforceCredentials,
  fetchSalesforceOpportunities,
  mapSalesforceOpportunityToDeal,
} from "@/lib/salesforce";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { logWarn } from "@/lib/logger";
import { deleteIfExists } from "@/lib/prisma-helpers";
import {
  syncSalesforceContactsForUser,
  type SyncResult,
} from "@/lib/sync/salesforce-sync";
import { acquireSyncLock, SYNC_IN_PROGRESS_MESSAGE } from "@/lib/sync/lock";


export interface SalesforceStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  lastContactsSyncedAt: Date | null;
  totalContactsSynced: number;
  syncEnabled: boolean;
  instanceUrl: string | null;
}

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
  consumerKey: string,
  consumerSecret: string,
  instanceUrl: string
): Promise<{ success: boolean }> {
  return runIntegrationConnect({
    provider: "salesforce",
    hasExisting: async (userId) =>
      Boolean(
        await prisma.salesforceIntegration.findUnique({ where: { userId } })
      ),
    validate: () =>
      validateSalesforceCredentials(consumerKey, consumerSecret, instanceUrl),
    upsert: async ({ userId }) => {
      const trimmedUrl = instanceUrl.replace(/\/$/, "");
      const encryptedConsumerKey = encryptIntegrationSecret(consumerKey);
      const encryptedConsumerSecret = encryptIntegrationSecret(consumerSecret);
      await prisma.salesforceIntegration.upsert({
        where: { userId },
        create: {
          userId,
          consumerKey: encryptedConsumerKey,
          consumerSecret: encryptedConsumerSecret,
          instanceUrl: trimmedUrl,
          isActive: true,
          syncEnabled: true,
        },
        update: {
          consumerKey: encryptedConsumerKey,
          consumerSecret: encryptedConsumerSecret,
          instanceUrl: trimmedUrl,
          isActive: true,
          accessToken: null,
          accessTokenExpiresAt: null,
        },
      });
    },
    successMessage: () => "Successfully connected to Salesforce",
  });
}

export async function disconnectSalesforce(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await deleteIfExists(
    () => prisma.salesforceIntegration.delete({ where: { userId } }),
    { resource: "salesforceIntegration", userId }
  );

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

  const integration = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Salesforce is not connected");
  }

  const lock = await acquireSyncLock(userId, "salesforce_deals");
  if (!lock.acquired) {
    throw new Error(SYNC_IN_PROGRESS_MESSAGE);
  }

  let dealsResult: SyncResult | null = null;
  let dealsError: unknown = null;

  try {
    const opportunities = await fetchSalesforceOpportunities(integration);

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
            data: {
              ...dealData,
              value: dealData.value,
            },
          });
          created++;
        }
      } catch (error) {
        errors.push(`Failed to sync opportunity ${opportunity.Id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await prisma.salesforceIntegration.update({
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

    dealsResult = {
      success: true,
      synced: totalSynced,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await prisma.salesforceIntegration.update({
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

    dealsError = error;
  } finally {
    await lock.release();
  }

  try {
    await syncSalesforceContactsForUser(userId);
  } catch (error) {
    logWarn("Salesforce manual contact sync threw unexpectedly", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (dealsError) throw dealsError;
  return dealsResult!;
}

export async function getSalesforceStatus(): Promise<SalesforceStatus> {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.salesforceIntegration.findUnique({
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
    lastContactsSyncedAt: integration.lastContactsSyncedAt,
    totalContactsSynced: integration.totalContactsSynced,
    syncEnabled: integration.syncEnabled,
    instanceUrl: maskedUrl,
  };
}

const salesforceSettingsSchema = z.object({
  syncEnabled: z.boolean().optional(),
});

export async function updateSalesforceSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  const parsed = salesforceSettingsSchema.safeParse(settings);
  if (!parsed.success) throw new ValidationError("Invalid Salesforce settings");

  await prisma.salesforceIntegration.update({
    where: { userId },
    data: parsed.data,
  });

  await logIntegrationAction(
    "salesforce",
    "settings_update",
    "success",
    `Updated settings: ${JSON.stringify(parsed.data)}`
  );

  revalidatePath("/settings");
  return { success: true };
}
