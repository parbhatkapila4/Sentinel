import { escapeHtml, getAppUrl } from "./shared";

export function actionOverdueEmailHtml(
  dealName: string,
  actionLabel: string,
  daysOverdue: number
): string {
  const msg =
    daysOverdue === 1
      ? `${escapeHtml(actionLabel)} is 1 day overdue.`
      : `${escapeHtml(actionLabel)} is ${daysOverdue} days overdue.`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Action Overdue</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="color: #b45309;">Action Overdue: ${escapeHtml(dealName)}</h2>
  <p>${msg}</p>
  <p><a href="${getAppUrl()}/deals" style="color: #2563eb;">View deals</a></p>
  <p style="color: #6b7280; font-size: 14px;">- Sentinel</p>
</body>
</html>`;
}
