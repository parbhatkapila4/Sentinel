import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import {
  mockGetAuthenticatedUserId,
  TEST_USER_ID,
  resetAuthMock,
} from "@/test/mocks/auth";

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
vi.mock("@/lib/plan-enforcement", () => ({
  enforceDealLimit: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/plans", () => ({
  getOrCreateUserPlan: vi.fn().mockResolvedValue({
    id: "plan-1",
    userId: "test-user-id",
    planType: "free",
    planName: "Free",
    maxDeals: 25,
    maxTeamMembers: 1,
    maxApiCalls: 100,
    maxWebhooks: 1,
    maxIntegrations: 1,
    features: [],
  }),
  checkUsageLimit: vi.fn().mockResolvedValue({
    allowed: true,
    limit: 25,
    current: 0,
  }),
  incrementUsage: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/webhooks", () => ({
  dispatchWebhookEvent: vi.fn().mockResolvedValue(undefined),
}));

import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDealStage,
} from "@/app/actions/deals";
import { appendDealTimeline } from "@/lib/timeline";
import { STAGES } from "@/lib/config";

const createMockDealRecord = (overrides: Partial<{
  id: string;
  userId: string;
  teamId: string | null;
  assignedToId: string | null;
  name: string;
  stage: string;
  value: number;
  location: string | null;
  isDemo: boolean;
  createdAt: Date;
}> = {}) => ({
  id: "deal-1",
  userId: TEST_USER_ID,
  teamId: null,
  assignedToId: null,
  name: "Test Deal",
  stage: STAGES.QUALIFY,
  value: 5000,
  location: null,
  isDemo: false,
  createdAt: new Date("2025-01-15"),
  ...overrides,
});

const createMockTimelineRecord = (overrides: Partial<{
  id: string;
  dealId: string;
  eventType: string;
  metadata: unknown;
  createdAt: Date | null;
}> = {}) => ({
  id: "tl-1",
  dealId: "deal-1",
  eventType: "stage_changed",
  metadata: { stage: STAGES.QUALIFY },
  createdAt: new Date("2025-01-15"),
  ...overrides,
});

const createMockDealEventRecord = (overrides: Partial<{
  id: string;
  dealId: string;
  type: string;
  payload: unknown;
  createdAt: Date;
}> = {}) => ({
  id: "ev-1",
  dealId: "deal-1",
  type: "email_sent",
  payload: {},
  createdAt: new Date("2025-01-14"),
  ...overrides,
});

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
  vi.mocked(appendDealTimeline).mockClear();
  prismaMock.deal.count.mockResolvedValue(0);
  prismaMock.webhook.findMany.mockResolvedValue([] as never);
});

describe("getAllDeals", () => {
  it("returns only deals for authenticated user and filters by userId", async () => {
    const deals = [
      createMockDealRecord({ id: "d1", name: "Deal A" }),
      createMockDealRecord({ id: "d2", name: "Deal B" }),
    ];
    prismaMock.deal.findMany.mockResolvedValue(deals as never);
    prismaMock.dealTimeline.findMany.mockResolvedValue([] as never);

    const result = await getAllDeals();

    expect(prismaMock.deal.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, surname: true } },
      },
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Deal A");
    expect(result[1].name).toBe("Deal B");
  });

  it("returns empty array when user has no deals", async () => {
    prismaMock.deal.findMany.mockResolvedValue([] as never);
    prismaMock.dealTimeline.findMany.mockResolvedValue([] as never);

    const result = await getAllDeals();

    expect(result).toEqual([]);
    expect(prismaMock.deal.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, surname: true } },
      },
    });
  });

  it("calculates risk signals for each deal", async () => {
    const deals = [createMockDealRecord()];
    const timeline = [
      createMockTimelineRecord({ dealId: "deal-1", eventType: "stage_changed" }),
    ];
    prismaMock.deal.findMany.mockResolvedValue(deals as never);
    prismaMock.dealTimeline.findMany.mockResolvedValue(timeline as never);

    const result = await getAllDeals();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      riskScore: expect.any(Number),
      riskLevel: expect.stringMatching(/^(Low|Medium|High)$/),
      recommendedAction: expect.anything(),
    });
    expect(typeof result[0].riskScore).toBe("number");
    expect(["Low", "Medium", "High"]).toContain(result[0].riskLevel);
  });
});

describe("getDealById", () => {
  it("returns deal with events and timeline for valid ID", async () => {
    const deal = createMockDealRecord();
    const dealWithIncludes = { ...deal, team: null, assignedTo: null };
    const timeline = [
      createMockTimelineRecord({ dealId: deal.id }),
    ];
    const events = [createMockDealEventRecord({ dealId: deal.id })];
    prismaMock.deal.findUnique.mockResolvedValue(dealWithIncludes as never);
    prismaMock.dealTimeline.findMany.mockResolvedValue(timeline as never);
    prismaMock.dealEvent.findMany.mockResolvedValue(events as never);

    const result = await getDealById(deal.id);

    expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
      where: { id: deal.id },
      include: {
        team: true,
        assignedTo: { select: { id: true, name: true, surname: true, email: true } },
      },
    });
    expect(result).toMatchObject({
      id: deal.id,
      name: deal.name,
      stage: deal.stage,
      value: deal.value,
    });
    expect(result.events).toHaveLength(1);
    expect(result.timeline).toHaveLength(1);
    expect(result.riskScore).toBeDefined();
    expect(result.riskLevel).toBeDefined();
    expect(["Low", "Medium", "High"]).toContain(result.riskLevel);
  });

  it("throws error when deal not found", async () => {
    prismaMock.deal.findUnique.mockResolvedValue(null);

    await expect(getDealById("nonexistent")).rejects.toThrow("Deal not found");
    expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent" },
      include: {
        team: true,
        assignedTo: { select: { id: true, name: true, surname: true, email: true } },
      },
    });
  });

  it("only returns deal if it belongs to authenticated user", async () => {
    const otherUserDeal = createMockDealRecord({
      id: "some-deal-id",
      userId: "other-user-id",
      teamId: null,
    });
    prismaMock.deal.findUnique.mockResolvedValue({
      ...otherUserDeal,
      team: null,
      assignedTo: null,
    } as never);

    await expect(getDealById("some-deal-id")).rejects.toThrow(
      "You do not have access to this deal"
    );
    expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
      where: { id: "some-deal-id" },
      include: {
        team: true,
        assignedTo: { select: { id: true, name: true, surname: true, email: true } },
      },
    });
  });
});

describe("createDeal", () => {
  it("creates deal with correct data and timeline entry", async () => {
    const created = createMockDealRecord({
      id: "new-deal-id",
      name: "New Deal",
      stage: STAGES.PROPOSAL,
      value: 3000,
    });
    prismaMock.deal.create.mockResolvedValue(created as never);
    const timelineWithStage = [
      createMockTimelineRecord({
        dealId: "new-deal-id",
        eventType: "stage_changed",
        metadata: { stage: STAGES.PROPOSAL },
      }),
    ];
    prismaMock.dealTimeline.findMany.mockResolvedValue(timelineWithStage as never);

    const formData = new FormData();
    formData.set("name", "New Deal");
    formData.set("stage", STAGES.PROPOSAL);
    formData.set("value", "3000");

    const result = await createDeal(formData);

    expect(prismaMock.deal.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        name: "New Deal",
        stage: STAGES.PROPOSAL,
        value: 3000,
        location: null,
      },
    });
    expect(appendDealTimeline).toHaveBeenCalledWith(
      "new-deal-id",
      "stage_changed",
      { stage: STAGES.PROPOSAL }
    );
    expect(result).toMatchObject({
      id: "new-deal-id",
      name: "New Deal",
      stage: STAGES.PROPOSAL,
      value: 3000,
    });
    expect(result.riskScore).toBeDefined();
    expect(result.riskLevel).toBeDefined();
  });

  it("throws error for missing required fields", async () => {
    const formData = new FormData();
    formData.set("stage", STAGES.QUALIFY);
    formData.set("value", "1000");

    await expect(createDeal(formData)).rejects.toThrow("Missing required fields");
    expect(prismaMock.deal.create).not.toHaveBeenCalled();
  });
});

describe("updateDealStage", () => {
  it("updates stage and creates timeline entry", async () => {
    const existing = createMockDealRecord({
      id: "deal-to-update",
      stage: STAGES.QUALIFY,
    });
    prismaMock.deal.findUnique.mockResolvedValue(existing as never);
    prismaMock.deal.update.mockResolvedValue({
      ...existing,
      stage: STAGES.NEGOTIATION,
    } as never);

    await updateDealStage("deal-to-update", STAGES.NEGOTIATION);

    expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
      where: { id: "deal-to-update" },
    });
    expect(prismaMock.deal.update).toHaveBeenCalledWith({
      where: { id: "deal-to-update" },
      data: { stage: STAGES.NEGOTIATION },
    });
    expect(appendDealTimeline).toHaveBeenCalledWith(
      "deal-to-update",
      "stage_changed",
      { stage: STAGES.NEGOTIATION }
    );
  });

  it("throws error when deal not found", async () => {
    prismaMock.deal.findUnique.mockResolvedValue(null);

    await expect(
      updateDealStage("nonexistent", STAGES.NEGOTIATION)
    ).rejects.toThrow("Deal not found");
    expect(prismaMock.deal.update).not.toHaveBeenCalled();
    expect(appendDealTimeline).not.toHaveBeenCalled();
  });
});
