import { prisma } from "@/lib/prisma";
import {
  calculateDealSignals,
  formatRiskLevel,
  getPrimaryRiskReason,
} from "@/lib/dealRisk";
import { logWarn } from "@/lib/logger";

export function assertRiskFieldIntegrity(deal: {
  id?: unknown;
  riskScore?: unknown;
  riskLevel?: unknown;
  [key: string]: unknown;
}): void {
  if (process.env.NODE_ENV !== "development") return;

  const warnings: string[] = [];
  const dealId = (deal.id as string) || "unknown";

  if ("riskLevel" in deal && deal.riskLevel !== undefined) {
    if (!("riskScore" in deal) || deal.riskScore === undefined) {
      warnings.push(
        `riskLevel exists without riskScore (may indicate persisted risk field)`
      );
    }
  }

  for (const field of ["riskEvaluatedAt", "nextActionReason"]) {
    if (field in deal && deal[field] !== undefined) {
      warnings.push(`Found legacy persisted field '${field}'`);
    }
  }

  if (warnings.length > 0) {
    logWarn("Risk field integrity warnings", { dealId, warnings });
  }
}

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

export type UserRiskSettingsSnapshot = {
  inactivityThresholdDays: number;
  enableCompetitiveSignals: boolean;
  enableStageStall: boolean;
  enableChampionDormancy: boolean;
  avgStageDurationDays: Record<string, number> | null;
};

export type RiskSettingsMap = Map<string, UserRiskSettingsSnapshot>;

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

  const dbWithExtras = prisma.userRiskSettings as unknown as {
    findMany: (args: unknown) => Promise<
      Array<{
        userId: string;
        inactivityThresholdDays: number;
        enableCompetitiveSignals: boolean;
        enableStageStall: boolean;
        enableChampionDormancy: boolean;
      }>
    >;
  };

  const riskSettings = await dbWithExtras.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      inactivityThresholdDays: true,
      enableCompetitiveSignals: true,
      enableStageStall: true,
      enableChampionDormancy: true,
    },
  });

  const usersWantingStageStall = riskSettings
    .filter((s) => s.enableStageStall)
    .map((s) => s.userId);
  const avgByUser = await computeAvgStageDurationDaysByUser(usersWantingStageStall);

  for (const setting of riskSettings) {
    riskSettingsMap.set(setting.userId, {
      inactivityThresholdDays: setting.inactivityThresholdDays,
      enableCompetitiveSignals: setting.enableCompetitiveSignals,
      enableStageStall: setting.enableStageStall,
      enableChampionDormancy: setting.enableChampionDormancy,
      avgStageDurationDays: setting.enableStageStall
        ? (avgByUser.get(setting.userId) ?? null)
        : null,
    });
  }

  return riskSettingsMap;
}

async function computeAvgStageDurationDaysByUser(
  userIds: string[]
): Promise<Map<string, Record<string, number> | null>> {
  const out = new Map<string, Record<string, number> | null>();
  if (userIds.length === 0) return out;

  const closedDeals = await prisma.deal.findMany({
    where: {
      userId: { in: userIds },
      stage: { in: ["closed_won", "closed_lost"] },
    },
    select: { id: true, userId: true },
  });

  if (closedDeals.length === 0) {
    for (const u of userIds) out.set(u, null);
    return out;
  }

  const dealIds = closedDeals.map((d) => d.id);
  const dealUserById = new Map(closedDeals.map((d) => [d.id, d.userId]));

  const stageEvents = await prisma.dealTimeline.findMany({
    where: { dealId: { in: dealIds }, eventType: "stage_changed" },
    orderBy: { createdAt: "asc" },
    select: { dealId: true, createdAt: true, metadata: true },
  });

  const byDeal = new Map<string, Array<{ stage: string; at: Date }>>();
  for (const e of stageEvents) {
    const meta = e.metadata as Record<string, unknown> | null;
    const stage = typeof meta?.stage === "string" ? meta.stage : null;
    if (!stage || !e.createdAt) continue;
    if (!byDeal.has(e.dealId)) byDeal.set(e.dealId, []);
    byDeal.get(e.dealId)!.push({ stage, at: e.createdAt });
  }

  const durationsByUserStage = new Map<string, Map<string, number[]>>();
  for (const [dealId, transitions] of byDeal) {
    const userId = dealUserById.get(dealId);
    if (!userId) continue;
    for (let i = 0; i < transitions.length - 1; i++) {
      const fromStage = transitions[i].stage;
      const dwellMs = transitions[i + 1].at.getTime() - transitions[i].at.getTime();
      const dwellDays = dwellMs / (1000 * 60 * 60 * 24);
      if (dwellDays < 0) continue;
      if (!durationsByUserStage.has(userId)) {
        durationsByUserStage.set(userId, new Map());
      }
      const stageMap = durationsByUserStage.get(userId)!;
      if (!stageMap.has(fromStage)) stageMap.set(fromStage, []);
      stageMap.get(fromStage)!.push(dwellDays);
    }
  }

  for (const userId of userIds) {
    const stageMap = durationsByUserStage.get(userId);
    if (!stageMap || stageMap.size === 0) {
      out.set(userId, null);
      continue;
    }
    const avgByStage: Record<string, number> = {};
    for (const [stage, days] of stageMap) {
      avgByStage[stage] = days.reduce((a, b) => a + b, 0) / days.length;
    }
    out.set(userId, avgByStage);
  }

  return out;
}

export function computeDealRiskSnapshot(
  deal: DealLike,
  timelineEvents: TimelineDbEvent[],
  riskSettings?: UserRiskSettingsSnapshot
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
