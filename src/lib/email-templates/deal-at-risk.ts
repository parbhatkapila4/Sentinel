import { escapeHtml } from "./shared";

export function dealAtRiskEmailHtml(
  dealName: string,
  riskReason: string,
  dealUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Deal at Risk - Sentinel</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="color: #b91c1c;">Your deal is at risk</h2>
  <p><strong>${escapeHtml(dealName)}</strong> has been flagged as at risk.</p>
  <p>${escapeHtml(riskReason)}</p>
  <p>Open Sentinel to view the deal, fix it, take the recommended action, or discuss next steps with the AI.</p>
  <p><a href="${escapeHtml(dealUrl)}" style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">View deal in Sentinel</a></p>
  <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">You’re receiving this because this deal entered a risk state. This email is sent only once per risk period.</p>
  <p style="color: #6b7280; font-size: 14px;">- Sentinel</p>
</body>
</html>`;
}
