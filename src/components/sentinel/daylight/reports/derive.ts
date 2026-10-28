import { closedKind } from "../deals/model";
import {
  BOOK_STAGES,
  BOOK_STAGE_LABEL,
  DAY_MS,
  bookStage,
  daysSince,
  dealTier,
  isOpen,
  movesOnPct,
  share,
  sumValue,
  type BookDeal,
} from "../book";
import type { TierKey } from "../blocks";
import { stageLabel } from "../deals/model";

export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;
export const LIST_LIMIT = 3;

export const AGE_BUCKETS = [
  { label: "Under 7 days", min: 0, max: 7 },
  { label: "7–14 days", min: 7, max: 14 },
  { label: "14–30 days", min: 14, max: 30 },
  { label: "30–60 days", min: 30, max: 60 },
  { label: "60+ days", min: 60, max: Infinity },
] as const;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface NewDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  createdAt: number;
}

export interface PickUpDeal {
  id: string;
  name: string;
  action: string;
  overdueDays: number | null;
  dueInDays: number | null;
}

export interface StageLine {
  key: string;
  label: string;
  closed: "won" | "lost" | null;
  count: number;
  value: number;
  sharePct: number;
  average: number | null;
  movesOnPct: number | null;
}

export interface TierLineData {
  key: "high" | "medium" | "low";
  count: number;
  value: number;
}

export interface RegistryRow {
  id: string;
  name: string;
  location: string | null;
  value: number;
  tier: TierKey;
  closed: "won" | "lost" | null;
  action: string | null;
  overdueDays: number | null;
  lastActivityAt: number;
}

export interface RegistryGroup {
  key: string;
  label: string;
  count: number;
  value: number;
  rows: RegistryRow[];
}

export interface ReportsData {
  dealCount: number;
  openCount: number;
  totalValue: number;
  openValue: number;
  wonValue: number;
  lostValue: number;
  average: number;
  smallest: number;
  largest: number;
  weekStart: number;
  newThisWeek: number;
  newThisWeekValue: number;
  dailyNew: number[];
  wonThisWeek: number;
  wonThisWeekValue: number;
  lostThisWeek: number;
  lostThisWeekValue: number;
  newLastMonth: number;
  newest: NewDeal[];
  withNextStep: number;
  overdueCount: number;
  pickUp: PickUpDeal[];
  stages: StageLine[];
  tiers: TierLineData[];
  avgRisk: number | null;
  weekdays: number[];
  ages: number[];
  registry: RegistryGroup[];
}

const REGISTRY_ORDER = [
  "negotiation",
  "proposal",
  "qualify",
  "discover",
  "closed_won",
  "closed_lost",
];

function weekdayIndex(ms: number): number {
  return (new Date(ms).getDay() + 6) % 7;
}

function dueInDays(deal: BookDeal, nowMs: number): number | null {
  if (deal.actionDueAt === null) return null;
  return Math.max(0, Math.floor((deal.actionDueAt - nowMs) / DAY_MS));
}

export function deriveReports(deals: BookDeal[], nowMs: number): ReportsData {
  const open = deals.filter(isOpen);
  const won = deals.filter((d) => closedKind(d.stage) === "won");
  const lost = deals.filter((d) => closedKind(d.stage) === "lost");
  const totalValue = sumValue(deals);
  const weekAgo = nowMs - WEEK_DAYS * DAY_MS;
  const monthAgo = nowMs - MONTH_DAYS * DAY_MS;

  const createdThisWeek = deals.filter((d) => d.createdAt >= weekAgo);
  const dailyNew = Array.from({ length: WEEK_DAYS }, (_, i) => {
    const daysAgo = WEEK_DAYS - 1 - i;
    return deals.filter((d) => daysSince(d.createdAt, nowMs) === daysAgo).length;
  });
  const wonThisWeek = won.filter((d) => d.lastActivityAt >= weekAgo);
  const lostThisWeek = lost.filter((d) => d.lastActivityAt >= weekAgo);

  const withAction = open.filter((d) => d.action !== null);
  const overdue = withAction
    .filter((d) => d.overdueDays !== null)
    .sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0));
  const upcoming = withAction
    .filter((d) => d.overdueDays === null && d.actionDueAt !== null)
    .sort((a, b) => (a.actionDueAt ?? 0) - (b.actionDueAt ?? 0));
  const pickUp = (overdue.length > 0 ? overdue : upcoming).slice(0, LIST_LIMIT).map((d) => ({
    id: d.id,
    name: d.name,
    action: d.action ?? "",
    overdueDays: d.overdueDays,
    dueInDays: d.overdueDays === null ? dueInDays(d, nowMs) : null,
  }));

  const groups = new Map<string, BookDeal[]>();
  for (const stage of BOOK_STAGES) groups.set(stage, []);
  for (const deal of deals) {
    const key = bookStage(deal.stage) ?? deal.stage.trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(deal);
  }
  const labelFor = (key: string, sample?: BookDeal) =>
    (BOOK_STAGE_LABEL as Record<string, string>)[key] ??
    (sample ? stageLabel(sample.stage) : key);

  const stages: StageLine[] = [...groups.entries()].map(([key, list]) => {
    const closed = key === "closed_won" ? "won" : key === "closed_lost" ? "lost" : null;
    const known = (BOOK_STAGES as readonly string[]).includes(key);
    return {
      key,
      label: labelFor(key, list[0]),
      closed,
      count: list.length,
      value: sumValue(list),
      sharePct: share(sumValue(list), totalValue),
      average: list.length > 0 ? sumValue(list) / list.length : null,
      movesOnPct:
        closed === null && known
          ? movesOnPct(deals, key as (typeof BOOK_STAGES)[number])
          : null,
    };
  });

  const tiers: TierLineData[] = (["high", "medium", "low"] as const).map((key) => {
    const list = open.filter((d) => dealTier(d) === key);
    return { key, count: list.length, value: sumValue(list) };
  });

  const weekdays = WEEKDAYS.map((_, i) =>
    deals.filter((d) => weekdayIndex(d.createdAt) === i).length
  );
  const ages = AGE_BUCKETS.map(
    (bucket) =>
      deals.filter((d) => {
        const age = daysSince(d.createdAt, nowMs);
        return age >= bucket.min && age < bucket.max;
      }).length
  );

  const registryKeys = [
    ...REGISTRY_ORDER.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !REGISTRY_ORDER.includes(k)),
  ];
  const registry: RegistryGroup[] = registryKeys
    .map((key) => {
      const list = [...(groups.get(key) ?? [])].sort((a, b) => b.value - a.value);
      return {
        key,
        label: labelFor(key, list[0]),
        count: list.length,
        value: sumValue(list),
        rows: list.map((d) => ({
          id: d.id,
          name: d.name,
          location: d.location,
          value: d.value,
          tier: dealTier(d),
          closed: closedKind(d.stage),
          action: isOpen(d) ? d.action : null,
          overdueDays: isOpen(d) ? d.overdueDays : null,
          lastActivityAt: d.lastActivityAt,
        })),
      };
    })
    .filter((group) => group.count > 0);

  const values = deals.map((d) => d.value);

  return {
    dealCount: deals.length,
    openCount: open.length,
    totalValue,
    openValue: sumValue(open),
    wonValue: sumValue(won),
    lostValue: sumValue(lost),
    average: deals.length > 0 ? totalValue / deals.length : 0,
    smallest: values.length > 0 ? Math.min(...values) : 0,
    largest: values.length > 0 ? Math.max(...values) : 0,
    weekStart: nowMs - (WEEK_DAYS - 1) * DAY_MS,
    newThisWeek: createdThisWeek.length,
    newThisWeekValue: sumValue(createdThisWeek),
    dailyNew,
    wonThisWeek: wonThisWeek.length,
    wonThisWeekValue: sumValue(wonThisWeek),
    lostThisWeek: lostThisWeek.length,
    lostThisWeekValue: sumValue(lostThisWeek),
    newLastMonth: deals.filter((d) => d.createdAt >= monthAgo).length,
    newest: [...deals]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, LIST_LIMIT)
      .map((d) => ({ id: d.id, name: d.name, stage: d.stage, value: d.value, createdAt: d.createdAt })),
    withNextStep: withAction.length,
    overdueCount: overdue.length,
    pickUp,
    stages,
    tiers,
    avgRisk:
      open.length > 0 ? open.reduce((sum, d) => sum + d.riskScore, 0) / open.length : null,
    weekdays,
    ages,
    registry,
  };
}
