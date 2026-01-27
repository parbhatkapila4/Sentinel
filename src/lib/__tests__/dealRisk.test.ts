import { describe, it, expect } from "vitest";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";
import { RISK_REASONS, STAGES } from "@/lib/config";


const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * MS_PER_DAY);
}

function createMockDeal(
  overrides: Partial<{
    stage: string;
    value: number;
    status: string;
    createdAt: Date;
  }> = {}
) {
  return {
    stage: STAGES.QUALIFY,
    value: 1000,
    status: "active",
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockTimelineEvent(
  eventType: "email_sent" | "email_received" | "meeting_held",
  daysAgoValue: number,
  metadata?: Record<string, unknown>
) {
  const createdAt = new Date(Date.now() - daysAgoValue * MS_PER_DAY);
  return {
    eventType: "event_created",
    createdAt,
    metadata: { eventType, ...metadata } as Record<string, unknown>,
  };
}

function createMockTimelinePoint(daysAgoValue: number) {
  return {
    eventType: "stage_changed",
    createdAt: new Date(Date.now() - daysAgoValue * MS_PER_DAY),
    metadata: {} as Record<string, unknown>,
  };
}

describe("formatRiskLevel", () => {
  it("score 0.0 returns Low", () => {
    expect(formatRiskLevel(0)).toBe("Low");
  });

  it("score 0.39 returns Low", () => {
    expect(formatRiskLevel(0.39)).toBe("Low");
  });

  it("score 0.4 returns Medium", () => {
    expect(formatRiskLevel(0.4)).toBe("Medium");
  });

  it("score 0.59 returns Medium", () => {
    expect(formatRiskLevel(0.59)).toBe("Medium");
  });

  it("score 0.6 returns High", () => {
    expect(formatRiskLevel(0.6)).toBe("High");
  });

  it("score 1.0 returns High", () => {
    expect(formatRiskLevel(1.0)).toBe("High");
  });
});

describe("getPrimaryRiskReason", () => {
  it("empty array returns null", () => {
    expect(getPrimaryRiskReason([])).toBeNull();
  });

  it('returns "No activity in last 7 days" when present (priority)', () => {
    expect(
      getPrimaryRiskReason([RISK_REASONS.NO_ACTIVITY])
    ).toBe(RISK_REASONS.NO_ACTIVITY);
    expect(
      getPrimaryRiskReason([
        "Other reason",
        RISK_REASONS.NEGOTIATION_STALLED,
        RISK_REASONS.NO_ACTIVITY,
      ])
    ).toBe(RISK_REASONS.NO_ACTIVITY);
  });

  it('returns "Negotiation stalled without response" as second priority', () => {
    expect(
      getPrimaryRiskReason([RISK_REASONS.NEGOTIATION_STALLED])
    ).toBe(RISK_REASONS.NEGOTIATION_STALLED);
    expect(
      getPrimaryRiskReason([
        "Other",
        RISK_REASONS.HIGH_VALUE,
        RISK_REASONS.NEGOTIATION_STALLED,
      ])
    ).toBe(RISK_REASONS.NEGOTIATION_STALLED);
  });

  it('returns "High value deal requires attention" as third priority', () => {
    expect(
      getPrimaryRiskReason([RISK_REASONS.HIGH_VALUE])
    ).toBe(RISK_REASONS.HIGH_VALUE);
    expect(
      getPrimaryRiskReason(["Some other reason", RISK_REASONS.HIGH_VALUE])
    ).toBe(RISK_REASONS.HIGH_VALUE);
  });

  it("returns first reason if none of the priority reasons exist", () => {
    expect(
      getPrimaryRiskReason(["Custom reason A", "Custom reason B"])
    ).toBe("Custom reason A");
  });
});

describe("calculateDealSignals", () => {
  it("new deal with no timeline events has low risk score and status active", () => {
    const deal = createMockDeal({
      stage: STAGES.QUALIFY,
      value: 1000,
      status: "active",
      createdAt: new Date(),
    });
    const signals = calculateDealSignals(deal, []);

    expect(signals.riskScore).toBeLessThan(0.6);
    expect(signals.status).toBe("active");
    expect(signals.reasons).toEqual([]);
  });

  it("deal with 7+ days of inactivity has elevated risk and includes no-activity reason", () => {
    const deal = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: daysAgo(10),
    });
    const signals = calculateDealSignals(deal, []);

    expect(signals.riskScore).toBeGreaterThanOrEqual(0.4);
    expect(signals.reasons).toContain(RISK_REASONS.NO_ACTIVITY);
  });

  it("negotiation stage without recent email activity has higher risk and includes negotiation stalled reason", () => {
    const deal = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: new Date(),
    });
    const signals = calculateDealSignals(deal, []);

    expect(signals.riskScore).toBeGreaterThanOrEqual(0.4);
    expect(signals.reasons).toContain(RISK_REASONS.NEGOTIATION_STALLED);
  });

  it("high value deal (>5000) includes high value factor and reason", () => {
    const deal = createMockDeal({
      stage: STAGES.QUALIFY,
      value: 10_000,
      status: "active",
      createdAt: new Date(),
    });
    const signals = calculateDealSignals(deal, []);

    expect(signals.reasons).toContain(RISK_REASONS.HIGH_VALUE);
    expect(signals.riskScore).toBeGreaterThan(0);
  });

  it("recent email sent decreases risk compared to deal without activity", () => {
    const base = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: daysAgo(10),
    });
    const withoutActivity = calculateDealSignals(base, []);
    const withEmailSent = calculateDealSignals(base, [
      createMockTimelineEvent("email_sent", 2),
    ]);

    expect(withEmailSent.riskScore).toBeLessThan(withoutActivity.riskScore);
  });

  it("recent email received decreases risk more than email sent", () => {
    const base = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: daysAgo(10),
    });
    const withEmailSent = calculateDealSignals(base, [
      createMockTimelineEvent("email_sent", 2),
    ]);
    const withEmailReceived = calculateDealSignals(base, [
      createMockTimelineEvent("email_received", 2),
    ]);

    expect(withEmailReceived.riskScore).toBeLessThanOrEqual(
      withEmailSent.riskScore
    );
  });

  it("recent meeting decreases risk significantly vs other activity types", () => {
    const base = createMockDeal({
      stage: STAGES.QUALIFY,
      value: 1000,
      status: "active",
      createdAt: daysAgo(10),
    });
    const withMeeting = calculateDealSignals(base, [
      createMockTimelineEvent("meeting_held", 3),
    ]);
    const withEmailSent = calculateDealSignals(base, [
      createMockTimelineEvent("email_sent", 2),
    ]);
    const withEmailReceived = calculateDealSignals(base, [
      createMockTimelineEvent("email_received", 2),
    ]);

    expect(withMeeting.riskScore).toBeLessThanOrEqual(withEmailSent.riskScore);
    expect(withMeeting.riskScore).toBeLessThanOrEqual(
      withEmailReceived.riskScore
    );
  });

  it("action overdue escalates urgency and increases risk score", () => {
    const deal = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: daysAgo(20),
    });
    const emailLongAgo = createMockTimelineEvent("email_sent", 15);
    const point3DaysAgo = createMockTimelinePoint(3);
    const timeline = [emailLongAgo, point3DaysAgo];
    const signals = calculateDealSignals(deal, timeline);

    expect(signals.status).toBe("at_risk");
    expect(signals.isActionOverdue).toBe(true);
    expect(signals.actionOverdueByDays).toBeGreaterThan(0);
    expect(signals.reasons.some((r) => r.startsWith("Action overdue by"))).toBe(
      true
    );
    expect(signals.recommendedAction).not.toBeNull();
    expect(signals.riskScore).toBeGreaterThan(0);
  });

  it("risk started at is set and riskAgeInDays calculated when deal is at-risk", () => {
    const deal = createMockDeal({
      stage: STAGES.NEGOTIATION,
      value: 1000,
      status: "active",
      createdAt: daysAgo(20),
    });
    const emailLongAgo = createMockTimelineEvent("email_sent", 15);
    const point3DaysAgo = createMockTimelinePoint(3);
    const timeline = [emailLongAgo, point3DaysAgo];
    const signals = calculateDealSignals(deal, timeline);

    expect(signals.status).toBe("at_risk");
    expect(signals.riskStartedAt).not.toBeNull();
    expect(signals.riskAgeInDays).not.toBeNull();
    expect(signals.riskAgeInDays).toBeGreaterThanOrEqual(0);
  });
});
