import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@example.com";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!resend) {
    throw new Error("Resend API key is not configured. Please set RESEND_API_KEY environment variable.");
  }

  if (!fromEmail || fromEmail === "notifications@example.com") {
    throw new Error("Resend from email is not configured. Please set RESEND_FROM_EMAIL environment variable.");
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);
      throw new Error(`Failed to send email: ${result.error.message || JSON.stringify(result.error)}`);
    }

    if (!result.data || !result.data.id) {
      throw new Error("Email send returned no confirmation. Email may not have been sent.");
    }

    console.log("[email] Email sent successfully:", { to, subject, id: result.data.id });
  } catch (err: unknown) {
    console.error("[email] Send failed:", err);
    if (err instanceof Error) {
      throw err;
    }
    const errorMessage = err && typeof err === "object" && "message" in err ? String(err.message) : "Unknown error";
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

export function dealAtRiskEmailHtml(
  dealName: string,
  riskReason: string,
  dealUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Deal at Risk</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="color: #b91c1c;">Deal at Risk: ${escapeHtml(dealName)}</h2>
  <p>${escapeHtml(riskReason)}</p>
  <p><a href="${escapeHtml(dealUrl)}" style="color: #2563eb;">View deal</a></p>
  <p style="color: #6b7280; font-size: 14px;">— Sentinel</p>
</body>
</html>`;
}

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
  <p style="color: #6b7280; font-size: 14px;">— Sentinel</p>
</body>
</html>`;
}

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
  <p style="color: #6b7280; font-size: 14px;">— Sentinel</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function teamInviteEmailHtml(
  inviterName: string,
  inviterEmail: string,
  acceptUrl: string,
  role?: string
): string {
  const roleLabel = role === "admin" ? "Administrator" : role === "manager" ? "Manager" : role === "viewer" ? "Viewer" : "Member";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join Sentinel</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">You're Invited!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                <strong>${escapeHtml(inviterName)}</strong> (${escapeHtml(inviterEmail)}) has invited you to join <strong>Sentinel</strong> as a <strong>${escapeHtml(roleLabel)}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Sentinel is an AI-powered revenue intelligence platform that helps teams track deals, collaborate effectively, and monitor pipeline risks.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 12px; color: #1a1a1a; font-size: 15px; font-weight: 600;">What you'll get:</p>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li>Track and manage your deals in one place</li>
                  <li>Collaborate with your team in real-time</li>
                  <li>Get AI-powered insights and recommendations</li>
                  <li>Monitor pipeline risks and get early warnings</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${escapeHtml(acceptUrl)}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center;">
                This invitation expires in <strong>7 days</strong>.
              </p>
              
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${escapeHtml(acceptUrl)}" style="color: #3b82f6; word-break: break-all;">${escapeHtml(acceptUrl)}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                © ${new Date().getFullYear()} Sentinel. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                This email was sent by ${escapeHtml(inviterName)}. If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
