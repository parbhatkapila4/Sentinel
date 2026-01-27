import { prisma } from "./prisma";
import { redis } from "./redis";

const EMAIL_QUEUE = "email_queue";

export type NotificationType =
  | "deal_at_risk"
  | "action_overdue"
  | "stage_changed"
  | "team_invite"
  | "mention";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  dealId?: string;
  teamId?: string;
  sendEmail?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

export type Notification = Awaited<ReturnType<typeof createNotification>>;

export async function createNotification(
  data: CreateNotificationInput
): Promise<{
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  dealId: string | null;
  teamId: string | null;
  read: boolean;
  emailSent: boolean;
  createdAt: Date;
}> {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      dealId: data.dealId ?? null,
      teamId: data.teamId ?? null,
    },
  });

  if (data.sendEmail && redis) {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: data.userId },
    });
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true },
    });
    const email = user?.email?.trim();
    if (!email) return notification;

    let send = false;
    if (data.type === "deal_at_risk")
      send = settings?.emailOnDealAtRisk ?? true;
    else if (data.type === "action_overdue")
      send = settings?.emailOnActionOverdue ?? true;
    else if (data.type === "stage_changed")
      send = settings?.emailOnStageChange ?? false;
    else if (data.type === "team_invite" || data.type === "mention")
      send = settings?.emailOnTeamActivity ?? true;

    if (send && data.emailHtml) {
      try {
        await redis.lpush(
          EMAIL_QUEUE,
          JSON.stringify({
            notificationId: notification.id,
            to: email,
            subject: data.emailSubject ?? data.title,
            html: data.emailHtml,
          })
        );
      } catch (e) {
        console.error("[notifications] Failed to queue email:", e);
      }
    }
  }

  return notification;
}

export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; skip?: number; unreadOnly?: boolean }
): Promise<
  Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    dealId: string | null;
    teamId: string | null;
    read: boolean;
    emailSent: boolean;
    createdAt: Date;
  }>
> {
  const where = { userId } as { userId: string; read?: boolean };
  if (options?.unreadOnly) where.read = false;

  const list = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: options?.skip ?? 0,
    take: options?.limit ?? 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      dealId: true,
      teamId: true,
      read: true,
      emailSent: true,
      createdAt: true,
    },
  });
  return list;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId },
    data: { read: true },
  });
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}
