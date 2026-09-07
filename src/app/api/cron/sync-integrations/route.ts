import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCronBearerAuth } from "@/lib/cron-auth";
import { incrementMetric } from "@/lib/metrics";
import { logError, logInfo, logWarn } from "@/lib/logger";
import {
  syncSalesforceContactsForUser,
  syncSalesforceDealsForUser,
} from "@/lib/sync/salesforce-sync";
import {
  syncHubSpotContactsForUser,
  syncHubSpotDealsForUser,
} from "@/lib/sync/hubspot-sync";
import { syncLegacyGoogleCalendarForUser } from "@/lib/sync/google-calendar-sync";
import { syncGmailForUser } from "@/lib/sync/gmail-sync";
import {
  MAX_ITEM_ATTEMPTS,
  SYNC_PROVIDER_ORDER,
  clearSyncCursor,
  isCursorPersistenceAvailable,
  itemsAfter,
  loadSyncCursor,
  newSyncCursor,
  saveSyncCursor,
  sortWorkItems,
  workKey,
  type SyncCursor,
  type SyncProvider,
  type SyncWorkItem,
} from "@/lib/sync/cron-cursor";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SOFT_DEADLINE_MS = 30_000;

interface ItemOutcome {
  success: boolean;
  lockSkipped: boolean;
  scanned: number;
  created: number;
  updated: number;
  failed: number;
  error?: string;
}

function fromSyncResult(result: {
  success: boolean;
  scanned?: number;
  created?: number;
  updated?: number;
  failed?: number;
  errors?: string[];
  lockSkipped?: boolean;
}): ItemOutcome {
  return {
    success: result.success,
    lockSkipped: Boolean(result.lockSkipped),
    scanned: result.scanned ?? 0,
    created: result.created ?? 0,
    updated: result.updated ?? 0,
    failed: result.failed ?? 0,
    error: result.success ? undefined : result.errors?.[0],
  };
}

async function runItem(item: SyncWorkItem): Promise<ItemOutcome> {
  switch (item.provider) {
    case "salesforce": {
      const deals = await syncSalesforceDealsForUser(item.userId);
      if (!deals.lockSkipped) {
        const contacts = await syncSalesforceContactsForUser(item.userId);
        if (contacts.errors.length > 0 && !contacts.lockSkipped) {
          logWarn("Salesforce contacts sync reported errors", {
            userId: item.userId,
            errors: contacts.errors.slice(0, 3),
          });
        }
      }
      return fromSyncResult(deals);
    }
    case "hubspot": {
      const deals = await syncHubSpotDealsForUser(item.userId);
      if (!deals.lockSkipped) {
        const contacts = await syncHubSpotContactsForUser(item.userId);
        if (contacts.errors.length > 0 && !contacts.lockSkipped) {
          logWarn("HubSpot contacts sync reported errors", {
            userId: item.userId,
            errors: contacts.errors.slice(0, 3),
          });
        }
      }
      return fromSyncResult(deals);
    }
    case "google_calendar":
      return fromSyncResult(await syncLegacyGoogleCalendarForUser(item.userId));
    case "gmail":
      return fromSyncResult(await syncGmailForUser(item.userId));
  }
}

async function loadWorkItems(): Promise<SyncWorkItem[]> {
  const activeWhere = { isActive: true, syncEnabled: true } as const;
  const select = { userId: true } as const;
  const [salesforce, hubspot, googleCalendar, gmail] = await Promise.all([
    prisma.salesforceIntegration.findMany({ where: activeWhere, select }),
    prisma.hubSpotIntegration.findMany({ where: activeWhere, select }),
    prisma.googleCalendarIntegration.findMany({ where: activeWhere, select }),
    prisma.gmailIntegration.findMany({ where: activeWhere, select }),
  ]);

  const byProvider: Record<SyncProvider, string[]> = {
    salesforce: salesforce.map((r) => r.userId),
    hubspot: hubspot.map((r) => r.userId),
    google_calendar: googleCalendar.map((r) => r.userId),
    gmail: gmail.map((r) => r.userId),
  };

  const items: SyncWorkItem[] = [];
  for (const provider of SYNC_PROVIDER_ORDER) {
    for (const userId of byProvider[provider]) {
      items.push({ provider, userId, key: workKey(provider, userId) });
    }
  }
  return sortWorkItems(items);
}

export async function GET(request: NextRequest) {
  const authError = requireCronBearerAuth(request);
  if (authError) return authError;

  const startedAt = Date.now();
  const deadline = startedAt + SOFT_DEADLINE_MS;

  try {
    const items = await loadWorkItems();
    const cursorPersisted = isCursorPersistenceAvailable();
    if (!cursorPersisted) {
      logWarn("cron_sync_cursor_unavailable", {
        reason: "redis_not_configured",
        totalItems: items.length,
      });
      void incrementMetric("sync.integrations.cursor_unavailable", 1);
    }

    let cursor: SyncCursor =
      (await loadSyncCursor()) ?? newSyncCursor(new Date(startedAt).toISOString());

    if (cursor.inProgress && cursor.inProgress.attempts >= MAX_ITEM_ATTEMPTS) {
      const stuckKey = cursor.inProgress.key;
      logError(
        "cron_sync_item_exhausted",
        new Error(`sync item ${stuckKey} did not finish in ${MAX_ITEM_ATTEMPTS} invocations`),
        { key: stuckKey, attempts: cursor.inProgress.attempts }
      );
      void incrementMetric("sync.integrations.item_exhausted", 1);
      cursor = {
        ...cursor,
        exhausted: [...cursor.exhausted, stuckKey],
        lastKey: stuckKey,
        inProgress: null,
      };
      await saveSyncCursor(cursor);
    }

    const pending = itemsAfter(items, cursor.lastKey);
    let remaining = pending.length;
    let processed = 0;
    let lockedSkipped = 0;
    let failures = 0;
    const records = { scanned: 0, created: 0, updated: 0, failed: 0 };
    const errors: Array<{ key: string; error: string }> = [];

    for (const item of pending) {
      if (Date.now() >= deadline) break;

      const attempts =
        (cursor.inProgress?.key === item.key ? cursor.inProgress.attempts : 0) + 1;
      cursor = { ...cursor, inProgress: { key: item.key, attempts } };
      await saveSyncCursor(cursor);

      const itemStart = Date.now();
      let outcome: ItemOutcome;
      try {
        outcome = await runItem(item);
      } catch (error) {
        outcome = {
          success: false,
          lockSkipped: false,
          scanned: 0,
          created: 0,
          updated: 0,
          failed: 1,
          error: error instanceof Error ? error.message : String(error),
        };
      }

      cursor = { ...cursor, lastKey: item.key, inProgress: null };
      await saveSyncCursor(cursor);

      remaining--;
      processed++;
      records.scanned += outcome.scanned;
      records.created += outcome.created;
      records.updated += outcome.updated;
      records.failed += outcome.failed;

      if (outcome.lockSkipped) {
        lockedSkipped++;
        logInfo("Integration sync skipped: lock held by another run", {
          provider: item.provider,
          userId: item.userId,
        });
        continue;
      }
      if (!outcome.success) {
        failures++;
        if (outcome.error) errors.push({ key: item.key, error: outcome.error });
        logWarn("Integration sync returned unsuccessful", {
          provider: item.provider,
          userId: item.userId,
          attempts,
          durationMs: Date.now() - itemStart,
          error: outcome.error,
        });
        continue;
      }
      logInfo("Integration sync completed for user", {
        provider: item.provider,
        userId: item.userId,
        attempts,
        durationMs: Date.now() - itemStart,
        scanned: outcome.scanned,
        created: outcome.created,
        updated: outcome.updated,
        failed: outcome.failed,
      });
    }

    const passComplete = remaining === 0;
    const durationMs = Date.now() - startedAt;

    void incrementMetric("sync.integrations.run", 1);
    void incrementMetric("sync.integrations.duration_ms", durationMs);
    if (failures > 0) {
      void incrementMetric("sync.integrations.errors", failures);
    }

    if (passComplete) {
      const passStarted = Date.parse(cursor.startedAt);
      logInfo("Integration sync pass complete", {
        passStartedAt: cursor.startedAt,
        passDurationMs: Number.isFinite(passStarted) ? Date.now() - passStarted : null,
        totalItems: items.length,
        exhausted: cursor.exhausted,
        invocationDurationMs: durationMs,
      });
      void incrementMetric("sync.integrations.pass_complete", 1);
      await clearSyncCursor();
    } else {
      logInfo("Integration sync pass partial; will resume next invocation", {
        passStartedAt: cursor.startedAt,
        processedThisRun: processed,
        remaining,
        resumeAfter: cursor.lastKey,
        softDeadlineMs: SOFT_DEADLINE_MS,
        invocationDurationMs: durationMs,
      });
    }

    return NextResponse.json({
      success: true,
      cursorPersisted,
      passStartedAt: cursor.startedAt,
      passComplete,
      totalItems: items.length,
      processed,
      remaining,
      resumeAfter: passComplete ? null : cursor.lastKey,
      lockedSkipped,
      exhausted: cursor.exhausted,
      records,
      errors: errors.length,
      durationMs,
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
