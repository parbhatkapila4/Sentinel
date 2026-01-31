import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthenticatedUserId = vi.fn();
const mockGetUserNotifications = vi.fn();
const mockGetUnreadCount = vi.fn();
const mockTrackPerformance = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
}));
vi.mock("@/lib/api-rate-limit", () => ({
  withRateLimit: (fn: (req: NextRequest) => Promise<Response>) => fn,
}));
vi.mock("@/lib/api-middleware", () => ({
  withApiContext: (fn: (req: NextRequest, ctx?: { requestId: string }) => Promise<Response>) => fn,
}));
vi.mock("@/lib/notifications", () => ({
  getUserNotifications: (userId: string, opts?: unknown) => mockGetUserNotifications(userId, opts),
  getUnreadCount: (userId: string) => mockGetUnreadCount(userId),
}));
vi.mock("@/lib/monitoring", () => ({
  trackPerformance: (_: string, fn: () => Promise<unknown>) => mockTrackPerformance(fn),
  trackApiCall: vi.fn(),
}));
vi.mock("@/lib/metrics", () => ({ trackApiCall: vi.fn() }));
vi.mock("@/lib/error-context", () => ({
  withErrorContext: (_: unknown, fn: () => Promise<unknown>) => fn(),
}));

import { GET } from "@/app/api/notifications/route";

describe("GET /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthenticatedUserId.mockResolvedValue("user-1");
    mockGetUserNotifications.mockResolvedValue([]);
    mockGetUnreadCount.mockResolvedValue(0);
    mockTrackPerformance.mockImplementation((fn: () => Promise<unknown>) => fn());
  });

  it("returns 200 and notifications list with unreadCount", async () => {
    const notifications = [
      { id: "n1", userId: "user-1", type: "deal_at_risk", title: "Risk", message: "Deal at risk", read: false, createdAt: new Date() },
    ];
    mockGetUserNotifications.mockResolvedValue(notifications);
    mockGetUnreadCount.mockResolvedValue(1);

    const req = new NextRequest("http://localhost/api/notifications");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("notifications");
    expect(body.data).toHaveProperty("unreadCount", 1);
    expect(mockGetUserNotifications).toHaveBeenCalledWith("user-1", expect.any(Object));
    expect(mockGetUnreadCount).toHaveBeenCalledWith("user-1");
  });
});
