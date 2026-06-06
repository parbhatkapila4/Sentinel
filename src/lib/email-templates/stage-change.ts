import { escapeHtml, humanizeStage } from "./shared";

export function stageChangeEmailHtml(
  dealName: string,
  oldStage: string,
  newStage: string
): string {
  const oldLabel = humanizeStage(oldStage);
  const newLabel = humanizeStage(newStage);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deal stage update - ${escapeHtml(dealName)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
    <tr>
      <td style="padding: 40px 24px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; color: #64748b;">DEAL UPDATE</p>
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.3;">Stage change: ${escapeHtml(dealName)}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                The deal <strong>${escapeHtml(dealName)}</strong> has been moved from <strong>${escapeHtml(oldLabel)}</strong> to <strong>${escapeHtml(newLabel)}</strong> in your pipeline.
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
                Keeping your pipeline data accurate ensures better forecasting, clearer visibility for your team, and more reliable insights from Sentinel.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0f172a;">Recommended next steps</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;">
                      <li>Review the deal in Sentinel to confirm details, value, and timeline.</li>
                      <li>Update internal stakeholders or your manager if this stage change affects forecasts or commitments.</li>
                      <li>Schedule any follow-up tasks (calls, demos, proposals) that align with the new stage.</li>
                      <li>Use Sentinel’s AI assistant to discuss strategy, next actions, or objections for this deal.</li>
                      <li>If the deal was moved to a closing stage, ensure contracts and handoff steps are in place.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #334155;">
                If you did not make this change, we recommend logging into Sentinel to verify the update and adjust if needed.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #64748b;">
                You are receiving this email because you have stage-change notifications enabled for your account. To change your notification preferences, open Sentinel and go to Settings → Notifications.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Sentinel - Revenue intelligence and deal management.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
