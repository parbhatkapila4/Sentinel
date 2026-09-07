import { prisma } from "@/lib/prisma";
import {
  fetchSalesforceOpportunities,
  fetchSalesforceContacts,
  mapSalesforceOpportunityToDeal,
} from "@/lib/salesforce";
import { normalizeContactEmail } from "@/lib/contact-utils";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";
import { runWithConcurrency } from "@/lib/async-pool";
import { SYNC_IN_PROGRESS, withSyncLock } from "./lock";

export interface SyncResult {
  success: boolean;
  synced: number;
  created: number;
  updated: number;
  scanned?: number;
  failed?: number;
  errors?: string[];
  lockSkipped?: boolean;
}

export interface SalesforceContactSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  lockSkipped?: boolean;
}

const SALESFORCE_SYNC_ITEM_CONCURRENCY = 2;

export async function syncSalesforceDealsForUser(userId: string): Promise<SyncResult> {
  const outcome = await withSyncLock(userId, "salesforce_deals", () =>
    runSalesforceDealsSync(userId)
  );
  if (outcome.skipped) {
    return {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      errors: [SYNC_IN_PROGRESS],
      lockSkipped: true,
    };
  }
  return outcome.result;
}

async function runSalesforceDealsSync(userId: string): Promise<SyncResult> {
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

export async function syncSalesforceContactsForUser(
  userId: string
): Promise<SalesforceContactSyncResult> {
  const outcome = await withSyncLock(userId, "salesforce_contacts", () =>
    runSalesforceContactsSync(userId)
  );
  if (outcome.skipped) {
    return { synced: 0, skipped: 0, errors: [SYNC_IN_PROGRESS], lockSkipped: true };
  }
  return outcome.result;
}

async function runSalesforceContactsSync(
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
