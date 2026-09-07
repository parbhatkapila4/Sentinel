import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/cache", () => ({
  invalidateCache: vi.fn(),
  invalidateCachePattern: vi.fn(),
}));
vi.mock("@/lib/timeline", () => ({ appendDealTimeline: vi.fn() }));
vi.mock("@/lib/realtime", () => ({ notifyRealtimeEvent: vi.fn() }));
vi.mock("@/lib/demo-data", () => ({ seedDemoDataForUser: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logInfo: vi.fn(), logWarn: vi.fn() }));

import { bulkDeleteDeals, bulkUpdateDeals } from "@/lib/bulk-operations";

const CALLER = "user-1";

beforeEach(() => {
  resetPrismaMock();
  prismaMock.deal.count.mockResolvedValue(1);
  prismaMock.$transaction.mockImplementation((async (arg: unknown) => {
    if (typeof arg === "function") {
      return (arg as (tx: typeof prismaMock) => Promise<unknown>)(prismaMock);
    }
    return Promise.all(arg as Promise<unknown>[]);
  }) as never);
});

describe("bulk operations: scope lives in the WHERE clause", () => {
  it("queries only the caller's own deals plus deals in teams where the caller can edit", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([
      { teamId: "team-edit", role: "member" },
      { teamId: "team-view", role: "viewer" },
    ] as never);
    prismaMock.deal.findMany.mockResolvedValue([] as never);

    await bulkDeleteDeals(CALLER, ["foreign-1", "foreign-2"]);

    expect(prismaMock.deal.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["foreign-1", "foreign-2"] },
        OR: [{ userId: CALLER }, { teamId: { in: ["team-edit"] } }],
      },
      select: { id: true, userId: true, teamId: true, isDemo: true },
    });
  });

  it("reports a foreign id with the same message as a missing id and never a deal name", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);
    prismaMock.deal.findMany.mockResolvedValue([] as never);

    const result = await bulkUpdateDeals(CALLER, ["foreign-1"], { stage: "qualify" });

    expect(result.updated).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors).toEqual(["Deal foreign-1 not found or not editable"]);
    expect(prismaMock.deal.update).not.toHaveBeenCalled();
  });

  it("mutates only rows the scoped query returned", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);
    prismaMock.deal.findMany.mockResolvedValue([
      { id: "own-1", userId: CALLER, teamId: null, isDemo: false },
    ] as never);
    prismaMock.deal.delete.mockResolvedValue({} as never);

    const result = await bulkDeleteDeals(CALLER, ["own-1", "foreign-1"]);

    expect(result.deleted).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors).toEqual(["Deal foreign-1 not found or not editable"]);
    expect(prismaMock.deal.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.deal.delete).toHaveBeenCalledWith({ where: { id: "own-1" } });
  });

  it("does not select the deal name at all, so no error path can echo it", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);
    prismaMock.deal.findMany.mockResolvedValue([
      { id: "demo-1", userId: CALLER, teamId: null, isDemo: true },
    ] as never);

    const result = await bulkUpdateDeals(CALLER, ["demo-1"], { stage: "qualify" });

    const select = prismaMock.deal.findMany.mock.calls[0][0]?.select as Record<string, boolean>;
    expect(select.name).toBeUndefined();
    expect(result.errors).toEqual(["Cannot modify demo deal demo-1"]);
  });
});
