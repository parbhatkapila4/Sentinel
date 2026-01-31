import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  mockGetAuthenticatedUserId: vi.fn(),
  mockSearchDeals: vi.fn(),
  mockTrackPerformance: vi.fn(),
  mockTrackApiCall: vi.fn(),
  mockTrackApiMetric: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mocks.mockGetAuthenticatedUserId(),
}));
vi.mock("@/lib/api-rate-limit", () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));
vi.mock("@/lib/search", () => ({
  searchDeals: (opts: unknown) => mocks.mockSearchDeals(opts),
}));
vi.mock("@/lib/monitoring", () => ({
  trackPerformance: (_: string, fn: () => Promise<unknown>) => mocks.mockTrackPerformance(fn),
  trackApiCall: vi.fn(),
}));
vi.mock("@/lib/metrics", () => ({
  trackApiCall: mocks.mockTrackApiMetric,
}));

import { GET } from "@/app/api/deals/search/route";

describe("GET /api/deals/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetAuthenticatedUserId.mockResolvedValue("user-1");
    mocks.mockSearchDeals.mockResolvedValue([]);
    mocks.mockTrackPerformance.mockImplementation((fn: () => Promise<unknown>) => fn());
  });

  it("returns 200 and empty deals when q is empty", async () => {
    const req = new NextRequest("http://localhost/api/deals/search?q=");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ deals: [] });
    expect(mocks.mockSearchDeals).not.toHaveBeenCalled();
  });

  it("returns 200 and deals from searchDeals when q provided", async () => {
    const deals = [{ id: "1", name: "Deal A", stage: "qualify", value: 1000 }];
    mocks.mockSearchDeals.mockResolvedValue(deals);

    const req = new NextRequest("http://localhost/api/deals/search?q=test");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.deals).toEqual(deals);
    expect(mocks.mockSearchDeals).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", query: "test" })
    );
  });
});
