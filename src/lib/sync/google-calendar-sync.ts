import { prisma } from "@/lib/prisma";
import {
  fetchCalendarEvents,
  mapCalendarEventToMeeting,
  findPotentialDealMatch,
  type GoogleCalendarEvent,
} from "@/lib/google-calendar";
import { decryptIntegrationSecret } from "@/lib/integration-secrets";
import { hasCrmParticipant } from "@/lib/crm-permission";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";
import { SYNC_IN_PROGRESS, withSyncLock } from "./lock";

const SYNC_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface LegacyCalendarSyncResult {
  success: boolean;
  synced: number;
  created: number;
  updated: number;
  linked: number;
  scanned?: number;
  failed?: number;
  skipped?: number;
  errors?: string[];
  lockSkipped?: boolean;
}

function inferDomainFromAttendees(attendees: string[]): string | null {
  for (const attendee of attendees) {
    const domain = attendee.split("@")[1]?.trim().toLowerCase();
    if (domain) return domain;
  }
  return null;
}

function inferDealNameFromMeeting(meeting: {
  title: string;
  description: string | null;
  attendees: string[];
}): string {
  const normalizedTitle = meeting.title.trim();
  if (normalizedTitle && normalizedTitle.toLowerCase() !== "untitled meeting") {
    return normalizedTitle.slice(0, 120);
  }

  const domain = inferDomainFromAttendees(meeting.attendees);
  if (domain) {
    return `Deal - ${domain}`;
  }

  return "Deal from Google Calendar";
}

async function linkOrCreateDealForMeeting(
  userId: string,
  meetingId: string,
  meetingData: {
    title: string;
    description: string | null;
    attendees: string[];
    externalId: string;
  },
  deals: Array<{
    id: string;
    name: string;
    location?: string | null;
  }>
): Promise<boolean> {
  const potentialDealId = findPotentialDealMatch(meetingData, deals);
  if (potentialDealId) {
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { dealId: potentialDealId },
    });
    return true;
  }

  const locationDomain = inferDomainFromAttendees(meetingData.attendees);
  const createdDeal = await prisma.deal.create({
    data: {
      userId,
      name: inferDealNameFromMeeting(meetingData),
      stage: "discover",
      value: BigInt(0),
      location: locationDomain,
      source: "google_calendar",
      externalId: `gcal:${meetingData.externalId}`,
    },
    select: { id: true, name: true, location: true },
  });

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { dealId: createdDeal.id },
  });

  deals.push(createdDeal);
  return true;
}

function eventParticipantCandidates(
  event: GoogleCalendarEvent,
  attendees: string[]
): string[] {
  const organizerEmail =
    (event as unknown as { organizer?: { email?: string } }).organizer?.email ??
    null;
  return organizerEmail ? [...attendees, organizerEmail] : attendees;
}

export interface LegacyCalendarSyncOptions {
  requireSyncEnabled?: boolean;
}

export async function syncLegacyGoogleCalendarForUser(
  userId: string,
  options: LegacyCalendarSyncOptions = {}
): Promise<LegacyCalendarSyncResult> {
  const outcome = await withSyncLock(userId, "google_calendar_legacy", () =>
    runLegacyCalendarSync(userId, options)
  );
  if (outcome.skipped) {
    return {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      linked: 0,
      errors: [SYNC_IN_PROGRESS],
      lockSkipped: true,
    };
  }
  return outcome.result;
}

async function runLegacyCalendarSync(
  userId: string,
  options: LegacyCalendarSyncOptions
): Promise<LegacyCalendarSyncResult> {
  const startedAt = Date.now();
  const requireSyncEnabled = options.requireSyncEnabled ?? true;
  const integration = await prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  if (
    !integration ||
    !integration.isActive ||
    (requireSyncEnabled && !integration.syncEnabled)
  ) {
    return { success: false, synced: 0, created: 0, updated: 0, linked: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) {
    void incrementMetric("crm_permission.calendar_filter.fail_closed", 1);
    await prisma.googleCalendarIntegration.update({
      where: { userId },
      data: { lastSyncAt: new Date(), lastSyncStatus: "failed" },
    });
    return {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      linked: 0,
      scanned: 0,
      failed: 1,
      errors: ["User email missing; permission filter cannot run"],
    };
  }
  const userEmail = user.email;

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + SYNC_WINDOW_MS);

    const events = await fetchCalendarEvents(
      decryptIntegrationSecret(integration.apiKey),
      integration.calendarId,
      now,
      windowEnd
    );

    const externalIds = events.map((event) => event.id);
    type ExistingMeeting = { id: string; externalId: string | null; dealId: string | null };
    const existingMeetings: ExistingMeeting[] = externalIds.length
      ? await prisma.meeting.findMany({
        where: {
          userId,
          source: "google_calendar",
          externalId: { in: externalIds },
        },
        select: { id: true, externalId: true, dealId: true },
      })
      : [];
    const existingMeetingByExternalId = new Map<string, ExistingMeeting>(
      existingMeetings
        .filter((m): m is ExistingMeeting & { externalId: string } => m.externalId !== null)
        .map((meeting) => [meeting.externalId, meeting])
    );

    const deals = await prisma.deal.findMany({
      where: { userId },
      select: { id: true, name: true, location: true },
    });

    let created = 0;
    let updated = 0;
    let linked = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        const meetingData = mapCalendarEventToMeeting(event, userId);

        const gate = await hasCrmParticipant(
          userId,
          userEmail,
          eventParticipantCandidates(event, meetingData.attendees)
        );
        if (!gate.passed) {
          const metric =
            gate.reason === "no_external_participants"
              ? "crm_permission.calendar_filter.dropped_no_attendees"
              : gate.reason === "fail_closed_error"
                ? "crm_permission.calendar_filter.fail_closed"
                : "crm_permission.calendar_filter.dropped_no_crm_match";
          void incrementMetric(metric, 1);
          skipped++;
          continue;
        }

        const existingMeeting = existingMeetingByExternalId.get(meetingData.externalId);

        let meetingId: string;

        if (existingMeeting) {
          await prisma.meeting.update({
            where: { id: existingMeeting.id },
            data: {
              title: meetingData.title,
              description: meetingData.description,
              startTime: meetingData.startTime,
              endTime: meetingData.endTime,
              attendees: meetingData.attendees,
              location: meetingData.location,
              meetingLink: meetingData.meetingLink,
            },
          });
          meetingId = existingMeeting.id;
          updated++;
        } else {
          const newMeeting = await prisma.meeting.create({
            data: meetingData,
            select: { id: true, externalId: true, dealId: true },
          }) as { id: string; externalId: string; dealId: string | null };
          meetingId = newMeeting.id;
          existingMeetingByExternalId.set(newMeeting.externalId, newMeeting);
          created++;
        }
        void incrementMetric("crm_permission.calendar_filter.passed", 1);

        if (!existingMeeting?.dealId) {
          const didLink = await linkOrCreateDealForMeeting(
            userId,
            meetingId,
            meetingData,
            deals
          );
          if (didLink) linked++;
        }
      } catch (error) {
        errors.push(
          `Failed to sync calendar event ${event.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    await prisma.googleCalendarIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
      },
    });

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.google_calendar.duration_ms", durationMs);
    void incrementMetric("sync.google_calendar.success", 1);
    if (errors.length > 0) {
      void incrementMetric("sync.google_calendar.item_errors", errors.length);
    }
    logInfo("Google Calendar user sync completed", {
      userId,
      scanned: events.length,
      created,
      updated,
      linked,
      skipped,
      failed: errors.length,
      failureReasons: errors.slice(0, 3),
      durationMs,
    });
    void notifySlackAfterCrmSync(userId, {
      provider: "google_calendar",
      created,
      updated,
    });

    return {
      success: true,
      synced: created + updated,
      created,
      updated,
      linked,
      scanned: events.length,
      failed: errors.length,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await prisma.googleCalendarIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
      },
    });

    const durationMs = Date.now() - startedAt;
    void incrementMetric("sync.google_calendar.errors", 1);
    logWarn("Google Calendar user sync failed", {
      userId,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      synced: 0,
      created: 0,
      updated: 0,
      linked: 0,
      scanned: 0,
      failed: 1,
      errors: [String(error)],
    };
  }
}
