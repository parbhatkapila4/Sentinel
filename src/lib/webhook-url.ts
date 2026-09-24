export const WEBHOOK_URL_HTTPS_MESSAGE = "Webhook URL must use https://";

export function isHttpsWebhookUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
