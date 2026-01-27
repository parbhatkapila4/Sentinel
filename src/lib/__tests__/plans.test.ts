import { describe, it, expect, beforeEach } from "vitest";
import {
  getPlanLimits,
  getPlanDefinition,
  getOrCreateUserPlan,
  checkUsageLimit,
  incrementUsage,
} from "../plans";
import { prisma } from "../prisma";

describe("Plans", () => {
  const testUserId = "test_user_123";

  beforeEach(async () => {

    await prisma.usageTracking.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.userPlan.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.upsert({
      where: { id: testUserId },
      create: {
        id: testUserId,
        name: "Test",
        surname: "User",
        email: `test_${testUserId}@example.com`,
        password: "test_password",
      },
      update: {},
    });
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
      expect(limits.maxDeals).toBe(500);
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
  });

  describe("checkUsageLimit", () => {
    it("should allow usage within limit", async () => {
      await getOrCreateUserPlan(testUserId);
      const check = await checkUsageLimit(testUserId, "deals");
      expect(check.allowed).toBe(true);
      expect(check.limit).toBe(25);
      expect(check.current).toBe(0);
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
