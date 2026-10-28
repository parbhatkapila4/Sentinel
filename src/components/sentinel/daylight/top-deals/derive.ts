import { closedKind } from "../deals/model";
import { stageLabel } from "../deals/model";
import {
  BOOK_STAGES,
  BOOK_STAGE_LABEL,
  bookStage,
  daysSince,
  dealTier,
  isOpen,
  share,
  sumValue,
  type BookDeal,
} from "../book";
import type { TierKey } from "../blocks";

export const TOP_COUNT = 10;
export const TOP_THREE = 3;
export const OLDEST_LIMIT = 4;
export const RECENT_DAYS = 30;

export interface StandingRow {
  id: string;
  rank: number;
  name: string;
  location: string | null;
  stage: string;
  stageText: string;
  closed: "won" | "lost" | null;
  value: number;
  sharePct: number;
  barPct: number;
  tier: TierKey;
  lastActivityAt: number;
  action: string | null;
  overdueDays: number | null;
}

export interface NamedValue {
  id: string;
  name: string;
  value: number;
}

export interface RiskyTopDeal extends NamedValue {
  riskScore: number;
}

export interface StageCount {
  key: string;
  label: string;
  count: number;
  closed: "won" | "lost" | null;
}

export interface AgedDeal {
  id: string;
  name: string;
  ageDays: number;
}

export interface TopDealsData {
  dealCount: number;
  openCount: number;
  totalValue: number;
  openValue: number;
  wonValue: number;
  lostValue: number;
  highest: (NamedValue & { sharePct: number }) | null;
  topCount: number;
  topValue: number;
  topSharePct: number;
  topHighRisk: RiskyTopDeal[];
  topHighRiskValue: number;
  topNeedingAction: number;
  topRecent: number;
  topThree: Array<NamedValue & { sharePct: number }>;
  topThreeSharePct: number;
  fifthCount: number;
  fifthSharePct: number;
  topAverage: number;
  restAverage: number | null;
  headroom: number | null;
  standings: StandingRow[];
  topByStage: StageCount[];
  oldestOpen: AgedDeal[];
}

function stageText(deal: BookDeal, tier: TierKey): string {
  const closed = closedKind(deal.stage);
  if (closed === "won") return "Closed won";
  if (closed === "lost") return "Closed lost";
  const label = stageLabel(deal.stage);
  return tier === "closed" ? `${label} · Closed` : `${label} · ${TIER_WORD[tier]} risk`;
}

const TIER_WORD: Record<TierKey, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  won: "Won",
  lost: "Lost",
  closed: "Closed",
};

export function rankDeals(deals: BookDeal[]): BookDeal[] {
  return [...deals].sort((a, b) => b.value - a.value);
}

export function deriveTopDeals(deals: BookDeal[], nowMs: number): TopDealsData {
  const ranked = rankDeals(deals);
  const totalValue = sumValue(ranked);
  const open = ranked.filter(isOpen);
  const won = ranked.filter((d) => closedKind(d.stage) === "won");
  const lost = ranked.filter((d) => closedKind(d.stage) === "lost");

  const top = ranked.slice(0, TOP_COUNT);
  const topValue = sumValue(top);
  const rest = ranked.slice(TOP_COUNT);
  const topThree = ranked.slice(0, TOP_THREE);
  const fifthCount = Math.ceil(ranked.length * 0.2);
  const topValueMax = ranked[0]?.value ?? 0;

  const topHighRisk = top
    .filter((d) => dealTier(d) === "high")
    .map((d) => ({ id: d.id, name: d.name, value: d.value, riskScore: d.riskScore }));

  const topAverage = top.length > 0 ? topValue / top.length : 0;
  const restAverage = rest.length > 0 ? sumValue(rest) / rest.length : null;

  const stageCounts = new Map<string, StageCount>();
  for (const deal of top) {
    const known = bookStage(deal.stage);
    const key = known ?? deal.stage.trim().toLowerCase();
    const existing = stageCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      stageCounts.set(key, {
        key,
        label: known ? BOOK_STAGE_LABEL[known] : stageLabel(deal.stage),
        count: 1,
        closed: closedKind(deal.stage),
      });
    }
  }
  const order = (key: string) => {
    const index = (BOOK_STAGES as readonly string[]).indexOf(key);
    return index === -1 ? BOOK_STAGES.length : index;
  };
  const topByStage = [...stageCounts.values()].sort(
    (a, b) => order(a.key) - order(b.key) || b.count - a.count
  );

  const oldestOpen = top
    .filter(isOpen)
    .map((d) => ({ id: d.id, name: d.name, ageDays: daysSince(d.createdAt, nowMs) }))
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, OLDEST_LIMIT);

  const standings: StandingRow[] = ranked.map((d, i) => {
    const tier = dealTier(d);
    return {
      id: d.id,
      rank: i + 1,
      name: d.name,
      location: d.location,
      stage: d.stage,
      stageText: stageText(d, tier),
      closed: closedKind(d.stage),
      value: d.value,
      sharePct: share(d.value, totalValue),
      barPct: share(d.value, topValueMax),
      tier,
      lastActivityAt: d.lastActivityAt,
      action: isOpen(d) ? d.action : null,
      overdueDays: isOpen(d) ? d.overdueDays : null,
    };
  });

  return {
    dealCount: ranked.length,
    openCount: open.length,
    totalValue,
    openValue: sumValue(open),
    wonValue: sumValue(won),
    lostValue: sumValue(lost),
    highest: ranked[0]
      ? {
          id: ranked[0].id,
          name: ranked[0].name,
          value: ranked[0].value,
          sharePct: share(ranked[0].value, totalValue),
        }
      : null,
    topCount: top.length,
    topValue,
    topSharePct: share(topValue, totalValue),
    topHighRisk,
    topHighRiskValue: sumValue(topHighRisk),
    topNeedingAction: top.filter((d) => isOpen(d) && d.action !== null).length,
    topRecent: top.filter((d) => daysSince(d.createdAt, nowMs) <= RECENT_DAYS).length,
    topThree: topThree.map((d) => ({
      id: d.id,
      name: d.name,
      value: d.value,
      sharePct: share(d.value, totalValue),
    })),
    topThreeSharePct: share(sumValue(topThree), totalValue),
    fifthCount,
    fifthSharePct: share(sumValue(ranked.slice(0, fifthCount)), totalValue),
    topAverage,
    restAverage,
    headroom: restAverage && restAverage > 0 ? topAverage / restAverage : null,
    standings,
    topByStage,
    oldestOpen,
  };
}

const FRACTIONS: Array<[number, string]> = [
  [15, "a sliver"],
  [22.5, "a fifth"],
  [29, "a quarter"],
  [42, "a third"],
  [58, "half"],
  [71, "two thirds"],
  [85, "three quarters"],
];

export function fractionWords(pct: number): string {
  for (const [limit, words] of FRACTIONS) {
    if (pct < limit) return words;
  }
  return "nearly all";
}

const COUNT_NAMES = ["No deals", "One deal", "Two deals", "Three deals"];

export function topThreeSub(count: number, pct: number): string {
  if (count === 0) return "Nothing on the book yet";
  return `${COUNT_NAMES[count] ?? `${count} deals`}, ${fractionWords(pct)} of the book`;
}

export function headroomLabel(headroom: number | null): string {
  if (headroom === null) return "-";
  return `${headroom.toFixed(headroom >= 10 ? 0 : 1)}×`;
}
