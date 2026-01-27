import { createNotification } from "./notifications";
import {
  dealAtRiskEmailHtml,
  actionOverdueEmailHtml,
} from "./email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function triggerDealAtRiskNotification(deal: {
  id: string;
  name: string;
  userId: string;
  riskLevel: string;
  primaryRiskReason?: string | null;
}): Promise<void> {
  const level = (deal.riskLevel || "").toLowerCase();
  if (level !== "high" && level !== "critical") return;

  const riskReason = deal.primaryRiskReason ?? "Deal marked as high risk.";
  const dealUrl = `${APP_URL}/deals/${deal.id}`;
  const html = dealAtRiskEmailHtml(deal.name, riskReason, dealUrl);

  await createNotification({
    userId: deal.userId,
    type: "deal_at_risk",
    title: `Deal at Risk: ${deal.name}`,
    message: riskReason,
    dealId: deal.id,
    sendEmail: true,
    emailSubject: `Deal at Risk: ${deal.name}`,
    emailHtml: html,
  });
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
  const dealUrl = `${APP_URL}/deals/${deal.id}`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a"><h2>Deal Stage Changed: ${escapeHtml(deal.name)}</h2><p>${escapeHtml(message)}</p><p><a href="${dealUrl}">View deal</a></p><p style="color:#6b7280;font-size:14px">— Sentinel</p></body></html>`;

  await createNotification({
    userId: deal.userId,
    type: "stage_changed",
    title: `Deal Stage Changed: ${deal.name}`,
    message,
    dealId: deal.id,
    sendEmail: true,
    emailSubject: `Deal Stage Changed: ${deal.name}`,
    emailHtml: html,
  });
}
