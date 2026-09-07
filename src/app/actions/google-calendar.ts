"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateGoogleCalendarCredentials } from "@/lib/google-calendar";
import { logIntegrationAction } from "./integrations";
import { runIntegrationConnect } from "@/lib/integration-flow";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { syncLegacyGoogleCalendarForUser } from "@/lib/sync/google-calendar-sync";
import { SYNC_IN_PROGRESS_MESSAGE } from "@/lib/sync/lock";

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

  const result = await syncLegacyGoogleCalendarForUser(userId, {
    requireSyncEnabled: false,
  });

  if (result.lockSkipped) {
    throw new Error(SYNC_IN_PROGRESS_MESSAGE);
  }

  if (!result.success) {
    const message = result.errors?.[0] ?? "Google Calendar sync failed";
    await logIntegrationAction("google_calendar", "sync", "failed", message);
    throw new Error(message);
  }

  const skipped = result.skipped ?? 0;
  await logIntegrationAction(
    "google_calendar",
    "sync",
    "success",
    `Synced ${result.synced} meetings (${result.created} created, ${result.updated} updated, ${result.linked} linked to deals, ${skipped} dropped by CRM filter)`,
    {
      created: result.created,
      updated: result.updated,
      linked: result.linked,
      skipped,
      total: result.scanned ?? 0,
    }
  );

  revalidatePath("/settings");
  revalidatePath("/deals");
  revalidatePath("/dashboard");

  return result;
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
