"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  validateGoogleCalendarCredentials,
  fetchCalendarEvents,
  mapCalendarEventToMeeting,
  findPotentialDealMatch,
} from "@/lib/google-calendar";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { notifySlackAfterCrmSync } from "@/lib/post-crm-sync-slack";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "@/lib/integration-secrets";
import { incrementMetric } from "@/lib/metrics";
import { logInfo, logWarn } from "@/lib/logger";

export interface GoogleCalendarStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  syncEnabled: boolean;
  calendarId: string | null;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  created: number;
  updated: number;
  linked: number;
  scanned?: number;
  failed?: number;
  errors?: string[];
}

export interface MeetingDetails {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
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

export async function connectGoogleCalendar(
  apiKey: string,
  calendarId: string
): Promise<{ success: boolean }> {
  return runIntegrationConnect({
    provider: "google_calendar",
    hasExisting: async (userId) =>
      Boolean(
        await prisma.googleCalendarIntegration.findUnique({ where: { userId } })
      ),
    validate: () => validateGoogleCalendarCredentials(apiKey, calendarId),
    upsert: async ({ userId }) => {
      const encryptedKey = encryptIntegrationSecret(apiKey);
      await prisma.googleCalendarIntegration.upsert({
        where: { userId },
        create: {
          userId,
          apiKey: encryptedKey,
          calendarId,
          isActive: true,
          syncEnabled: true,
        },
        update: {
          apiKey: encryptedKey,
          calendarId,
          isActive: true,
        },
      });
    },
    successMessage: () => "Successfully connected to Google Calendar",
  });
}

export async function disconnectGoogleCalendar(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.googleCalendarIntegration.delete({
    where: { userId },
  }).catch(() => {
  });

  await logIntegrationAction(
    "google_calendar",
    "disconnect",
    "success",
    "Disconnected from Google Calendar"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncCalendarEvents(): Promise<SyncResult> {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Google Calendar is not connected");
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await fetchCalendarEvents(
      decryptIntegrationSecret(integration.apiKey),
      integration.calendarId,
      now,
      thirtyDaysFromNow
    );

    const deals = await prisma.deal.findMany({
      where: { userId },
      select: { id: true, name: true, location: true },
    });

    let created = 0;
    let updated = 0;
    let linked = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        const meetingData = mapCalendarEventToMeeting(event, userId);

        const existingMeeting = await prisma.meeting.findFirst({
          where: {
            userId,
            externalId: meetingData.externalId,
            source: "google_calendar",
          },
        });

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
          });
          meetingId = newMeeting.id;
          created++;
        }

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
        errors.push(`Failed to sync event ${event.id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await prisma.googleCalendarIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
      },
    });

    await logIntegrationAction(
      "google_calendar",
      "sync",
      "success",
      `Synced ${totalSynced} meetings (${created} created, ${updated} updated, ${linked} linked to deals)`,
      { created, updated, linked, total: events.length }
    );

    revalidatePath("/settings");
    revalidatePath("/deals");
    revalidatePath("/dashboard");

    void notifySlackAfterCrmSync(userId, {
      provider: "google_calendar",
      created,
      updated,
    });

    return {
      success: true,
      synced: totalSynced,
      created,
      updated,
      linked,
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

    await logIntegrationAction(
      "google_calendar",
      "sync",
      "failed",
      String(error)
    );

    throw error;
  }
}

export async function getUpcomingMeetings(dealId?: string): Promise<Array<{
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location: string | null;
  meetingLink: string | null;
  dealId: string | null;
}>> {
  const userId = await getAuthenticatedUserId();

  const where: {
    userId: string;
    startTime: { gte: Date };
    dealId?: string;
  } = {
    userId,
    startTime: { gte: new Date() },
  };

  if (dealId) {
    where.dealId = dealId;
  }

  const meetings = await prisma.meeting.findMany({
    where,
    orderBy: { startTime: "asc" },
    take: 20,
  });

  return meetings;
}

export async function linkMeetingToDeal(
  meetingId: string,
  dealId: string
): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.meeting.updateMany({
    where: { id: meetingId, userId },
    data: { dealId },
  });

  revalidatePath("/deals");
  return { success: true };
}

export async function unlinkMeetingFromDeal(
  meetingId: string
): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.meeting.updateMany({
    where: { id: meetingId, userId },
    data: { dealId: null },
  });

  revalidatePath("/deals");
  return { success: true };
}

export async function createMeetingForDeal(
  dealId: string,
  details: MeetingDetails
): Promise<{
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
}> {
  const userId = await getAuthenticatedUserId();

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, userId },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  const meeting = await prisma.meeting.create({
    data: {
      userId,
      dealId,
      title: details.title,
      description: details.description || null,
      startTime: details.startTime,
      endTime: details.endTime,
      attendees: details.attendees || [],
      location: details.location || null,
      source: "manual",
    },
  });

  await logIntegrationAction(
    "google_calendar",
    "create_meeting",
    "success",
    `Created meeting "${details.title}" for deal "${deal.name}"`
  );

  revalidatePath("/deals");
  return meeting;
}

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const fallback: GoogleCalendarStatus = {
    connected: false,
    lastSyncAt: null,
    lastSyncStatus: null,
    syncEnabled: false,
    calendarId: null,
  };

  try {
    const userId = await getAuthenticatedUserId();

    const integration = await prisma.googleCalendarIntegration.findFirst({
      where: { userId },
    });

    if (!integration || !integration.isActive) {
      return fallback;
    }

    const maskedCalendarId = integration.calendarId.includes("@")
      ? integration.calendarId.split("@")[0].slice(0, 4) + "...@" + integration.calendarId.split("@")[1]
      : integration.calendarId === "primary"
        ? "primary"
        : integration.calendarId.slice(0, 8) + "...";

    return {
      connected: true,
      lastSyncAt: integration.lastSyncAt,
      lastSyncStatus: integration.lastSyncStatus,
      syncEnabled: integration.syncEnabled,
      calendarId: maskedCalendarId,
    };
  } catch {
    return fallback;
  }
}

export async function updateGoogleCalendarSettings(settings: {
  syncEnabled?: boolean;
}): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await prisma.googleCalendarIntegration.update({
    where: { userId },
    data: settings,
  });

  await logIntegrationAction(
    "google_calendar",
    "settings_update",
    "success",
    `Updated settings: ${JSON.stringify(settings)}`
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function syncCalendarEventsForUser(userId: string): Promise<SyncResult> {
  const startedAt = Date.now();
  const integration = await prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0, linked: 0 };
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await fetchCalendarEvents(
      decryptIntegrationSecret(integration.apiKey),
      integration.calendarId,
      now,
      thirtyDaysFromNow
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
    const errors: string[] = [];

    for (const event of events) {
      try {
        const meetingData = mapCalendarEventToMeeting(event, userId);
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
    if (errors.length > 0) {
      await logIntegrationAction(
        "google_calendar",
        "sync",
        "partial",
        errors.slice(0, 10).join("; "),
      );
    }

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
