import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    deal: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const {
  triggerDealAtRiskNotification,
  triggerActionOverdueNotification,
  dispatchWebhookEvent,
  sendSlackNotification,
  notifyRealtimeEvent,
} = vi.hoisted(() => ({
  triggerDealAtRiskNotification: vi.fn(),
  triggerActionOverdueNotification: vi.fn(),
  dispatchWebhookEvent: vi.fn(),
  sendSlackNotification: vi.fn(),
  notifyRealtimeEvent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/notification-triggers", () => ({
  triggerDealAtRiskNotification,
  triggerActionOverdueNotification,
}));

vi.mock("@/lib/webhooks", () => ({
  dispatchWebhookEvent,
}));

vi.mock("@/lib/slack", () => ({
  formatDealAtRiskSlackMessage: vi.fn(() => "slack-risk-message"),
  sendSlackNotification,
}));

vi.mock("@/lib/realtime", () => ({
  notifyRealtimeEvent,
}));

import { runDealStageRiskSideEffects } from "@/lib/deal-stage-side-effects";

describe("runDealStageRiskSideEffects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.deal.findUnique.mockResolvedValue({ riskEmailSentAt: null });
    prismaMock.deal.update.mockResolvedValue({});
  });

  it("triggers risk notifications and realtime events for high-risk deals", async () => {
    await runDealStageRiskSideEffects({
      dealId: "deal-1",
      userId: "user-1",
      teamId: "team-1",
      loadEnrichedDeal: async () => ({
        id: "deal-1",
        userId: "user-1",
        name: "Acme",
        value: 12000,
        stage: "Negotiation",
        status: "at_risk",
        riskScore: 0.92,
        riskLevel: "High",
        primaryRiskReason: "No activity",
        recommendedAction: { label: "Follow up today" },
        actionOverdueByDays: 2,
        isActionOverdue: true,
      }),
    });

    expect(triggerDealAtRiskNotification).toHaveBeenCalledOnce();
    expect(dispatchWebhookEvent).toHaveBeenCalledWith(
      "user-1",
      "team-1",
      "deal.at_risk",
      expect.objectContaining({ id: "deal-1", riskLevel: "High" })
    );
    expect(sendSlackNotification).toHaveBeenCalledOnce();
    expect(triggerActionOverdueNotification).toHaveBeenCalledOnce();
    expect(notifyRealtimeEvent).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ type: "deal.updated" })
    );
    expect(notifyRealtimeEvent).toHaveBeenCalledWith(
      "user-1",
      { type: "deal.at_risk", dealId: "deal-1" }
    );
  });

  it("clears risk email marker when deal is not at risk", async () => {
    await runDealStageRiskSideEffects({
      dealId: "deal-2",
      userId: "user-1",
      teamId: null,
      loadEnrichedDeal: async () => ({
        id: "deal-2",
        userId: "user-1",
        name: "Beta",
        value: 8000,
        stage: "Discovery",
        status: "active",
        riskScore: 0.2,
        riskLevel: "Low",
        primaryRiskReason: null,
        recommendedAction: null,
        actionOverdueByDays: null,
        isActionOverdue: false,
      }),
    });

    expect(triggerDealAtRiskNotification).not.toHaveBeenCalled();
    expect(prismaMock.deal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "deal-2" },
        data: { riskEmailSentAt: null },
      })
    );
    expect(notifyRealtimeEvent).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ type: "deal.updated" })
    );
  });
});
