import type { getAllDeals } from "@/app/actions/deals";
import { STAGES, STAGE_ORDER, type Stage } from "@/lib/config";
import { formatRiskLevel } from "@/lib/dealRisk";
import { stageKey } from "./analytics/model";
import type { TierKey } from "./blocks";
import { closedKind } from "./deals/model";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

export interface BookDeal {
  id: string;
  name: string;
  stage: string;
  status: string;
  value: number;
  riskScore: number;
  createdAt: number;
  lastActivityAt: number;
  location: string | null;
  action: string | null;
  urgency: string | null;
  actionDueAt: number | null;
  overdueDays: number | null;
  riskReason: string | null;
  riskStartedAt: number | null;
  isDemo: boolean;
}

function toMs(value: Date | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function toBookDeal(d: RawDeal): BookDeal {
  const createdAt = toMs(d.createdAt) ?? 0;
  const overdue = d.isActionOverdue ? d.actionOverdueByDays ?? 0 : null;
  return {
    id: d.id,
    name: d.name,
    stage: d.stage,
    status: d.status,
    value: d.value,
    riskScore: d.riskScore,
    createdAt,
    lastActivityAt: toMs(d.lastActivityAt) ?? createdAt,
    location: d.location ?? null,
    action: d.recommendedAction?.label ?? null,
    urgency: d.recommendedAction?.urgency ?? null,
    actionDueAt: toMs(d.actionDueAt),
    overdueDays: overdue !== null && overdue > 0 ? overdue : null,
    riskReason: d.primaryRiskReason ?? null,
    riskStartedAt: toMs(d.riskStartedAt),
    isDemo: d.isDemo,
  };
}

export const DAY_MS = 86_400_000;

export function daysSince(thenMs: number, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - thenMs) / DAY_MS));
}

export function isOpen(deal: Pick<BookDeal, "stage" | "status">): boolean {
  return closedKind(deal.stage) === null && deal.status !== "closed";
}

export function dealTier(deal: Pick<BookDeal, "stage" | "status" | "riskScore">): TierKey {
  const closed = closedKind(deal.stage);
  if (closed) return closed;
  if (deal.status === "closed") return "closed";
  const level = formatRiskLevel(deal.riskScore);
  if (level === "High") return "high";
  if (level === "Medium") return "medium";
  return "low";
}

export const OPEN_STAGES: readonly Stage[] = [
  STAGES.DISCOVER,
  STAGES.QUALIFY,
  STAGES.PROPOSAL,
  STAGES.NEGOTIATION,
];

export const BOOK_STAGES: readonly Stage[] = [
  ...OPEN_STAGES,
  STAGES.CLOSED_WON,
  STAGES.CLOSED_LOST,
];

export const BOOK_STAGE_LABEL: Record<Stage, string> = {
  discover: "Discover",
  qualify: "Qualify",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
};

export function bookStage(stage: string): Stage | null {
  const key = stageKey(stage);
  if (key) return key;
  const closed = closedKind(stage);
  if (closed === "won") return STAGES.CLOSED_WON;
  if (closed === "lost") return STAGES.CLOSED_LOST;
  return null;
}

export function sumValue(deals: Array<{ value: number }>): number {
  return deals.reduce((sum, d) => sum + d.value, 0);
}

export function share(part: number, whole: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return 0;
  return (part / whole) * 100;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

export function daysLabel(days: number): string {
  return `${days} day${days === 1 ? "" : "s"}`;
}

function stageOrder(stage: string): number {
  const known = bookStage(stage);
  return known ? STAGE_ORDER[known] : STAGE_ORDER[stage.trim().toLowerCase()] ?? 99;
}

export function movesOnPct(
  deals: Array<Pick<BookDeal, "stage">>,
  stage: Stage
): number | null {
  const order = STAGE_ORDER[stage];
  const reached = deals.filter((d) => stageOrder(d.stage) >= order).length;
  if (reached === 0) return null;
  const nextOrder = order + 1;
  const next = deals.filter((d) => stageOrder(d.stage) === nextOrder).length;
  return share(next, reached);
}
