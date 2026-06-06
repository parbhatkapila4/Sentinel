import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  syncSalesforceContactsForUser,
  syncSalesforceDealsForUser,
} from "@/app/actions/salesforce";
import {
  syncHubSpotContactsForUser,
  syncHubSpotDealsForUser,
} from "@/app/actions/hubspot";
import { syncCalendarEventsForUser } from "@/app/actions/google-calendar";
import { syncGmailForUser } from "@/app/actions/gmail";
import { requireCronBearerAuth } from "@/lib/cron-auth";
import { runWithConcurrency } from "@/lib/async-pool";
import { incrementMetric } from "@/lib/metrics";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SyncError {
  integration: string;
  userId: string;
  error: string;
}

interface SyncResults {
  salesforce: number;
  hubspot: number;
  calendar: number;
  gmail: number;
  scanned: number;
  created: number;
  updated: number;
  failedItems: number;
  errors: SyncError[];
}

const INTEGRATION_SYNC_CONCURRENCY = 4;

// Per-user wrapper: deal sync drives the cron's aggregate response, but
// contact sync runs unconditionally afterward so its failure cannot
// silently swallow deal-side success and a deal-side throw does not
// skip the contact pull. Each sub-call already catches and reports its
// own errors via the logger — the outer try/catches here are defensive
// against unexpected throws (e.g. database connection failure during
// the integration row lookup), not a primary error path.
async function runSalesforceSyncForUser(userId: string) {
  let dealsResult: Awaited<ReturnType<typeof syncSalesforceDealsForUser>>;
  try {
    dealsResult = await syncSalesforceDealsForUser(userId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logWarn("Salesforce deals sync threw unexpectedly", { userId, error: msg });
    dealsResult = {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      scanned: 0,
      failed: 1,
      errors: [msg],
    };
  }

  try {
    await syncSalesforceContactsForUser(userId);
  } catch (error) {
    logWarn("Salesforce contacts sync threw unexpectedly", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return dealsResult;
}

async function runHubSpotSyncForUser(userId: string) {
  let dealsResult: Awaited<ReturnType<typeof syncHubSpotDealsForUser>>;
  try {
    dealsResult = await syncHubSpotDealsForUser(userId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logWarn("HubSpot deals sync threw unexpectedly", { userId, error: msg });
    dealsResult = {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      scanned: 0,
      failed: 1,
      errors: [msg],
    };
  }

  try {
    await syncHubSpotContactsForUser(userId);
  } catch (error) {
    logWarn("HubSpot contacts sync threw unexpectedly", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return dealsResult;
}

async function runProviderSync(
  provider: "salesforce" | "hubspot" | "calendar" | "gmail",
  integrations: Array<{ userId: string }>,
  runSync: (userId: string) => Promise<{
    success: boolean;
    scanned?: number;
    created?: number;
    updated?: number;
    failed?: number;
    errors?: string[];
  }>
): Promise<{
  synced: number;
  scanned: number;
  created: number;
  updated: number;
  failedItems: number;
  errors: SyncError[];
  durationMs: number;
}> {
  const startedAt = Date.now();
  let synced = 0;
  let scanned = 0;
  let created = 0;
  let updated = 0;
  let failedItems = 0;
  const errors: SyncError[] = [];

  await runWithConcurrency(
    integrations,
    INTEGRATION_SYNC_CONCURRENCY,
    async (integration) => {
      const perUserStart = Date.now();
      try {
        const result = await runSync(integration.userId);
        scanned += result.scanned ?? 0;
        created += result.created ?? 0;
        updated += result.updated ?? 0;
        failedItems += result.failed ?? 0;
        if (result.success) {
          synced++;
          return;
        }
        const msg = result.errors?.[0] ?? "Sync returned unsuccessful result";
        errors.push({
          integration: provider,
          userId: integration.userId,
          error: msg,
        });
        logWarn("Integration sync returned unsuccessful", {
          provider,
          userId: integration.userId,
          durationMs: Date.now() - perUserStart,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push({
          integration: provider,
          userId: integration.userId,
          error: msg,
        });
        logWarn("Integration sync failed for user", {
          provider,
          userId: integration.userId,
          durationMs: Date.now() - perUserStart,
          error: msg,
        });
      }
    }
  );

  return {
    synced,
    scanned,
    created,
    updated,
    failedItems,
    errors,
    durationMs: Date.now() - startedAt,
  };
}

export async function GET(request: NextRequest) {
  const authError = requireCronBearerAuth(request);
  if (authError) return authError;

  const startedAt = Date.now();
  try {
    const results: SyncResults = {
      salesforce: 0,
      hubspot: 0,
      calendar: 0,
      gmail: 0,
      scanned: 0,
      created: 0,
      updated: 0,
      failedItems: 0,
      errors: [],
    };

    const salesforceIntegrations = await prisma.salesforceIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    const hubspotIntegrations = await prisma.hubSpotIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    const calendarIntegrations = await prisma.googleCalendarIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });
    const gmailIntegrations = await prisma.gmailIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    const [salesforceRun, hubspotRun, calendarRun, gmailRun] = await Promise.all([
      runProviderSync("salesforce", salesforceIntegrations, runSalesforceSyncForUser),
      runProviderSync("hubspot", hubspotIntegrations, runHubSpotSyncForUser),
      runProviderSync("calendar", calendarIntegrations, syncCalendarEventsForUser),
      runProviderSync("gmail", gmailIntegrations, syncGmailForUser),
    ]);

    results.salesforce = salesforceRun.synced;
    results.hubspot = hubspotRun.synced;
    results.calendar = calendarRun.synced;
    results.gmail = gmailRun.synced;
    results.scanned = salesforceRun.scanned + hubspotRun.scanned + calendarRun.scanned + gmailRun.scanned;
    results.created = salesforceRun.created + hubspotRun.created + calendarRun.created + gmailRun.created;
    results.updated = salesforceRun.updated + hubspotRun.updated + calendarRun.updated + gmailRun.updated;
    results.failedItems =
      salesforceRun.failedItems + hubspotRun.failedItems + calendarRun.failedItems + gmailRun.failedItems;
    results.errors.push(...salesforceRun.errors, ...hubspotRun.errors, ...calendarRun.errors, ...gmailRun.errors);

    const totalDurationMs = Date.now() - startedAt;
    void incrementMetric("sync.integrations.run", 1);
    void incrementMetric("sync.integrations.duration_ms", totalDurationMs);
    if (results.errors.length > 0) {
      void incrementMetric("sync.integrations.errors", results.errors.length);
    }

    logInfo("Integration sync cron completed", {
      timestamp: new Date().toISOString(),
      durationMs: totalDurationMs,
      concurrency: INTEGRATION_SYNC_CONCURRENCY,
      salesforce: results.salesforce,
      hubspot: results.hubspot,
      calendar: results.calendar,
      gmail: results.gmail,
      salesforceDurationMs: salesforceRun.durationMs,
      hubspotDurationMs: hubspotRun.durationMs,
      calendarDurationMs: calendarRun.durationMs,
      gmailDurationMs: gmailRun.durationMs,
      recordsScanned: results.scanned,
      recordsCreated: results.created,
      recordsUpdated: results.updated,
      failedItems: results.failedItems,
      errorCount: results.errors.length,
    });

    return NextResponse.json({
      success: true,
      results: {
        salesforce: {
          synced: results.salesforce,
          total: salesforceIntegrations.length,
        },
        hubspot: {
          synced: results.hubspot,
          total: hubspotIntegrations.length,
        },
        calendar: {
          synced: results.calendar,
          total: calendarIntegrations.length,
        },
        gmail: {
          synced: results.gmail,
          total: gmailIntegrations.length,
        },
        records: {
          scanned: results.scanned,
          created: results.created,
          updated: results.updated,
          failed: results.failedItems,
        },
        errors: results.errors.length,
      },
    });
  } catch (error) {
    logError("Integration sync cron failed", error, {
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
