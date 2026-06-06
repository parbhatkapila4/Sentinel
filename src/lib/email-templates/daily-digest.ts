import { escapeHtml, getAppUrl } from "./shared";

export function dailyDigestEmailHtml(
  notifications: Array<{ title: string; message: string }>
): string {
  const items = notifications
    .slice(0, 10)
    .map(
      (n) =>
        `<li style="margin-bottom: 8px;"><strong>${escapeHtml(n.title)}</strong><br/>${escapeHtml(n.message)}</li>`
    )
    .join("");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Daily digest</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2>Your daily digest</h2>
  <ul style="list-style: none; padding: 0;">${items || "<li>No new notifications.</li>"}</ul>
  <p><a href="${getAppUrl()}/notifications" style="color: #2563eb;">View all notifications</a></p>
  <p style="color: #6b7280; font-size: 14px;">- Sentinel</p>
</body>
</html>`;
}
