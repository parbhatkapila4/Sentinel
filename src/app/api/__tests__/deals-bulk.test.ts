import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthenticatedUserId = vi.fn();
const mockBulkUpdateDeals = vi.fn();
const mockBulkDeleteDeals = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
}));
vi.mock("@/lib/api-rate-limit", () => ({
  withRateLimit: (fn: (req: NextRequest) => Promise<Response>) => fn,
}));
vi.mock("@/app/actions/bulk-operations", () => ({
  bulkUpdateDeals: (userId: string, dealIds: string[], updates: unknown) =>
    mockBulkUpdateDeals(userId, dealIds, updates),
  bulkDeleteDeals: (userId: string, dealIds: string[]) =>
    mockBulkDeleteDeals(userId, dealIds),
}));

import { POST } from "@/app/api/deals/bulk/route";

describe("POST /api/deals/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthenticatedUserId.mockResolvedValue("user-1");
  });

  it("returns 400 when body is invalid (missing action)", async () => {
    const req = new NextRequest("http://localhost/api/deals/bulk", {
      method: "POST",
      body: JSON.stringify({ dealIds: ["deal-1"] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when dealIds is empty", async () => {
    const req = new NextRequest("http://localhost/api/deals/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "update", dealIds: [], updates: { stage: "qualify" } }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors?.dealIds).toBeDefined();
  });

  it("returns 200 and result for valid update", async () => {
    mockBulkUpdateDeals.mockResolvedValue({ updated: 2 });

    const req = new NextRequest("http://localhost/api/deals/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        dealIds: ["deal-1", "deal-2"],
        updates: { stage: "qualify" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ updated: 2 });
    expect(mockBulkUpdateDeals).toHaveBeenCalledWith("user-1", ["deal-1", "deal-2"], { stage: "qualify" });
  });

  it("returns 200 and result for valid delete", async () => {
    mockBulkDeleteDeals.mockResolvedValue({ deleted: 1 });

    const req = new NextRequest("http://localhost/api/deals/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete", dealIds: ["deal-1"] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ deleted: 1 });
    expect(mockBulkDeleteDeals).toHaveBeenCalledWith("user-1", ["deal-1"]);
  });
});
