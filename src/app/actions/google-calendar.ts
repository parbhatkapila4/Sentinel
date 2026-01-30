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
import { enforceIntegrationLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

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

export async function connectGoogleCalendar(
  apiKey: string,
  calendarId: string
): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  const existing = await db.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  const validation = await validateGoogleCalendarCredentials(apiKey, calendarId);
  if (!validation.valid) {
    await logIntegrationAction(
      "google_calendar",
      "connect",
      "failed",
      validation.error
    );
    throw new Error(validation.error || "Invalid Google Calendar credentials");
  }

  if (!existing) {
    await enforceIntegrationLimit(userId, "google_calendar");
  }

  await db.googleCalendarIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey,
      calendarId,
      isActive: true,
      syncEnabled: true,
    },
    update: {
      apiKey,
      calendarId,
      isActive: true,
    },
  });

  if (!existing) {
    await incrementUsage(userId, "integrations", 1);
  }

  await logIntegrationAction(
    "google_calendar",
    "connect",
    "success",
    "Successfully connected to Google Calendar"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function disconnectGoogleCalendar(): Promise<{ success: boolean }> {
  const userId = await getAuthenticatedUserId();

  await db.googleCalendarIntegration.delete({
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

  const integration = await db.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    throw new Error("Google Calendar is not connected");
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await fetchCalendarEvents(
      integration.apiKey,
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

        const existingMeeting = await db.meeting.findFirst({
          where: {
            userId,
            externalId: meetingData.externalId,
            source: "google_calendar",
          },
        });

        let meetingId: string;

        if (existingMeeting) {
          await db.meeting.update({
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
          const newMeeting = await db.meeting.create({
            data: meetingData,
          });
          meetingId = newMeeting.id;
          created++;
        }

        if (!existingMeeting?.dealId) {
          const potentialDealId = findPotentialDealMatch(meetingData, deals);
          if (potentialDealId) {
            await db.meeting.update({
              where: { id: meetingId },
              data: { dealId: potentialDealId },
            });
            linked++;
          }
        }
      } catch (error) {
        errors.push(`Failed to sync event ${event.id}: ${String(error)}`);
      }
    }

    const totalSynced = created + updated;

    await db.googleCalendarIntegration.update({
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

    return {
      success: true,
      synced: totalSynced,
      created,
      updated,
      linked,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    await db.googleCalendarIntegration.update({
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

  const meetings = await db.meeting.findMany({
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

  await db.meeting.updateMany({
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

  await db.meeting.updateMany({
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

  const meeting = await db.meeting.create({
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

    const integration = await db.googleCalendarIntegration.findFirst({
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

  await db.googleCalendarIntegration.update({
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
  const integration = await db.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0, created: 0, updated: 0, linked: 0 };
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = await fetchCalendarEvents(
      integration.apiKey,
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

    for (const event of events) {
      const meetingData = mapCalendarEventToMeeting(event, userId);

      const existingMeeting = await db.meeting.findFirst({
        where: {
          userId,
          externalId: meetingData.externalId,
          source: "google_calendar",
        },
      });

      let meetingId: string;

      if (existingMeeting) {
        await db.meeting.update({
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
        const newMeeting = await db.meeting.create({
          data: meetingData,
        });
        meetingId = newMeeting.id;
        created++;
      }

      if (!existingMeeting?.dealId) {
        const potentialDealId = findPotentialDealMatch(meetingData, deals);
        if (potentialDealId) {
          await db.meeting.update({
            where: { id: meetingId },
            data: { dealId: potentialDealId },
          });
          linked++;
        }
      }
    }

    await db.googleCalendarIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
      },
    });

    return { success: true, synced: created + updated, created, updated, linked };
  } catch (error) {
    await db.googleCalendarIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
      },
    });

    return { success: false, synced: 0, created: 0, updated: 0, linked: 0, errors: [String(error)] };
  }
}
