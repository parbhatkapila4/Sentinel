"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  validateSalesforceCredentials,
  fetchSalesforceOpportunities,
  fetchSalesforceContacts,
  mapSalesforceOpportunityToDeal,
} from "@/lib/salesforce";
import { normalizeContactEmail } from "@/lib/contact-utils";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";
import { runWithConcurrency } from "@/lib/async-pool";
import { deleteIfExists } from "@/lib/prisma-helpers";


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

export async function updateSalesforceSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.salesforceIntegration.update({
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
  const integration = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const fetchedOpportunities = await fetchSalesforceOpportunities(integration);
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
            data: {
              ...dealData,
              value: dealData.value,
            },
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

    await prisma.salesforceIntegration.update({
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
    await prisma.salesforceIntegration.update({
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

export interface SalesforceContactSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

export async function syncSalesforceContactsForUser(
  userId: string
): Promise<SalesforceContactSyncResult> {
  void incrementMetric("sync.salesforce.contacts.started", 1);

  const integration = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    logInfo("Salesforce contact sync skipped: no active integration", { userId });
    return {
      synced: 0,
      skipped: 0,
      errors: ["No active Salesforce integration"],
    };
  }

  const startedAt = Date.now();
  const errors: string[] = [];
  let synced = 0;
  let skipped = 0;

  let contacts: Awaited<ReturnType<typeof fetchSalesforceContacts>>;
  try {
    contacts = await fetchSalesforceContacts(integration);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    void incrementMetric("sync.salesforce.contacts.failed", 1);
    logWarn("Salesforce contact fetch failed", { userId, error: msg });
    return { synced: 0, skipped: 0, errors: [msg] };
  }

  for (const contact of contacts) {
    const email = normalizeContactEmail(contact.Email);
    if (!email) {
      skipped++;
      continue;
    }

    const firstName = contact.FirstName || null;
    const lastName = contact.LastName || null;
    const composedFullName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName ?? lastName ?? null;
    const fullName = composedFullName ?? contact.Name ?? null;

    const data = {
      userId,
      email,
      firstName,
      lastName,
      fullName,
      phone: contact.Phone || null,
      companyName: contact.Account?.Name || null,
      source: "salesforce",
      externalId: contact.Id,
      lastSyncedAt: new Date(),
    };

    try {
      const [existingByEmail, existingByProviderKey] = await Promise.all([
        prisma.contact.findUnique({
          where: { userId_email: { userId, email } },
        }),
        prisma.contact.findUnique({
          where: {
            userId_source_externalId: {
              userId,
              source: "salesforce",
              externalId: contact.Id,
            },
          },
        }),
      ]);

      if (existingByEmail) {
        if (
          existingByProviderKey &&
          existingByProviderKey.id !== existingByEmail.id
        ) {
          await prisma.$transaction([
            prisma.contact.delete({
              where: { id: existingByProviderKey.id },
            }),
            prisma.contact.update({
              where: { id: existingByEmail.id },
              data: { ...data, updatedAt: new Date() },
            }),
          ]);
        } else {
          await prisma.contact.update({
            where: { id: existingByEmail.id },
            data: { ...data, updatedAt: new Date() },
          });
        }
      } else if (existingByProviderKey) {
        await prisma.contact.update({
          where: { id: existingByProviderKey.id },
          data: { ...data, updatedAt: new Date() },
        });
      } else {
        await prisma.contact.create({
          data: { ...data, createdAt: new Date(), updatedAt: new Date() },
        });
      }
      synced++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to sync contact ${contact.Id}: ${msg}`);
      logWarn("Salesforce contact upsert failed", {
        userId,
        externalId: contact.Id,
        email,
        error: msg,
      });
    }
  }

  try {
    await prisma.salesforceIntegration.update({
      where: { userId },
      data: {
        lastContactsSyncedAt: new Date(),
        totalContactsSynced: integration.totalContactsSynced + synced,
      },
    });
  } catch (error) {
    logWarn("Salesforce contact sync metadata update failed", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const durationMs = Date.now() - startedAt;
  void incrementMetric("sync.salesforce.contacts.completed", 1);
  void incrementMetric("sync.salesforce.contacts.duration_ms", durationMs);
  logInfo("Salesforce contact sync completed", {
    userId,
    scanned: contacts.length,
    synced,
    skipped,
    errors: errors.length,
    failureReasons: errors.slice(0, 3),
    durationMs,
  });

  return { synced, skipped, errors };
}
