import { HIGH_VALUE_THRESHOLD, INACTIVITY_DAYS, RISK_REASONS } from "@/lib/config";
import {
  BOOK_STAGE_LABEL,
  OPEN_STAGES,
  bookStage,
  daysSince,
  dealTier,
  isOpen,
  share,
  sumValue,
  type BookDeal,
} from "../book";

export const WEEK_DAYS = 7;

export interface QueueOrder {
  urgent: string[];
  important: string[];
  safe: string[];
}

export interface QueueDeal {
  id: string;
  name: string;
  value: number;
  riskScore: number;
  reason: string;
  action: string | null;
  overdueDays: number | null;
  dueInDays: number | null;
}

export interface TierSummary {
  key: "high" | "medium" | "low";
  count: number;
  value: number;
  pct: number;
}

export interface StageRisk {
  key: string;
  label: string;
  high: number;
  medium: number;
  low: number;
  total: number;
  highPct: number;
}

export interface SignalCount {
  key: string;
  title: string;
  body: string;
  count: number;
}

export interface AlertsData {
  dealCount: number;
  openCount: number;
  openValue: number;
  tiers: TierSummary[];
  highCount: number;
  highValue: number;
  overdueCount: number;
  overdueValue: number;
  avgOverdueDays: number | null;
  urgentCount: number;
  importantCount: number;
  safeCount: number;
  avgRisk: number | null;
  urgent: QueueDeal[];
  important: QueueDeal[];
  safe: QueueDeal[];
  highIdleDays: number | null;
  turnedHighThisWeek: number;
  stages: StageRisk[];
  signals: SignalCount[];
}

const REASON_TEXT: Record<string, string> = {
  [RISK_REASONS.NEGOTIATION_STALLED]: "Negotiation stalled",
  [RISK_REASONS.HIGH_VALUE]: "High-value exposure",
  [RISK_REASONS.COMPETITIVE_PRESSURE]: "Competitive signals",
  [RISK_REASONS.STAGE_STALL]: "Stalled in its stage",
  [RISK_REASONS.CHAMPION_DORMANT]: "Champion gone quiet",
};

export function reasonText(deal: BookDeal, nowMs: number): string {
  if (deal.riskReason === RISK_REASONS.NO_ACTIVITY) {
    const idle = daysSince(deal.lastActivityAt, nowMs);
    return `No activity for ${idle} day${idle === 1 ? "" : "s"}`;
  }
  if (deal.riskReason && REASON_TEXT[deal.riskReason]) return REASON_TEXT[deal.riskReason];
  const tier = dealTier(deal);
  if (tier === "high") return "High risk score";
  if (tier === "medium") return "Medium risk score";
  return "Low risk score";
}

function dueIn(deal: BookDeal, nowMs: number): number | null {
  if (deal.overdueDays !== null || deal.actionDueAt === null) return null;
  return Math.max(0, Math.floor((deal.actionDueAt - nowMs) / 86_400_000));
}

export function deriveAlerts(
  deals: BookDeal[],
  queue: QueueOrder,
  nowMs: number
): AlertsData {
  const open = deals.filter(isOpen);
  const byId = new Map(deals.map((d) => [d.id, d]));
  const openValue = sumValue(open);

  const toQueue = (ids: string[]): QueueDeal[] =>
    ids
      .map((id) => byId.get(id))
      .filter((d): d is BookDeal => d !== undefined)
      .map((d) => ({
        id: d.id,
        name: d.name,
        value: d.value,
        riskScore: d.riskScore,
        reason: reasonText(d, nowMs),
        action: d.action,
        overdueDays: d.overdueDays,
        dueInDays: dueIn(d, nowMs),
      }));

  const tierOf = (key: TierSummary["key"]) => open.filter((d) => dealTier(d) === key);
  const tiers: TierSummary[] = (["high", "medium", "low"] as const).map((key) => {
    const list = tierOf(key);
    return {
      key,
      count: list.length,
      value: sumValue(list),
      pct: share(list.length, open.length),
    };
  });
  const high = tierOf("high");

  const overdue = open.filter((d) => d.overdueDays !== null);
  const atRisk = open.filter((d) => d.status === "at_risk");
  const urgentCount = atRisk.filter(
    (d) => d.overdueDays !== null || d.urgency === "high"
  ).length;

  const weekAgo = nowMs - WEEK_DAYS * 86_400_000;

  const stageRows = new Map<string, StageRisk>();
  for (const stage of OPEN_STAGES) {
    stageRows.set(stage, {
      key: stage,
      label: BOOK_STAGE_LABEL[stage],
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
      highPct: 0,
    });
  }
  for (const deal of open) {
    const key = bookStage(deal.stage) ?? deal.stage.trim().toLowerCase();
    if (!stageRows.has(key)) {
      stageRows.set(key, {
        key,
        label: deal.stage.replace(/_+/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase()),
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
        highPct: 0,
      });
    }
    const row = stageRows.get(key)!;
    const tier = dealTier(deal);
    if (tier === "high") row.high += 1;
    else if (tier === "medium") row.medium += 1;
    else row.low += 1;
    row.total += 1;
  }
  const stages = [...stageRows.values()].map((row) => ({
    ...row,
    highPct: share(row.high, row.total),
  }));

  const reasonCount = (reason: string) => high.filter((d) => d.riskReason === reason).length;

  return {
    dealCount: deals.length,
    openCount: open.length,
    openValue,
    tiers,
    highCount: high.length,
    highValue: sumValue(high),
    overdueCount: overdue.length,
    overdueValue: sumValue(overdue),
    avgOverdueDays:
      overdue.length > 0
        ? overdue.reduce((sum, d) => sum + (d.overdueDays ?? 0), 0) / overdue.length
        : null,
    urgentCount,
    importantCount: atRisk.length - urgentCount,
    safeCount: open.filter((d) => d.status === "active").length,
    avgRisk:
      open.length > 0
        ? open.reduce((sum, d) => sum + d.riskScore, 0) / open.length
        : null,
    urgent: toQueue(queue.urgent),
    important: toQueue(queue.important),
    safe: toQueue(queue.safe),
    highIdleDays:
      high.length > 0
        ? high.reduce((sum, d) => sum + daysSince(d.lastActivityAt, nowMs), 0) / high.length
        : null,
    turnedHighThisWeek: high.filter(
      (d) => d.riskStartedAt !== null && d.riskStartedAt >= weekAgo
    ).length,
    stages,
    signals: [
      {
        key: "inactivity",
        title: "Activity decay past threshold",
        body: `No human activity for more than ${INACTIVITY_DAYS} days raises the score sharply.`,
        count: reasonCount(RISK_REASONS.NO_ACTIVITY),
      },
      {
        key: "stalled",
        title: "Negotiation stalled",
        body: "Late-stage deals lose health fast when outreach goes unanswered or replies stop.",
        count: reasonCount(RISK_REASONS.NEGOTIATION_STALLED),
      },
      {
        key: "value",
        title: "High-value exposure",
        body: `Deals above $${HIGH_VALUE_THRESHOLD.toLocaleString("en-US")} carry extra weight; the downside reads larger on the book.`,
        count: reasonCount(RISK_REASONS.HIGH_VALUE),
      },
      {
        key: "competitive",
        title: "Competitive signals",
        body: "Timing or interaction patterns suggest the buyer is weighing alternatives.",
        count: reasonCount(RISK_REASONS.COMPETITIVE_PRESSURE),
      },
    ],
  };
}

export function dueText(deal: QueueDeal): string | null {
  if (deal.overdueDays !== null) return null;
  if (deal.dueInDays === null) return null;
  if (deal.dueInDays === 0) return "due today";
  if (deal.dueInDays === 1) return "due tomorrow";
  return `due in ${deal.dueInDays} days`;
}
