import { describe, it, expect } from "vitest";
import { isHttpsWebhookUrl } from "@/lib/webhook-url";

describe("isHttpsWebhookUrl", () => {
  it.each(["https://example.com/hook", "HTTPS://example.com/hook"])(
    "accepts %s",
    (url) => {
      expect(isHttpsWebhookUrl(url)).toBe(true);
    }
  );

  it.each([
    "http://example.com/hook",
    "ftp://example.com/hook",
    "javascript:alert(1)",
    "example.com/hook",
    "",
  ])("rejects %s", (url) => {
    expect(isHttpsWebhookUrl(url)).toBe(false);
  });
});
