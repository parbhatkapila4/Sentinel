import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const db = { plans: new Map<string, Record<string, unknown>>(), dealCount: 0 };

vi.mock("../prisma", () => ({
  prisma: {
    userPlan: {
      findUnique: async ({ where }: { where: { userId: string } }) =>
        db.plans.get(where.userId) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `plan_${data.userId}`, ...data };
        db.plans.set(data.userId as string, row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { userId: string };
        data: Record<string, unknown>;
      }) => {
        const row = { ...db.plans.get(where.userId)!, ...data };
        db.plans.set(where.userId, row);
        return row;
      },
    },
    usageTracking: {
      findUnique: async () => null,
      upsert: async () => ({}),
    },
    deal: { count: async () => db.dealCount },
    teamMember: { count: async () => 0 },
  },
}));

const { enforceDealLimit } = await import("../plan-enforcement");
const { ForbiddenError } = await import("../errors");

const USER = "user_gate_test";

describe("deal limit is enforced server-side", () => {
  beforeEach(() => {
    db.plans.clear();
    db.dealCount = 0;
  });

  it("allows creation below the plan ceiling", async () => {
    db.dealCount = 24;
    await expect(enforceDealLimit(USER)).resolves.toBeUndefined();
  });

  it("denies creation at the plan ceiling", async () => {
    db.dealCount = 25; // free tier maxDeals
    await expect(enforceDealLimit(USER)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("denies with a 403, not a validation error", async () => {
    db.dealCount = 99;
    await expect(enforceDealLimit(USER)).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("derives the ceiling from the stored plan, not from any caller input", async () => {
    expect(enforceDealLimit.length).toBe(1);

    db.dealCount = 25;
    await expect(enforceDealLimit(USER)).rejects.toBeInstanceOf(ForbiddenError);
    const plan = db.plans.get(USER)!;
    plan.maxDeals = 100;
    await expect(enforceDealLimit(USER)).resolves.toBeUndefined();
  });
});

describe("createDeal cannot be bypassed from the request body", () => {
  const src = readFileSync(
    resolve(process.cwd(), "src/app/actions/deals.ts"),
    "utf8",
  );

  it("takes its userId from the session, never from formData", () => {
    expect(src).toContain("const userId = await getAuthenticatedUserId()");
    expect(
      /getAuthenticatedUserId\(\)/.test(src) &&
        !/userId\s*=\s*formData\.get/.test(src),
      "userId must come from the authenticated session, not the payload",
    ).toBe(true);
  });

  it("runs the gate before writing the deal", () => {
    const gate = src.indexOf("enforceDealLimit(userId)");
    const insert = src.indexOf("prisma.deal.create");
    expect(gate, "enforceDealLimit(userId) must be present").toBeGreaterThan(
      -1,
    );
    expect(insert, "prisma.deal.create must be present").toBeGreaterThan(-1);
    expect(
      gate < insert,
      "enforceDealLimit must run BEFORE prisma.deal.create, otherwise an " +
        "over-limit deal is already persisted by the time we reject.",
    ).toBe(true);
  });

  it("passes no plan or limit field out of formData into the gate", () => {
    for (const field of ["planType", "maxDeals", "planName", "limit"]) {
      expect(
        src.includes(`formData.get("${field}")`),
        `createDeal must not read "${field}" from the request body - plan state ` +
          "is server-owned.",
      ).toBe(false);
    }
  });
});
