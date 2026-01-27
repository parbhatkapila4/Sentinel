"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface SalesforceIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
  instanceUrl: string | null;
}

export interface HubSpotIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
  portalId: string | null;
}

export interface GoogleCalendarIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  syncEnabled: boolean;
  calendarId: string | null;
}

export interface SlackIntegrationStatus {
  connected: boolean;
  channelCount: number;
  channels: string[];
}

export interface AllIntegrationStatuses {
  salesforce: SalesforceIntegrationStatus;
  hubspot: HubSpotIntegrationStatus;
  googleCalendar: GoogleCalendarIntegrationStatus;
  slack: SlackIntegrationStatus;
}

export interface IntegrationLogEntry {
  id: string;
  integration: string;
  action: string;
  status: string;
  message: string | null;
  createdAt: Date;
}

export async function getAllIntegrationStatuses(): Promise<AllIntegrationStatuses> {
  const userId = await getAuthenticatedUserId();

  const [salesforce, hubspot, googleCalendar, slackIntegrations] = await Promise.all([
    db.salesforceIntegration.findUnique({
      where: { userId },
    }),
    db.hubSpotIntegration.findUnique({
      where: { userId },
    }),
    db.googleCalendarIntegration.findUnique({
      where: { userId },
    }),
    prisma.slackIntegration.findMany({
      where: { userId, isActive: true },
    }),
  ]);

  const salesforceStatus: SalesforceIntegrationStatus = salesforce?.isActive
    ? {
      connected: true,
      lastSyncAt: salesforce.lastSyncAt,
      lastSyncStatus: salesforce.lastSyncStatus,
      totalSynced: salesforce.totalSynced,
      syncEnabled: salesforce.syncEnabled,
      instanceUrl: salesforce.instanceUrl.replace(/^(https?:\/\/[^.]+)\..*$/, "$1.***"),
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
      instanceUrl: null,
    };

  const hubspotStatus: HubSpotIntegrationStatus = hubspot?.isActive
    ? {
      connected: true,
      lastSyncAt: hubspot.lastSyncAt,
      lastSyncStatus: hubspot.lastSyncStatus,
      totalSynced: hubspot.totalSynced,
      syncEnabled: hubspot.syncEnabled,
      portalId: hubspot.portalId,
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
      portalId: null,
    };

  const googleCalendarStatus: GoogleCalendarIntegrationStatus = googleCalendar?.isActive
    ? {
      connected: true,
      lastSyncAt: googleCalendar.lastSyncAt,
      lastSyncStatus: googleCalendar.lastSyncStatus,
      syncEnabled: googleCalendar.syncEnabled,
      calendarId: googleCalendar.calendarId.includes("@")
        ? googleCalendar.calendarId.split("@")[0].slice(0, 4) + "...@" + googleCalendar.calendarId.split("@")[1]
        : googleCalendar.calendarId === "primary"
          ? "primary"
          : googleCalendar.calendarId.slice(0, 8) + "...",
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      syncEnabled: false,
      calendarId: null,
    };

  const slackStatus: SlackIntegrationStatus = slackIntegrations.length > 0
    ? {
      connected: true,
      channelCount: slackIntegrations.length,
      channels: slackIntegrations
        .map((s: { channelName?: string | null }) => s.channelName || "Unknown")
        .filter(Boolean) as string[],
    }
    : {
      connected: false,
      channelCount: 0,
      channels: [],
    };

  return {
    salesforce: salesforceStatus,
    hubspot: hubspotStatus,
    googleCalendar: googleCalendarStatus,
    slack: slackStatus,
  };
}

export async function getIntegrationLogs(
  integration?: string,
  limit: number = 20
): Promise<IntegrationLogEntry[]> {
  const userId = await getAuthenticatedUserId();

  const where: { userId: string; integration?: string } = { userId };
  if (integration) {
    where.integration = integration;
  }

  const logs = await db.integrationLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      integration: true,
      action: true,
      status: true,
      message: true,
      createdAt: true,
    },
  });

  return logs;
}

export async function logIntegrationAction(
  integration: string,
  action: string,
  status: string,
  message?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();

    await db.integrationLog.create({
      data: {
        userId,
        integration,
        action,
        status,
        message: message || null,
        metadata: metadata || null,
      },
    });
  } catch (error) {
    console.error("Failed to log integration action:", error);
  }
}

export async function getSalesforceIntegration() {
  const userId = await getAuthenticatedUserId();
  return db.salesforceIntegration.findUnique({
    where: { userId },
  });
}

export async function createSalesforceIntegration(data: {
  apiKey: string;
  instanceUrl: string;
}) {
  const userId = await getAuthenticatedUserId();

  const integration = await db.salesforceIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: data.apiKey,
      instanceUrl: data.instanceUrl,
    },
    update: {
      apiKey: data.apiKey,
      instanceUrl: data.instanceUrl,
      isActive: true,
    },
  });

  revalidatePath("/settings");
  return integration;
}

export async function deleteSalesforceIntegration() {
  const userId = await getAuthenticatedUserId();
  await db.salesforceIntegration.delete({
    where: { userId },
  }).catch(() => { });
  revalidatePath("/settings");
}

export async function getHubSpotIntegration() {
  const userId = await getAuthenticatedUserId();
  return db.hubSpotIntegration.findUnique({
    where: { userId },
  });
}

export async function createHubSpotIntegration(data: {
  apiKey: string;
  portalId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const integration = await db.hubSpotIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: data.apiKey,
      portalId: data.portalId || null,
    },
    update: {
      apiKey: data.apiKey,
      portalId: data.portalId || null,
      isActive: true,
    },
  });

  revalidatePath("/settings");
  return integration;
}

export async function deleteHubSpotIntegration() {
  const userId = await getAuthenticatedUserId();
  await db.hubSpotIntegration.delete({
    where: { userId },
  }).catch(() => { });
  revalidatePath("/settings");
}

export async function getGoogleCalendarIntegration() {
  const userId = await getAuthenticatedUserId();
  return db.googleCalendarIntegration.findUnique({
    where: { userId },
  });
}

export async function createGoogleCalendarIntegration(data: {
  apiKey: string;
  calendarId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const integration = await db.googleCalendarIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: data.apiKey,
      calendarId: data.calendarId || "primary",
    },
    update: {
      apiKey: data.apiKey,
      calendarId: data.calendarId || "primary",
      isActive: true,
    },
  });

  revalidatePath("/settings");
  return integration;
}

export async function deleteGoogleCalendarIntegration() {
  const userId = await getAuthenticatedUserId();
  await db.googleCalendarIntegration.delete({
    where: { userId },
  }).catch(() => { });
  revalidatePath("/settings");
}
