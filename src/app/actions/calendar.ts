"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "@/lib/integration-secrets";
import { batchCheckCrmBook } from "@/lib/crm-permission";
import {
  extractCalendarParticipants,
  type GoogleCalendarEvent,
} from "@/lib/calendar-participants";
import {
  GoogleOAuthHttpError,
  refreshGoogleAccessToken,
} from "@/lib/google-oauth";
import { incrementMetric } from "@/lib/metrics";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { normalizeContactEmail } from "@/lib/contact-utils";

const GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";
const SYNC_WINDOW_DAYS = 90;
const MAX_RESULTS_PER_PAGE = 250;
const MAX_PAGES = 20;
const TOKEN_REFRESH_BUFFER_MS = 60_000;

export interface CalendarSyncResult {
  synced: number;
  skipped_no_attendees: number;
  skipped_no_crm_match: number;
  errors: string[];
}

interface GoogleCalendarApiResponse {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
}

function parseEventTime(
  raw: { dateTime?: string; date?: string } | undefined
): Date | null {
  if (!raw) return null;
  const source = raw.dateTime ?? raw.date;
  if (!source) return null;
  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function ensureFreshAccessToken(integration: {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
}): Promise<string> {
  if (integration.expiryDate.getTime() > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return decryptIntegrationSecret(integration.accessToken);
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth env vars are not configured");
  }

  const refreshed = await refreshGoogleAccessToken({
    refreshToken: decryptIntegrationSecret(integration.refreshToken),
    clientId,
    clientSecret,
  });
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);

  await prisma.calendarIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: encryptIntegrationSecret(refreshed.access_token),
      expiryDate: newExpiry,
    },
  });
  return refreshed.access_token;
}

async function fetchCalendarEventsPage(
  accessToken: string,
  params: { timeMin: string; timeMax: string; pageToken?: string }
): Promise<GoogleCalendarApiResponse> {
  const url = new URL(`${GOOGLE_CALENDAR_BASE}/calendars/primary/events`);
  url.searchParams.set("timeMin", params.timeMin);
  url.searchParams.set("timeMax", params.timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("maxResults", String(MAX_RESULTS_PER_PAGE));
  url.searchParams.set("orderBy", "startTime");
  if (params.pageToken) {
    url.searchParams.set("pageToken", params.pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new GoogleOAuthHttpError(
      "token_exchange",
      res.status,
      `Calendar API list returned ${res.status}`
    );
  }
  return (await res.json()) as GoogleCalendarApiResponse;
}

export async function syncCalendarForUser(
  userId: string
): Promise<CalendarSyncResult> {
  const result: CalendarSyncResult = {
    synced: 0,
    skipped_no_attendees: 0,
    skipped_no_crm_match: 0,
    errors: [],
  };

  const integration = await prisma.calendarIntegration.findUnique({
    where: { userId },
  });
  if (!integration) {
    result.errors.push("No active Calendar integration");
    return result;
  }

  const selfEmail = normalizeContactEmail(integration.email);
  if (!selfEmail) {
    result.errors.push(
      "Calendar integration has no connected email; cannot self-exclude"
    );
    return result;
  }

  let accessToken: string;
  try {
    accessToken = await ensureFreshAccessToken(integration);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    void incrementMetric("crm_permission.calendar_filter.fail_closed", 1);
    logError("calendar_sync_error", error, { step: "token_refresh", userId });
    result.errors.push(`token_refresh_failed: ${msg}`);
    return result;
  }

  const now = Date.now();
  const timeMin = new Date(now - SYNC_WINDOW_DAYS * 86_400_000).toISOString();
  const timeMax = new Date(now + SYNC_WINDOW_DAYS * 86_400_000).toISOString();

  let pageToken: string | undefined;
  let pagesFetched = 0;
  do {
    let page: GoogleCalendarApiResponse;
    try {
      page = await fetchCalendarEventsPage(accessToken, {
        timeMin,
        timeMax,
        pageToken,
      });
    } catch (error) {
      const status =
        error instanceof GoogleOAuthHttpError ? error.status : undefined;
      logError("calendar_sync_error", error, {
        step: "list_events",
        userId,
        ...(status !== undefined ? { status } : {}),
      });
      result.errors.push(
        `list_events_failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return result;
    }

    const items = page.items ?? [];
    for (const event of items) {
      try {
        if (!event.id) continue;

        const participants = extractCalendarParticipants(event);
        const candidates = participants.all.filter((e) => e !== selfEmail);

        if (candidates.length === 0) {
          void incrementMetric(
            "crm_permission.calendar_filter.dropped_no_attendees",
            1
          );
          result.skipped_no_attendees += 1;
          continue;
        }

        const bookResults = await batchCheckCrmBook(userId, candidates);
        const matched: string[] = [];
        for (const check of bookResults.values()) {
          if (check.isInBook && check.contactId) {
            matched.push(check.contactId);
          }
        }
        if (matched.length === 0) {
          void incrementMetric(
            "crm_permission.calendar_filter.dropped_no_crm_match",
            1
          );
          result.skipped_no_crm_match += 1;
          continue;
        }

        const startTime = parseEventTime(
          (event as unknown as { start?: { dateTime?: string; date?: string } })
            .start
        );
        const endTime = parseEventTime(
          (event as unknown as { end?: { dateTime?: string; date?: string } })
            .end
        );
        if (!startTime || !endTime) {
          result.skipped_no_attendees += 1;
          continue;
        }

        const status =
          (event as unknown as { status?: string }).status ?? null;
        const recurringEventId =
          (event as unknown as { recurringEventId?: string })
            .recurringEventId ?? null;

        await prisma.calendarEvent.upsert({
          where: {
            userId_googleEventId: {
              userId,
              googleEventId: event.id,
            },
          },
          create: {
            userId,
            googleEventId: event.id,
            summary: event.summary ?? null,
            description:
              (event as unknown as { description?: string }).description ??
              null,
            startTime,
            endTime,
            organizerEmail: participants.organizer,
            attendees: (event.attendees ?? []) as unknown as Prisma.InputJsonValue,
            status,
            isRecurring: Boolean(recurringEventId),
            recurringEventId,
          },
          update: {
            summary: event.summary ?? null,
            description:
              (event as unknown as { description?: string }).description ??
              null,
            startTime,
            endTime,
            organizerEmail: participants.organizer,
            attendees: (event.attendees ?? []) as unknown as Prisma.InputJsonValue,
            status,
            isRecurring: Boolean(recurringEventId),
            recurringEventId,
          },
        });

        void incrementMetric("crm_permission.calendar_filter.passed", 1);
        result.synced += 1;
      } catch (error) {
        void incrementMetric("crm_permission.calendar_filter.fail_closed", 1);
        logWarn("calendar_event_sync_failed", {
          userId,
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error),
        });
        result.errors.push(
          `event_sync_failed:${event.id ?? "<no-id>"}: ${error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    pageToken = page.nextPageToken;
    pagesFetched += 1;
  } while (pageToken && pagesFetched < MAX_PAGES);

  logInfo("calendar_sync_completed", {
    userId,
    synced: result.synced,
    skipped_no_attendees: result.skipped_no_attendees,
    skipped_no_crm_match: result.skipped_no_crm_match,
    errors: result.errors.length,
    pagesFetched,
  });

  return result;
}

export async function syncCalendar(): Promise<CalendarSyncResult> {
  const userId = await getAuthenticatedUserId();
  return syncCalendarForUser(userId);
}
