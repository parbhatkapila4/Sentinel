import { prisma } from "@/lib/prisma";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";

type TimelineDbEvent = {
  dealId: string;
  eventType: string;
  createdAt: Date | null;
  metadata: unknown;
};

type DealLike = {
  id: string;
  userId: string;
  stage: string;
  value: number;
  createdAt: Date;
};

export type RiskSettingsMap = Map<
  string,
  { inactivityThresholdDays: number; enableCompetitiveSignals: boolean }
>;

export function buildTimelineByDealId(events: TimelineDbEvent[]): Map<string, TimelineDbEvent[]> {
  const map = new Map<string, TimelineDbEvent[]>();
  for (const event of events) {
    if (!map.has(event.dealId)) {
      map.set(event.dealId, []);
    }
    map.get(event.dealId)!.push(event);
  }
  return map;
}

export function toSignalTimelineEvents(events: TimelineDbEvent[]) {
  return events.map((e) => ({
    eventType: e.eventType,
    createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
    metadata:
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? ({ ...e.metadata } as Record<string, unknown>)
        : null,
  }));
}

export async function buildRiskSettingsMap(userIds: string[]): Promise<RiskSettingsMap> {
  const riskSettingsMap: RiskSettingsMap = new Map();
  if (userIds.length === 0) return riskSettingsMap;

  const riskSettings = await prisma.userRiskSettings.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      inactivityThresholdDays: true,
      enableCompetitiveSignals: true,
    },
  });

  for (const setting of riskSettings) {
    riskSettingsMap.set(setting.userId, {
      inactivityThresholdDays: setting.inactivityThresholdDays,
      enableCompetitiveSignals: setting.enableCompetitiveSignals,
    });
  }

  return riskSettingsMap;
}

export function computeDealRiskSnapshot(
  deal: DealLike,
  timelineEvents: TimelineDbEvent[],
  riskSettings?: { inactivityThresholdDays: number; enableCompetitiveSignals: boolean }
) {
  const signals = calculateDealSignals(
    {
      stage: deal.stage,
      value: deal.value,
      status: "active",
      createdAt: deal.createdAt,
    },
    toSignalTimelineEvents(timelineEvents),
    riskSettings
  );

  return {
    lastActivityAt: signals.lastActivityAt,
    riskScore: signals.riskScore,
    riskLevel: formatRiskLevel(signals.riskScore),
    status: signals.status,
    nextAction: signals.nextAction,
    nextActionReason: null,
    riskReasons: signals.reasons,
    primaryRiskReason: getPrimaryRiskReason(signals.reasons),
    recommendedAction: signals.recommendedAction,
    riskStartedAt: signals.riskStartedAt,
    riskAgeInDays: signals.riskAgeInDays,
    actionDueAt: signals.actionDueAt,
    actionOverdueByDays: signals.actionOverdueByDays,
    isActionOverdue: signals.isActionOverdue,
  };
}
