"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit-log";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { logError } from "@/lib/logger";
import { deleteIfExists } from "@/lib/prisma-helpers";

export interface SalesforceIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  lastContactsSyncedAt: Date | null;
  totalContactsSynced: number;
  syncEnabled: boolean;
  instanceUrl: string | null;
}

export interface HubSpotIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  lastContactsSyncedAt: Date | null;
  totalContactsSynced: number;
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
}

export interface GmailIntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  totalSynced: number;
  syncEnabled: boolean;
}

export interface AllIntegrationStatuses {
  salesforce: SalesforceIntegrationStatus;
  hubspot: HubSpotIntegrationStatus;
  googleCalendar: GoogleCalendarIntegrationStatus;
  slack: SlackIntegrationStatus;
  gmail: GmailIntegrationStatus;
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

  const [
    salesforce,
    hubspot,
    googleCalendar,
    calendarIntegration,
    slackSubscriptions,
    gmail,
  ] = await Promise.all([
    prisma.salesforceIntegration.findUnique({
      where: { userId },
      select: {
        isActive: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        totalSynced: true,
        lastContactsSyncedAt: true,
        totalContactsSynced: true,
        syncEnabled: true,
        instanceUrl: true,
      },
    }),
    prisma.hubSpotIntegration.findUnique({
      where: { userId },
      select: {
        isActive: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        totalSynced: true,
        lastContactsSyncedAt: true,
        totalContactsSynced: true,
        syncEnabled: true,
        portalId: true,
      },
    }),
    prisma.googleCalendarIntegration.findUnique({
      where: { userId },
      select: {
        isActive: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        syncEnabled: true,
        calendarId: true,
      },
    }),
    prisma.calendarIntegration.findUnique({
      where: { userId },
      select: { id: true },
    }),
    prisma.slackEventsSubscription.findMany({
      where: { userId, isActive: true },
      select: { id: true },
    }),
    prisma.gmailIntegration.findUnique({
      where: { userId },
      select: {
        isActive: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        totalSynced: true,
        syncEnabled: true,
      },
    }),
  ]);

  const salesforceStatus: SalesforceIntegrationStatus = salesforce?.isActive
    ? {
      connected: true,
      lastSyncAt: salesforce.lastSyncAt,
      lastSyncStatus: salesforce.lastSyncStatus,
      totalSynced: salesforce.totalSynced,
      lastContactsSyncedAt: salesforce.lastContactsSyncedAt,
      totalContactsSynced: salesforce.totalContactsSynced,
      syncEnabled: salesforce.syncEnabled,
      instanceUrl: salesforce.instanceUrl.replace(/^(https?:\/\/[^.]+)\..*$/, "$1.***"),
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      lastContactsSyncedAt: null,
      totalContactsSynced: 0,
      syncEnabled: false,
      instanceUrl: null,
    };

  const hubspotStatus: HubSpotIntegrationStatus = hubspot?.isActive
    ? {
      connected: true,
      lastSyncAt: hubspot.lastSyncAt,
      lastSyncStatus: hubspot.lastSyncStatus,
      totalSynced: hubspot.totalSynced,
      lastContactsSyncedAt: hubspot.lastContactsSyncedAt,
      totalContactsSynced: hubspot.totalContactsSynced,
      syncEnabled: hubspot.syncEnabled,
      portalId: hubspot.portalId,
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      lastContactsSyncedAt: null,
      totalContactsSynced: 0,
      syncEnabled: false,
      portalId: null,
    };

  const isLegacyActive = Boolean(googleCalendar?.isActive);
  const isOAuthConnected = Boolean(calendarIntegration);
  const googleCalendarStatus: GoogleCalendarIntegrationStatus =
    isLegacyActive || isOAuthConnected
      ? {
        connected: true,
        lastSyncAt: googleCalendar?.lastSyncAt ?? null,
        lastSyncStatus: googleCalendar?.lastSyncStatus ?? null,
        syncEnabled: googleCalendar?.syncEnabled ?? true,
        calendarId: googleCalendar?.calendarId
          ? googleCalendar.calendarId.includes("@")
            ? googleCalendar.calendarId.split("@")[0].slice(0, 4) +
            "...@" +
            googleCalendar.calendarId.split("@")[1]
            : googleCalendar.calendarId === "primary"
              ? "primary"
              : googleCalendar.calendarId.slice(0, 8) + "..."
          : null,
      }
      : {
        connected: false,
        lastSyncAt: null,
        lastSyncStatus: null,
        syncEnabled: false,
        calendarId: null,
      };

  const slackStatus: SlackIntegrationStatus = {
    connected: slackSubscriptions.length > 0,
  };

  const gmailStatus: GmailIntegrationStatus = gmail?.isActive
    ? {
      connected: true,
      lastSyncAt: gmail.lastSyncAt,
      lastSyncStatus: gmail.lastSyncStatus,
      totalSynced: gmail.totalSynced,
      syncEnabled: gmail.syncEnabled,
    }
    : {
      connected: false,
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      syncEnabled: false,
    };

  return {
    salesforce: salesforceStatus,
    hubspot: hubspotStatus,
    googleCalendar: googleCalendarStatus,
    slack: slackStatus,
    gmail: gmailStatus,
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

  const logs = await prisma.integrationLog.findMany({
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

    await prisma.integrationLog.create({
      data: {
        userId,
        integration,
        action,
        status,
        message: message || null,
        ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
    });
  } catch (error) {
    logError("Failed to log integration action", error, {
      integration,
      action,
      status,
    });
  }
}

export async function getSalesforceIntegration() {
  const userId = await getAuthenticatedUserId();
  return prisma.salesforceIntegration.findUnique({
    where: { userId },
  });
}

export async function createSalesforceIntegration(data: {
  consumerKey: string;
  consumerSecret: string;
  instanceUrl: string;
}) {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });

  const encryptedConsumerKey = encryptIntegrationSecret(data.consumerKey);
  const encryptedConsumerSecret = encryptIntegrationSecret(data.consumerSecret);

  const integration = await prisma.salesforceIntegration.upsert({
    where: { userId },
    create: {
      userId,
      consumerKey: encryptedConsumerKey,
      consumerSecret: encryptedConsumerSecret,
      instanceUrl: data.instanceUrl,
    },
    update: {
      consumerKey: encryptedConsumerKey,
      consumerSecret: encryptedConsumerSecret,
      instanceUrl: data.instanceUrl,
      isActive: true,
      accessToken: null,
      accessTokenExpiresAt: null,
    },
  });


  await logAuditEvent(
    userId,
    existing ? AUDIT_ACTIONS.INTEGRATION_UPDATED : AUDIT_ACTIONS.INTEGRATION_CONNECTED,
    "integration",
    integration.id,
    {
      integrationType: "salesforce",
      instanceUrl: data.instanceUrl.replace(/^(https?:\/\/[^.]+)\..*$/, "$1.***"),
    }
  );

  revalidatePath("/settings");
  return integration;
}

export async function deleteSalesforceIntegration() {
  const userId = await getAuthenticatedUserId();
  const integration = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });

  await deleteIfExists(
    () => prisma.salesforceIntegration.delete({ where: { userId } }),
    { resource: "salesforceIntegration", userId }
  );


  if (integration) {
    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.INTEGRATION_DISCONNECTED,
      "integration",
      integration.id,
      {
        integrationType: "salesforce",
      }
    );
  }

  revalidatePath("/settings");
}

export async function getHubSpotIntegration() {
  const userId = await getAuthenticatedUserId();
  return prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });
}

export async function createHubSpotIntegration(data: {
  apiKey: string;
  portalId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  const integration = await prisma.hubSpotIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: encryptIntegrationSecret(data.apiKey),
      portalId: data.portalId || null,
    },
    update: {
      apiKey: encryptIntegrationSecret(data.apiKey),
      portalId: data.portalId || null,
      isActive: true,
    },
  });


  await logAuditEvent(
    userId,
    existing ? AUDIT_ACTIONS.INTEGRATION_UPDATED : AUDIT_ACTIONS.INTEGRATION_CONNECTED,
    "integration",
    integration.id,
    {
      integrationType: "hubspot",
      portalId: data.portalId,
    }
  );

  revalidatePath("/settings");
  return integration;
}

export async function deleteHubSpotIntegration() {
  const userId = await getAuthenticatedUserId();
  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  await deleteIfExists(
    () => prisma.hubSpotIntegration.delete({ where: { userId } }),
    { resource: "hubSpotIntegration", userId }
  );


  if (integration) {
    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.INTEGRATION_DISCONNECTED,
      "integration",
      integration.id,
      {
        integrationType: "hubspot",
      }
    );
  }

  revalidatePath("/settings");
}

export async function getGoogleCalendarIntegration() {
  const userId = await getAuthenticatedUserId();
  return prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });
}

export async function createGoogleCalendarIntegration(data: {
  apiKey: string;
  calendarId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const existing = await prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  const integration = await prisma.googleCalendarIntegration.upsert({
    where: { userId },
    create: {
      userId,
      apiKey: encryptIntegrationSecret(data.apiKey),
      calendarId: data.calendarId || "primary",
    },
    update: {
      apiKey: encryptIntegrationSecret(data.apiKey),
      calendarId: data.calendarId || "primary",
      isActive: true,
    },
  });


  await logAuditEvent(
    userId,
    existing ? AUDIT_ACTIONS.INTEGRATION_UPDATED : AUDIT_ACTIONS.INTEGRATION_CONNECTED,
    "integration",
    integration.id,
    {
      integrationType: "google_calendar",
      calendarId: data.calendarId || "primary",
    }
  );

  revalidatePath("/settings");
  return integration;
}

export async function deleteGoogleCalendarIntegration() {
  const userId = await getAuthenticatedUserId();
  const integration = await prisma.googleCalendarIntegration.findUnique({
    where: { userId },
  });

  await deleteIfExists(
    () => prisma.googleCalendarIntegration.delete({ where: { userId } }),
    { resource: "googleCalendarIntegration", userId }
  );


  if (integration) {
    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.INTEGRATION_DISCONNECTED,
      "integration",
      integration.id,
      {
        integrationType: "google_calendar",
      }
    );
  }

  revalidatePath("/settings");
}


export async function markIntegrationKeyRotated(
  integrationType: "salesforce" | "hubspot" | "google_calendar"
): Promise<void> {
  const userId = await getAuthenticatedUserId();

  try {
    switch (integrationType) {
      case "salesforce":
        await prisma.salesforceIntegration.update({
          where: { userId },
          data: { rotatedAt: new Date() },
        });
        break;
      case "hubspot":
        await prisma.hubSpotIntegration.update({
          where: { userId },
          data: { rotatedAt: new Date() },
        });
        break;
      case "google_calendar":
        await prisma.googleCalendarIntegration.update({
          where: { userId },
          data: { rotatedAt: new Date() },
        });
        break;
    }
  } catch (error) {
    logError("Failed to mark integration key as rotated", error, {
      integrationType,
    });
  }
}


export async function isIntegrationKeyOld(
  integrationType: "salesforce" | "hubspot" | "google_calendar"
): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    let integration: { rotatedAt: Date | null; createdAt: Date } | null = null;

    switch (integrationType) {
      case "salesforce":
        integration = await prisma.salesforceIntegration.findUnique({
          where: { userId },
          select: { rotatedAt: true, createdAt: true },
        });
        break;
      case "hubspot":
        integration = await prisma.hubSpotIntegration.findUnique({
          where: { userId },
          select: { rotatedAt: true, createdAt: true },
        });
        break;
      case "google_calendar":
        integration = await prisma.googleCalendarIntegration.findUnique({
          where: { userId },
          select: { rotatedAt: true, createdAt: true },
        });
        break;
    }

    if (!integration) return false;


    const checkDate = integration.rotatedAt || integration.createdAt;
    return checkDate < ninetyDaysAgo;
  } catch {
    return false;
  }
}
