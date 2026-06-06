import { Resend } from "resend";
import { logError, logInfo } from "@/lib/logger";

export { dealAtRiskEmailHtml } from "@/lib/email-templates/deal-at-risk";
export { actionOverdueEmailHtml } from "@/lib/email-templates/action-overdue";
export { stageChangeEmailHtml } from "@/lib/email-templates/stage-change";
export { dailyDigestEmailHtml } from "@/lib/email-templates/daily-digest";
export { teamInviteEmailHtml } from "@/lib/email-templates/team-invite";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@example.com";

const resend = apiKey ? new Resend(apiKey) : null;

function maskEmail(addr: string): string {
  const at = addr.indexOf("@");
  if (at <= 0) return "<redacted>";
  const local = addr.slice(0, at);
  const domain = addr.slice(at + 1);
  const localMasked =
    local.length <= 2 ? `${local[0] ?? "*"}*` : `${local.slice(0, 2)}***`;
  return `${localMasked}@${domain}`;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!resend) {
    throw new Error(
      "Resend API key is not configured. Please set RESEND_API_KEY environment variable."
    );
  }

  if (!fromEmail || fromEmail === "notifications@example.com") {
    throw new Error(
      "Resend from email is not configured. Please set RESEND_FROM_EMAIL environment variable."
    );
  }

  try {
    const result = await resend.emails.send({ from: fromEmail, to, subject, html });

    if (result.error) {
      logError("Resend rejected email send", undefined, {
        to: maskEmail(to),
        subject,
        resendErrorName: result.error.name,
        resendErrorMessage: result.error.message,
      });
      throw new Error(
        `Failed to send email: ${result.error.message || JSON.stringify(result.error)}`
      );
    }

    if (!result.data || !result.data.id) {
      throw new Error(
        "Email send returned no confirmation. Email may not have been sent."
      );
    }

    logInfo("Email sent", {
      to: maskEmail(to),
      subject,
      messageId: result.data.id,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logError("Email send failed", err, { to: maskEmail(to), subject });
      throw err;
    }
    const errorMessage =
      err && typeof err === "object" && "message" in err
        ? String(err.message)
        : "Unknown error";
    logError("Email send failed", new Error(errorMessage), {
      to: maskEmail(to),
      subject,
    });
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}
