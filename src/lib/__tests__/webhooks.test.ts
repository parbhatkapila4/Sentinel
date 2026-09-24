import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { deliverWebhook, type WebhookPayload } from "@/lib/webhooks";

const payload: WebhookPayload = {
  id: "delivery-1",
  event: "deal.created",
  timestamp: "2026-09-24T00:00:00.000Z",
  data: { id: "deal-1" },
};

function webhookRow(url: string) {
  return {
    id: "wh-1",
    userId: "user-1",
    teamId: null,
    name: "Deals feed",
    url,
    secret: "secret",
    events: ["deal.created"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  resetPrismaMock();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("deliverWebhook only delivers over https", () => {
  it("records a failed delivery and never sends to an http URL", async () => {
    prismaMock.webhook.findUnique.mockResolvedValue(
      webhookRow("http://example.com/hook")
    );

    const result = await deliverWebhook("wh-1", payload);

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.webhookDelivery.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        webhookId: "wh-1",
        success: false,
        response: expect.stringContaining("https"),
      }),
    });
  });

  it("does not follow redirects from an https URL", async () => {
    prismaMock.webhook.findUnique.mockResolvedValue(
      webhookRow("https://example.com/hook")
    );
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    });

    await deliverWebhook("wh-1", payload);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({ redirect: "manual" })
    );
  });
});
