import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import { mockGetAuthenticatedUserId, resetAuthMock, TEST_USER_ID } from "@/test/mocks/auth";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
}));
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/timeline", () => ({
  appendDealTimeline: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/webhooks", () => ({
  dispatchWebhookEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) => v),
}));
vi.mock("@/app/actions/integrations", () => ({
  logIntegrationAction: vi.fn(),
}));

import { getDealById } from "@/app/actions/deals";
import { getGoogleCalendarStatus } from "@/app/actions/google-calendar";

const DAY = 86_400_000;

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
});

describe("getDealById scores risk with the owner's settings", () => {
  function quietDeal(id: string) {
    const createdAt = new Date(Date.now() - 10 * DAY);
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);
    prismaMock.deal.findFirst.mockResolvedValue({
      id,
      userId: TEST_USER_ID,
      teamId: null,
      assignedToId: null,
      name: "Quiet deal",
      stage: "qualify",
      value: 3000,
      location: "Canada",
      isDemo: false,
      source: null,
      channel: null,
      externalId: null,
      createdAt,
      team: null,
      assignedTo: null,
    } as never);
    prismaMock.dealTimeline.findMany.mockResolvedValue([
      { id: "t1", dealId: id, eventType: "stage_changed", metadata: { stage: "qualify" }, createdAt },
    ] as never);
    prismaMock.dealEvent.findMany.mockResolvedValue([] as never);
  }

  it("flags 10 quiet days with the default 7 day threshold", async () => {
    quietDeal("deal-default");
    prismaMock.userRiskSettings.findMany.mockResolvedValue([] as never);

    const deal = await getDealById("deal-default");

    expect(deal.riskReasons).toContain("No activity in last 7 days");
    expect(deal.riskScore).toBeCloseTo(0.4);
  });

  it("does not flag them when the owner set a 30 day threshold", async () => {
    quietDeal("deal-custom");
    prismaMock.userRiskSettings.findMany.mockResolvedValue([
      {
        userId: TEST_USER_ID,
        inactivityThresholdDays: 30,
        enableCompetitiveSignals: true,
        enableStageStall: false,
        enableChampionDormancy: false,
      },
    ] as never);

    const deal = await getDealById("deal-custom");

    expect(prismaMock.userRiskSettings.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: { in: [TEST_USER_ID] } } })
    );
    expect(deal.riskReasons).not.toContain("No activity in last 7 days");
    expect(deal.riskScore).toBe(0);
  });

  it("returns the location for the details section", async () => {
    quietDeal("deal-location");
    prismaMock.userRiskSettings.findMany.mockResolvedValue([] as never);

    const deal = await getDealById("deal-location");

    expect(deal.location).toBe("Canada");
  });
});

describe("getGoogleCalendarStatus", () => {
  it("counts a Google sign-in from Settings as connected", async () => {
    prismaMock.googleCalendarIntegration.findFirst.mockResolvedValue(null);
    prismaMock.calendarIntegration.findUnique.mockResolvedValue({ id: "cal-1" } as never);

    const status = await getGoogleCalendarStatus();

    expect(status.connected).toBe(true);
    expect(prismaMock.calendarIntegration.findUnique).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      select: { id: true },
    });
  });

  it("still counts the older calendar connection", async () => {
    prismaMock.googleCalendarIntegration.findFirst.mockResolvedValue({
      isActive: true,
      calendarId: "primary",
      lastSyncAt: null,
      lastSyncStatus: null,
      syncEnabled: true,
    } as never);
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(null);

    const status = await getGoogleCalendarStatus();

    expect(status).toMatchObject({ connected: true, calendarId: "primary" });
  });

  it("is not connected with neither", async () => {
    prismaMock.googleCalendarIntegration.findFirst.mockResolvedValue(null);
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(null);

    expect((await getGoogleCalendarStatus()).connected).toBe(false);
  });
});
