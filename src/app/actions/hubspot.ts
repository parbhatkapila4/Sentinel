"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  validateHubSpotCredentials,
  fetchHubSpotDeals,
  fetchHubSpotContacts,
  mapHubSpotDealToDeal,
} from "@/lib/hubspot";
import { normalizeContactEmail } from "@/lib/contact-utils";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { getHubSpotAccessToken } from "@/lib/hubspot-auth";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";
import { runWithConcurrency } from "@/lib/async-pool";
import { deleteIfExists } from "@/lib/prisma-helpers";

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

export async function updateHubSpotSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.hubSpotIntegration.update({
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
  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0 };
  }

  try {
    const accessToken = await getHubSpotAccessToken(userId);
    const fetchedHubspotDeals = await fetchHubSpotDeals(accessToken);
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
            `Failed to sync deal ${hubspotDeal.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );

    await prisma.hubSpotIntegration.update({
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
    await prisma.hubSpotIntegration.update({
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

export interface ContactSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

export async function syncHubSpotContactsForUser(
  userId: string
): Promise<ContactSyncResult> {
  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    logInfo("HubSpot contact sync skipped: no active integration", { userId });
    return { synced: 0, skipped: 0, errors: [] };
  }

  const startedAt = Date.now();
  let synced = 0;
  let skipped = 0;
  const errors: string[] = [];

  let contacts: Awaited<ReturnType<typeof fetchHubSpotContacts>>;
  try {
    const accessToken = await getHubSpotAccessToken(userId);
    contacts = await fetchHubSpotContacts(accessToken);
  } catch (error) {
    void incrementMetric("sync.hubspot.contacts.errors", 1);
    const msg = error instanceof Error ? error.message : String(error);
    logWarn("HubSpot contact fetch failed", {
      userId,
      error: msg,
    });
    return { synced: 0, skipped: 0, errors: [msg] };
  }

  for (const contact of contacts) {
    const email = normalizeContactEmail(contact.properties?.email);
    if (!email) {
      skipped++;
      continue;
    }

    const firstName = contact.properties?.firstname || null;
    const lastName = contact.properties?.lastname || null;
    const fullName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName ?? lastName ?? null;

    const data = {
      userId,
      email,
      firstName,
      lastName,
      fullName,
      phone: contact.properties?.phone || null,
      companyName: contact.properties?.company || null,
      source: "hubspot",
      externalId: contact.id,
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
              source: "hubspot",
              externalId: contact.id,
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
      errors.push(`Failed to sync contact ${contact.id}: ${msg}`);
      logWarn("HubSpot contact upsert failed", {
        userId,
        externalId: contact.id,
        email,
        error: msg,
      });
    }
  }

  try {
    await prisma.hubSpotIntegration.update({
      where: { userId },
      data: {
        lastContactsSyncedAt: new Date(),
        totalContactsSynced: integration.totalContactsSynced + synced,
      },
    });
  } catch (error) {
    logWarn("HubSpot contact sync metadata update failed", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const durationMs = Date.now() - startedAt;
  void incrementMetric("sync.hubspot.contacts.duration_ms", durationMs);
  void incrementMetric("sync.hubspot.contacts.success", 1);
  if (errors.length > 0) {
    void incrementMetric("sync.hubspot.contacts.item_errors", errors.length);
  }
  logInfo("HubSpot contact sync completed", {
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
