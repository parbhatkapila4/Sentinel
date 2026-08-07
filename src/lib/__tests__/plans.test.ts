import { describe, it, expect, beforeEach, vi } from "vitest";

type PlanRow = Record<string, unknown> & { id: string; userId: string };
type UsageRow = {
  userId: string;
  planId: string;
  metricType: string;
  currentCount: number;
  periodStart: Date;
  periodEnd: Date;
};

const db = {
  plans: new Map<string, PlanRow>(),
  usage: new Map<string, UsageRow>(),
  dealCount: 0,
  teamMemberCount: 0,
};

const usageKey = (userId: string, metricType: string, periodStart: Date) =>
  `${userId}|${metricType}|${periodStart.getTime()}`;

vi.mock("../prisma", () => ({
  prisma: {
    userPlan: {
      findUnique: async ({ where }: { where: { userId: string } }) =>
        db.plans.get(where.userId) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `plan_${data.userId}`, ...data } as PlanRow;
        db.plans.set(row.userId, row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { userId: string };
        data: Record<string, unknown>;
      }) => {
        const row = { ...db.plans.get(where.userId)!, ...data } as PlanRow;
        db.plans.set(where.userId, row);
        return row;
      },
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        db.plans.delete(where.userId);
        return { count: 1 };
      },
    },
    usageTracking: {
      findUnique: async ({
        where,
      }: {
        where: {
          userId_metricType_periodStart: {
            userId: string;
            metricType: string;
            periodStart: Date;
          };
        };
      }) => {
        const k = where.userId_metricType_periodStart;
        return (
          db.usage.get(usageKey(k.userId, k.metricType, k.periodStart)) ?? null
        );
      },
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: {
          userId_metricType_periodStart: {
            userId: string;
            metricType: string;
            periodStart: Date;
          };
        };
        create: UsageRow;
        update: Record<string, unknown>;
      }) => {
        const k = where.userId_metricType_periodStart;
        const key = usageKey(k.userId, k.metricType, k.periodStart);
        const existing = db.usage.get(key);

        if (!existing) {
          db.usage.set(key, { ...create });
          return db.usage.get(key)!;
        }
        const patch = update.currentCount as
          | { increment?: number }
          | number
          | undefined;
        if (typeof patch === "object" && patch?.increment !== undefined) {
          existing.currentCount += patch.increment;
        } else if (typeof patch === "number") {
          existing.currentCount = patch;
        }
        return existing;
      },
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        for (const [key, row] of db.usage) {
          if (row.userId === where.userId) db.usage.delete(key);
        }
        return { count: 1 };
      },
    },
    user: {
      upsert: async ({ create }: { create: Record<string, unknown> }) => create,
    },
    deal: { count: async () => db.dealCount },
    teamMember: { count: async () => db.teamMemberCount },
  },
}));

const { getPlanLimits, getOrCreateUserPlan, checkUsageLimit, incrementUsage } =
  await import("../plans");

describe("Plans", () => {
  const testUserId = "test_user_123";

  beforeEach(() => {
    db.plans.clear();
    db.usage.clear();
    db.dealCount = 0;
    db.teamMemberCount = 0;
  });

  describe("getPlanLimits", () => {
    it("should return correct limits for free plan", () => {
      const limits = getPlanLimits("free");
      expect(limits.maxDeals).toBe(25);
      expect(limits.maxTeamMembers).toBe(1);
      expect(limits.maxApiCalls).toBe(100);
    });

    it("should return correct limits for pro plan", () => {
      const limits = getPlanLimits("pro");
      expect(limits.maxDeals).toBe(100);
      expect(limits.maxTeamMembers).toBe(10);
      expect(limits.maxApiCalls).toBe(50000);
    });
  });

  describe("getOrCreateUserPlan", () => {
    it("should create free plan for new user", async () => {
      const plan = await getOrCreateUserPlan(testUserId);
      expect(plan.planType).toBe("free");
      expect(plan.maxDeals).toBe(25);
    });

    it("should return existing plan if exists", async () => {
      await getOrCreateUserPlan(testUserId);
      const plan2 = await getOrCreateUserPlan(testUserId);
      expect(plan2.planType).toBe("free");
    });

    it("migrates a legacy starter row up to the free allowance", async () => {
      db.plans.set(testUserId, {
        id: `plan_${testUserId}`,
        userId: testUserId,
        planType: "starter",
        planName: "Starter",
        maxDeals: 5,
        maxTeamMembers: 3,
        maxApiCalls: 1000,
        maxWebhooks: 3,
        maxIntegrations: 2,
      });

      const plan = await getOrCreateUserPlan(testUserId);
      expect(plan.planType).toBe("free");
      expect(plan.planName).toBe("Free");
      expect(plan.maxDeals).toBe(25);
      expect(plan.maxTeamMembers).toBe(3);
      expect(plan.maxApiCalls).toBe(1000);
    });

    it("legacy migration is idempotent", async () => {
      db.plans.set(testUserId, {
        id: `plan_${testUserId}`,
        userId: testUserId,
        planType: "starter",
        planName: "Starter",
        maxDeals: 5,
        maxTeamMembers: 1,
        maxApiCalls: 100,
        maxWebhooks: 1,
        maxIntegrations: 1,
      });

      await getOrCreateUserPlan(testUserId);
      const second = await getOrCreateUserPlan(testUserId);
      expect(second.planType).toBe("free");
      expect(second.maxDeals).toBe(25);
    });
  });

  describe("checkUsageLimit", () => {
    it("should allow usage within limit", async () => {
      await getOrCreateUserPlan(testUserId);
      const check = await checkUsageLimit(testUserId, "deals");
      expect(check.allowed).toBe(true);
      expect(check.limit).toBe(25);
      expect(check.current).toBe(0);
    });

    it("should deny once the deal limit is reached", async () => {
      await getOrCreateUserPlan(testUserId);
      db.dealCount = 25;
      const check = await checkUsageLimit(testUserId, "deals");
      expect(check.allowed).toBe(false);
      expect(check.current).toBe(25);
    });
  });

  describe("incrementUsage", () => {
    it("should increment usage count", async () => {
      await getOrCreateUserPlan(testUserId);
      await incrementUsage(testUserId, "apiCalls", 5);
      const check = await checkUsageLimit(testUserId, "apiCalls");
      expect(check.current).toBe(5);
    });
  });
});
