import { auth, currentUser } from "@clerk/nextjs/server";
import { createNotification } from "./notifications";
import {
  dealAtRiskEmailHtml,
  actionOverdueEmailHtml,
  stageChangeEmailHtml,
  sendEmail as sendEmailViaResend,
} from "./email";
import { prisma } from "./prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function triggerDealAtRiskNotification(
  deal: {
    id: string;
    name: string;
    userId: string;
    riskLevel: string;
    primaryRiskReason?: string | null;
  },
  options?: { sendEmail?: boolean }
): Promise<void> {
  const level = (deal.riskLevel || "").toLowerCase();
  if (level !== "high" && level !== "critical") return;

  const riskReason = deal.primaryRiskReason ?? "Deal marked as high risk.";
  const dealUrl = `${APP_URL}/deals/${deal.id}`;
  const html = dealAtRiskEmailHtml(deal.name, riskReason, dealUrl);
  const shouldSendEmail = options?.sendEmail ?? true;

  const notification = await createNotification({
    userId: deal.userId,
    type: "deal_at_risk",
    title: `Deal at Risk: ${deal.name}`,
    message: riskReason,
    dealId: deal.id,
    sendEmail: false,
    emailSubject: `Deal at Risk: ${deal.name}`,
    emailHtml: html,
  });

  if (shouldSendEmail) {
    try {
      const settings = await prisma.userNotificationSettings.findUnique({
        where: { userId: deal.userId },
      });
      const user = await prisma.user.findUnique({
        where: { id: deal.userId },
        select: { email: true },
      });
      let email = user?.email?.trim();
      if (!email) {
        const { userId } = await auth();
        if (userId === deal.userId) {
          const clerkUser = await currentUser();
          email = clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ?? "";
          if (email) {
            await prisma.user.updateMany({
              where: { id: deal.userId },
              data: { email },
            });
          }
        }
      }
      const send = settings?.emailOnDealAtRisk ?? true;
      if (send && email) {
        await sendEmailViaResend(email, `Deal at Risk: ${deal.name}`, html);
        await prisma.notification.updateMany({
          where: { id: notification.id },
          data: { emailSent: true },
        });
      }
    } catch (e) {
      console.error("[notification-triggers] Deal at risk email send failed:", e);
    }
  }
}

export async function triggerActionOverdueNotification(
  deal: { id: string; name: string; userId: string },
  actionLabel: string,
  daysOverdue: number
): Promise<void> {
  const html = actionOverdueEmailHtml(deal.name, actionLabel, daysOverdue);

  await createNotification({
    userId: deal.userId,
    type: "action_overdue",
    title: `Action Overdue: ${deal.name}`,
    message: `${actionLabel} is ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`,
    dealId: deal.id,
    sendEmail: true,
    emailSubject: `Action Overdue: ${deal.name}`,
    emailHtml: html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function triggerStageChangeNotification(
  deal: { id: string; name: string; userId: string },
  oldStage: string,
  newStage: string
): Promise<void> {
  const message = `Moved from ${oldStage} to ${newStage}`;
  const html = stageChangeEmailHtml(deal.name, oldStage, newStage);

  const notification = await createNotification({
    userId: deal.userId,
    type: "stage_changed",
    title: `Deal Stage Changed: ${deal.name}`,
    message,
    dealId: deal.id,
    sendEmail: false,
    emailSubject: `Deal Stage Changed: ${deal.name}`,
    emailHtml: html,
  });

  try {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: deal.userId },
    });
    const user = await prisma.user.findUnique({
      where: { id: deal.userId },
      select: { email: true },
    });
    let email = user?.email?.trim();
    if (!email) {
      const { userId } = await auth();
      if (userId === deal.userId) {
        const clerkUser = await currentUser();
        email = clerkUser?.emailAddresses?.[0]?.emailAddress?.trim() ?? "";
        if (email) {
          await prisma.user.updateMany({
            where: { id: deal.userId },
            data: { email },
          });
        }
      }
    }
    const send = settings?.emailOnStageChange ?? true;
    if (send && email) {
      await sendEmailViaResend(email, `Deal Stage Changed: ${deal.name}`, html);
      await prisma.notification.updateMany({
        where: { id: notification.id },
        data: { emailSent: true },
      });
    }
  } catch (e) {
    console.error("[notification-triggers] Stage change email send failed:", e);
  }
}
