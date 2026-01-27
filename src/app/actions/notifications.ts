"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function getMyNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  const userId = await getAuthenticatedUserId();
  return getUserNotifications(userId, options);
}

export async function getMyUnreadCount() {
  const userId = await getAuthenticatedUserId();
  return getUnreadCount(userId);
}

export async function markNotificationRead(notificationId: string) {
  const userId = await getAuthenticatedUserId();
  await markAsRead(notificationId, userId);
  revalidatePath("/notifications");
  revalidatePath("/api/notifications");
}

export async function markAllNotificationsRead() {
  const userId = await getAuthenticatedUserId();
  await markAllAsRead(userId);
  revalidatePath("/notifications");
  revalidatePath("/api/notifications");
}

export async function deleteMyNotification(notificationId: string) {
  const userId = await getAuthenticatedUserId();
  await deleteNotification(notificationId, userId);
  revalidatePath("/notifications");
  revalidatePath("/api/notifications");
}

const DEFAULT_SETTINGS = {
  emailOnDealAtRisk: true,
  emailOnActionOverdue: true,
  emailOnStageChange: false,
  emailOnTeamActivity: true,
  emailDigestFrequency: "daily" as const,
};

export async function getMyNotificationSettings() {
  const userId = await getAuthenticatedUserId();
  const row = await prisma.userNotificationSettings.findUnique({
    where: { userId },
  });
  if (!row)
    return {
      id: null,
      userId,
      ...DEFAULT_SETTINGS,
    };
  return {
    id: row.id,
    userId: row.userId,
    emailOnDealAtRisk: row.emailOnDealAtRisk,
    emailOnActionOverdue: row.emailOnActionOverdue,
    emailOnStageChange: row.emailOnStageChange,
    emailOnTeamActivity: row.emailOnTeamActivity,
    emailDigestFrequency: row.emailDigestFrequency as
      | "realtime"
      | "daily"
      | "weekly"
      | "never",
  };
}

export async function updateMyNotificationSettings(settings: {
  emailOnDealAtRisk?: boolean;
  emailOnActionOverdue?: boolean;
  emailOnStageChange?: boolean;
  emailOnTeamActivity?: boolean;
  emailDigestFrequency?: "realtime" | "daily" | "weekly" | "never";
}) {
  const userId = await getAuthenticatedUserId();
  await prisma.userNotificationSettings.upsert({
    where: { userId },
    create: {
      userId,
      emailOnDealAtRisk: settings.emailOnDealAtRisk ?? DEFAULT_SETTINGS.emailOnDealAtRisk,
      emailOnActionOverdue:
        settings.emailOnActionOverdue ?? DEFAULT_SETTINGS.emailOnActionOverdue,
      emailOnStageChange:
        settings.emailOnStageChange ?? DEFAULT_SETTINGS.emailOnStageChange,
      emailOnTeamActivity:
        settings.emailOnTeamActivity ?? DEFAULT_SETTINGS.emailOnTeamActivity,
      emailDigestFrequency:
        settings.emailDigestFrequency ?? DEFAULT_SETTINGS.emailDigestFrequency,
    },
    update: {
      ...(settings.emailOnDealAtRisk !== undefined && {
        emailOnDealAtRisk: settings.emailOnDealAtRisk,
      }),
      ...(settings.emailOnActionOverdue !== undefined && {
        emailOnActionOverdue: settings.emailOnActionOverdue,
      }),
      ...(settings.emailOnStageChange !== undefined && {
        emailOnStageChange: settings.emailOnStageChange,
      }),
      ...(settings.emailOnTeamActivity !== undefined && {
        emailOnTeamActivity: settings.emailOnTeamActivity,
      }),
      ...(settings.emailDigestFrequency !== undefined && {
        emailDigestFrequency: settings.emailDigestFrequency,
      }),
    },
  });
  revalidatePath("/settings");
  revalidatePath("/settings/notifications");
}
