import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import { mockGetAuthenticatedUserId, resetAuthMock } from "@/test/mocks/auth";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/plan-enforcement", () => ({
  enforceWebhookLimit: vi.fn(),
}));
vi.mock("@/lib/plans", () => ({
  incrementUsage: vi.fn(),
}));
vi.mock("@/lib/audit-log", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {},
}));

import { createWebhook, updateWebhook } from "@/app/actions/webhooks";
import { ValidationError } from "@/lib/errors";

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
});

describe("webhook URLs must use https", () => {
  it("createWebhook rejects an http URL", async () => {
    await expect(
      createWebhook({
        name: "Deals feed",
        url: "http://example.com/hook",
        events: ["deal.created"],
      })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.webhook.create).not.toHaveBeenCalled();
  });

  it("updateWebhook rejects an http URL", async () => {
    await expect(
      updateWebhook("wh-1", { url: "http://example.com/hook" })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.webhook.updateMany).not.toHaveBeenCalled();
  });
});
