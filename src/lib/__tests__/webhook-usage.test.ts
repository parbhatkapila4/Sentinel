import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  webhookCount: 0,
  usageWrites: 0,
  plan: null as Record<string, unknown> | null,
}));

vi.mock("../prisma", () => ({
  prisma: {
    userPlan: {
      findUnique: async () => db.plan,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        db.plan = { id: "plan_1", ...data };
        return db.plan;
      },
      update: async ({ data }: { data: Record<string, unknown> }) => {
        db.plan = { ...db.plan, ...data };
        return db.plan;
      },
    },
    usageTracking: {
      findUnique: async () => null,
      upsert: async () => {
        db.usageWrites += 1;
        return {};
      },
    },
    user: { upsert: async ({ create }: { create: Record<string, unknown> }) => create },
    webhook: { count: async () => db.webhookCount },
  },
}));

const { checkUsageLimit, getOrCreateUserPlan, incrementUsage } = await import("../plans");

describe("webhook plan usage", () => {
  beforeEach(() => {
    db.webhookCount = 0;
    db.usageWrites = 0;
    db.plan = null;
  });

  it("counts the webhooks the user has right now", async () => {
    const plan = await getOrCreateUserPlan("user_1");
    db.webhookCount = 1;

    const check = await checkUsageLimit("user_1", "webhooks");

    expect(check.current).toBe(1);
    expect(check.limit).toBe(plan.maxWebhooks);
  });

  it("gives the slot back after a delete", async () => {
    const plan = await getOrCreateUserPlan("user_1");
    db.webhookCount = plan.maxWebhooks;
    expect((await checkUsageLimit("user_1", "webhooks")).allowed).toBe(false);

    db.webhookCount = plan.maxWebhooks - 1;
    const afterDelete = await checkUsageLimit("user_1", "webhooks");
    expect(afterDelete.allowed).toBe(true);
    expect(afterDelete.current).toBe(plan.maxWebhooks - 1);
  });

  it("does not keep a separate counter that could drift", async () => {
    await getOrCreateUserPlan("user_1");
    await incrementUsage("user_1", "webhooks", 1);
    expect(db.usageWrites).toBe(0);
  });
});
