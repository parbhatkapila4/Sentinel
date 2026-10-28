import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import {
  mockGetAuthenticatedUserId,
  resetAuthMock,
  TEST_USER_ID,
} from "@/test/mocks/auth";

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

import {
  createWebhook,
  getMyWebhooks,
  getWebhookById,
  revealWebhookSecret,
} from "@/app/actions/webhooks";

const SECRET = "4f0c-signing-secret";

const ROW = {
  id: "wh-1",
  name: "Production relay",
  url: "https://hooks.example.com/sentinel",
  events: ["deal.created"],
  isActive: true,
  createdAt: new Date("2026-10-01T09:00:00Z"),
  _count: { deliveries: 2 },
};

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
});

describe("the signing secret reaches the browser only when the owner asks", () => {
  it("the webhook list leaves the secret out", async () => {
    prismaMock.webhook.findMany.mockResolvedValue([ROW] as never);

    const list = await getMyWebhooks();

    const args = prismaMock.webhook.findMany.mock.calls[0]?.[0];
    expect(args?.where).toEqual({ userId: TEST_USER_ID });
    expect(args?.select).toBeDefined();
    expect(args?.select).not.toHaveProperty("secret");
    expect(args).not.toHaveProperty("include");
    expect(JSON.stringify(list)).not.toContain(SECRET);
  });

  it("the detail page leaves out the secret and the delivery payloads", async () => {
    prismaMock.webhook.findFirst.mockResolvedValue({
      ...ROW,
      deliveries: [
        {
          id: "d1",
          event: "deal.created",
          statusCode: 200,
          response: "x".repeat(900),
          success: true,
          createdAt: new Date(),
        },
        {
          id: "d2",
          event: "deal.created",
          statusCode: 200,
          response: null,
          success: true,
          createdAt: new Date(),
        },
      ],
    } as never);
    prismaMock.webhookDelivery.findMany.mockResolvedValue([{ id: "d2" }] as never);

    const webhook = await getWebhookById("wh-1");

    const args = prismaMock.webhook.findFirst.mock.calls[0]?.[0];
    expect(args?.where).toEqual({ id: "wh-1", userId: TEST_USER_ID });
    expect(args?.select).not.toHaveProperty("secret");
    const deliveries = (args?.select as { deliveries: { select: object; take: number } })
      .deliveries;
    expect(deliveries.select).not.toHaveProperty("payload");
    expect(deliveries.take).toBe(20);
    expect(prismaMock.webhookDelivery.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["d1", "d2"] },
        payload: { path: ["data", "test"], equals: true },
      },
      select: { id: true },
    });
    expect(webhook).not.toHaveProperty("secret");
    expect(webhook?.deliveries.map((d) => d.isTest)).toEqual([false, true]);
    expect(webhook?.deliveries[0].response).toHaveLength(200);
  });

  it("a missing webhook comes back as null without a second query", async () => {
    prismaMock.webhook.findFirst.mockResolvedValue(null);
    await expect(getWebhookById("nope")).resolves.toBeNull();
    expect(prismaMock.webhookDelivery.findMany).not.toHaveBeenCalled();
  });

  it("creating a webhook does not hand its secret back", async () => {
    prismaMock.webhook.create.mockResolvedValue({
      ...ROW,
      userId: TEST_USER_ID,
      teamId: null,
      secret: SECRET,
      updatedAt: new Date(),
    } as never);

    const created = await createWebhook({
      name: ROW.name,
      url: ROW.url,
      events: ROW.events,
    });

    expect(created).not.toHaveProperty("secret");
    expect(JSON.stringify(created)).not.toContain(SECRET);
    expect(created.id).toBe("wh-1");
  });

  it("revealing reads the owner's secret only", async () => {
    prismaMock.webhook.findFirst.mockResolvedValueOnce({ secret: SECRET } as never);
    await expect(revealWebhookSecret("wh-1")).resolves.toBe(SECRET);
    expect(prismaMock.webhook.findFirst).toHaveBeenCalledWith({
      where: { id: "wh-1", userId: TEST_USER_ID },
      select: { secret: true },
    });

    prismaMock.webhook.findFirst.mockResolvedValueOnce(null);
    await expect(revealWebhookSecret("someone-elses")).resolves.toBeNull();
  });
});
