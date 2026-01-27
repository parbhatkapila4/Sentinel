import { subDays, differenceInDays } from "date-fns";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_ORDER } from "@/lib/config";
import {
  forecastPipelineValue,
  identifyDealPatterns,
  detectAnomalies,
  type DealForPrediction,
} from "@/lib/predictions";

export interface DealForContext {
  id: string;
  name: string;
  stage: string;
  value: number;
  status: string;
  riskScore: number;
  riskLevel: string;
  lastActivityAt: Date;
  createdAt: Date;
  isActionOverdue?: boolean;
  actionOverdueByDays?: number | null;
  recommendedAction?: { label: string; urgency: string } | null;
  primaryRiskReason?: string | null;
  assignedTo?: { id: string; name: string | null; surname: string | null } | null;
}

export interface DealWithTimeline extends DealForContext {
  timeline?: Array<{ eventType: string; createdAt: Date; metadata?: Record<string, unknown> | null }>;
}

export interface DealContextSummary {
  byStage: Record<string, { count: number; value: number }>;
  byRisk: Record<string, { count: number; value: number }>;
  byStatus: Record<string, number>;
  urgent: Array<{
    name: string;
    value: number;
    reason: string;
    stage: string;
  }>;
  recentActivityPattern: string;
}

export function buildDealContext(deals: DealForContext[]): DealContextSummary {
  const byStage: Record<string, { count: number; value: number }> = {};
  const byRisk: Record<string, { count: number; value: number }> = {};
  const byStatus: Record<string, number> = {};

  for (const d of deals) {
    const stage = d.stage || "unknown";
    if (!byStage[stage]) byStage[stage] = { count: 0, value: 0 };
    byStage[stage].count += 1;
    byStage[stage].value += d.value;

    const risk = d.riskLevel || formatRiskLevel(d.riskScore);
    if (!byRisk[risk]) byRisk[risk] = { count: 0, value: 0 };
    byRisk[risk].count += 1;
    byRisk[risk].value += d.value;

    const status = d.status || "active";
    byStatus[status] = (byStatus[status] || 0) + 1;
  }

  const overdue = deals.filter((d) => d.isActionOverdue);
  const highRisk = deals.filter((d) => (d.riskLevel || formatRiskLevel(d.riskScore)) === "High");
  const urgentSet = new Set<string>();
  const urgent: DealContextSummary["urgent"] = [];

  for (const d of overdue) {
    if (urgentSet.has(d.id)) continue;
    urgentSet.add(d.id);
    urgent.push({
      name: d.name,
      value: d.value,
      reason: d.recommendedAction?.label
        ? `Overdue: ${d.recommendedAction.label}${d.actionOverdueByDays ? ` (${d.actionOverdueByDays}d)` : ""}`
        : "Overdue action",
      stage: d.stage,
    });
  }
  for (const d of highRisk) {
    if (urgentSet.has(d.id)) continue;
    urgentSet.add(d.id);
    urgent.push({
      name: d.name,
      value: d.value,
      reason: d.primaryRiskReason || "High risk",
      stage: d.stage,
    });
  }

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const createdLast7 = deals.filter((d) => new Date(d.createdAt) >= sevenDaysAgo).length;
  const activeCount = byStatus["active"] ?? 0;
  const atRiskCount = byStatus["at_risk"] ?? 0;
  let recentActivityPattern = "";
  if (createdLast7 > 0) {
    recentActivityPattern += `${createdLast7} new deal(s) in last 7 days. `;
  }
  if (atRiskCount > 0) {
    recentActivityPattern += `${atRiskCount} at-risk, ${overdue.length} overdue. `;
  }
  if (activeCount > 0) {
    recentActivityPattern += `${activeCount} active.`;
  }
  if (!recentActivityPattern) recentActivityPattern = "No recent activity.";

  return { byStage, byRisk, byStatus, urgent, recentActivityPattern };
}

export interface PipelineInsights {
  healthScore: number;
  trend: "improving" | "declining" | "stable";
  bottleneckStages: string[];
  avgDaysSinceActivity: number;
  bestPerformingStage: string | null;
}

export function buildPipelineInsights(deals: DealForContext[]): PipelineInsights {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  if (deals.length === 0) {
    return {
      healthScore: 0,
      trend: "stable",
      bottleneckStages: [],
      avgDaysSinceActivity: 0,
      bestPerformingStage: null,
    };
  }

  const active = deals.filter((d) => d.status === "active" || d.status === "at_risk");
  const closedWon = deals.filter((d) => d.stage === "closed_won");
  const closedLost = deals.filter((d) => d.stage === "closed_lost");
  const atRisk = deals.filter((d) => d.status === "at_risk");
  const overdue = deals.filter((d) => d.isActionOverdue);

  const winRate = closedWon.length + closedLost.length > 0
    ? closedWon.length / (closedWon.length + closedLost.length)
    : 0.5;
  const riskPenalty = (atRisk.length / Math.max(active.length, 1)) * 25;
  const overduePenalty = (overdue.length / Math.max(active.length, 1)) * 20;
  const healthScore = Math.round(
    Math.max(0, Math.min(100, 50 + winRate * 30 - riskPenalty - overduePenalty))
  );

  const createdThisWeek = deals.filter((d) => new Date(d.createdAt) >= sevenDaysAgo).length;
  const createdLastWeek = deals.filter((d) => {
    const t = new Date(d.createdAt);
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  }).length;
  let trend: PipelineInsights["trend"] = "stable";
  if (createdThisWeek > createdLastWeek + 2) trend = "improving";
  else if (createdLastWeek > createdThisWeek + 2) trend = "declining";

  const byStage: Record<string, number> = {};
  for (const d of active) {
    const s = d.stage || "unknown";
    byStage[s] = (byStage[s] || 0) + 1;
  }
  const stageOrder = Object.entries(STAGE_ORDER).sort((a, b) => a[1] - b[1]);
  const bottleneckStages: string[] = [];
  let prevCount = 0;
  for (const [stage, order] of stageOrder) {
    if (["closed_won", "closed_lost"].includes(stage)) continue;
    const count = byStage[stage] || 0;
    if (count > prevCount + 2 && prevCount > 0) {
      bottleneckStages.push(stage);
    }
    prevCount = count;
  }

  let totalDays = 0;
  let count = 0;
  for (const d of active) {
    const last = d.lastActivityAt ? new Date(d.lastActivityAt) : new Date(d.createdAt);
    totalDays += differenceInDays(now, last);
    count += 1;
  }
  const avgDaysSinceActivity = count > 0 ? Math.round(totalDays / count) : 0;

  const valueByStage: Record<string, number> = {};
  for (const d of active) {
    const s = d.stage || "unknown";
    valueByStage[s] = (valueByStage[s] || 0) + d.value;
  }
  const best = Object.entries(valueByStage).sort((a, b) => b[1] - a[1])[0];
  const bestPerformingStage = best ? best[0] : null;

  return {
    healthScore,
    trend,
    bottleneckStages,
    avgDaysSinceActivity,
    bestPerformingStage,
  };
}

export interface RecentActivitySummary {
  newDealsCount: number;
  stageChangesDescription: string;
  silentDeals: Array<{ name: string; value: number; daysSilent: number; stage: string }>;
  summaryLines: string[];
}

const SILENT_DAYS = 7;

export function buildRecentActivitySummary(deals: DealForContext[]): RecentActivitySummary {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const newDeals = deals.filter((d) => new Date(d.createdAt) >= sevenDaysAgo);
  const active = deals.filter((d) => d.status === "active" || d.status === "at_risk");
  const silent: RecentActivitySummary["silentDeals"] = [];

  for (const d of active) {
    const last = d.lastActivityAt ? new Date(d.lastActivityAt) : new Date(d.createdAt);
    const days = differenceInDays(now, last);
    if (days >= SILENT_DAYS) {
      silent.push({
        name: d.name,
        value: d.value,
        daysSilent: days,
        stage: d.stage,
      });
    }
  }
  silent.sort((a, b) => b.daysSilent - a.daysSilent);

  const lines: string[] = [];
  lines.push(`${newDeals.length} new deal(s) added`);
  if (silent.length > 0) {
    lines.push(`${silent.length} deal(s) went silent (no activity ≥${SILENT_DAYS} days)`);
  }

  return {
    newDealsCount: newDeals.length,
    stageChangesDescription: "Stage change data requires timeline; use deal detail for specifics.",
    silentDeals: silent.slice(0, 10),
    summaryLines: lines,
  };
}

export function formatContextForAI(deals: DealForContext[]): string {
  if (deals.length === 0) {
    return "PIPELINE OVERVIEW:\n- No deals in pipeline. User has no deal data to reference.";
  }

  const ctx = buildDealContext(deals);
  const insights = buildPipelineInsights(deals);
  const recent = buildRecentActivitySummary(deals);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const atRisk = deals.filter((d) => d.status === "at_risk");
  const atRiskValue = atRisk.reduce((sum, d) => sum + d.value, 0);
  const overdueCount = deals.filter((d) => d.isActionOverdue).length;

  const parts: string[] = [];

  parts.push("PIPELINE OVERVIEW:");
  parts.push(`- Total: ${deals.length} deals worth $${totalValue.toLocaleString("en-US")}`);
  parts.push(`- At Risk: ${atRisk.length} deals ($${atRiskValue.toLocaleString("en-US")})`);
  parts.push(`- Overdue Actions: ${overdueCount} deals`);
  parts.push("");

  if (ctx.urgent.length > 0) {
    parts.push("URGENT ATTENTION:");
    ctx.urgent.slice(0, 5).forEach((u, i) => {
      parts.push(`${i + 1}. ${u.name} ($${u.value.toLocaleString("en-US")}) - ${u.reason} [${u.stage}]`);
    });
    parts.push("");
  }

  parts.push("STAGE DISTRIBUTION:");
  const stageOrder = Object.entries(STAGE_ORDER).sort((a, b) => a[1] - b[1]);
  for (const [stage] of stageOrder) {
    const s = ctx.byStage[stage];
    if (s) parts.push(`- ${stage}: ${s.count} deals ($${s.value.toLocaleString("en-US")})`);
  }
  parts.push("");

  parts.push("PIPELINE INSIGHTS:");
  parts.push(`- Health score: ${insights.healthScore}/100 (${insights.trend})`);
  if (insights.bottleneckStages.length > 0) {
    parts.push(`- Bottleneck stages: ${insights.bottleneckStages.join(", ")}`);
  }
  parts.push(`- Avg days since activity (active): ${insights.avgDaysSinceActivity}`);
  if (insights.bestPerformingStage) {
    parts.push(`- Best performing stage: ${insights.bestPerformingStage}`);
  }
  parts.push("");

  parts.push("RECENT ACTIVITY (7 days):");
  for (const line of recent.summaryLines) parts.push(`- ${line}`);
  if (recent.silentDeals.length > 0) {
    parts.push("  Silent deals:");
    recent.silentDeals.slice(0, 3).forEach((s) => {
      parts.push(`    · ${s.name} ($${s.value.toLocaleString("en-US")}) - ${s.daysSilent} days, ${s.stage}`);
    });
  }

  return parts.join("\n");
}

function toDealForPrediction(d: DealForContext): DealForPrediction {
  return {
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    createdAt: d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt),
    lastActivityAt: d.lastActivityAt instanceof Date ? d.lastActivityAt : new Date(d.lastActivityAt),
    riskScore: d.riskScore,
    riskLevel: d.riskLevel,
    status: d.status,
  };
}


export function formatPredictionsForAI(deals: DealForContext[]): string {
  if (deals.length === 0) return "";
  const asPred = deals.map(toDealForPrediction);
  const forecast = forecastPipelineValue(asPred);
  const { insights, recommendations } = identifyDealPatterns(asPred);
  const { anomalies } = detectAnomalies(asPred);

  const lines: string[] = [];
  lines.push("PREDICTIONS & FORECAST:");
  lines.push(`- Expected pipeline value: $${forecast.expected.toLocaleString("en-US")} (best $${forecast.bestCase.toLocaleString("en-US")}, worst $${forecast.worstCase.toLocaleString("en-US")})`);
  lines.push(`- Next 3 months: ${forecast.monthly.map((m) => `${m.month} $${m.value.toLocaleString("en-US")}`).join("; ")}`);
  if (anomalies.length > 0) {
    lines.push(`- Anomalies: ${anomalies.length} (e.g. ${anomalies.slice(0, 2).map((a) => `${a.deal.name}: ${a.reason}`).join("; ")})`);
  }
  insights.slice(0, 3).forEach((i) => lines.push(`- ${i.description}`));
  if (recommendations.length > 0) {
    lines.push("Recommendations: " + recommendations.slice(0, 2).join("; "));
  }
  return lines.join("\n");
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function findMentionedDeals(
  query: string,
  deals: DealForContext[]
): DealForContext[] {
  const q = normalizeForMatch(query);
  if (!q) return [];

  const skipWords = new Set([
    "deal",
    "deals",
    "contract",
    "contracts",
    "project",
    "projects",
    "enterprise",
    "inc",
    "corp",
    "llc",
    "ltd",
    "the",
    "and",
    "for",
    "with",
    "about",
    "what",
    "how",
    "when",
    "where",
    "why",
    "which",
    "this",
    "that",
    "these",
    "those",
    "can",
    "will",
    "would",
    "should",
  ]);

  const matches: DealForContext[] = [];
  const matchedIds = new Set<string>();

  for (const d of deals) {
    if (matchedIds.has(d.id)) continue;

    const name = normalizeForMatch(d.name);
    if (!name) continue;

    if (q.includes(name)) {
      matches.push(d);
      matchedIds.add(d.id);
      continue;
    }

    const dealWords = name
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !skipWords.has(w));

    for (const word of dealWords) {
      const wordPattern = new RegExp(`\\b${word}\\b`, "i");
      if (wordPattern.test(q)) {
        matches.push(d);
        matchedIds.add(d.id);
        break;
      }
    }
  }

  return matches.sort((a, b) => {
    const aName = normalizeForMatch(a.name);
    const bName = normalizeForMatch(b.name);
    const aWords = aName
      .split(/\s+/)
      .filter((w) => !skipWords.has(w) && q.includes(w)).length;
    const bWords = bName
      .split(/\s+/)
      .filter((w) => !skipWords.has(w) && q.includes(w)).length;
    return bWords - aWords;
  });
}

export function resolveDealReference(
  messages: Array<{ role: string; content: string }>,
  deals: DealForContext[]
): DealForContext | null {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = userMessages[userMessages.length - 1] || "";
  const lower = last.toLowerCase();

  const refPatterns = [
    /that\s+deal/i,
    /the\s+one\s+i\s+mentioned/i,
    /the\s+deal\s+i\s+(?:just\s+)?mentioned/i,
    /this\s+deal/i,
    /that\s+one/i,
  ];

  const isRef = refPatterns.some((p) => p.test(last));
  if (!isRef) return null;

  for (let i = userMessages.length - 2; i >= 0; i--) {
    const mentioned = findMentionedDeals(userMessages[i] || "", deals);
    if (mentioned.length > 0) return mentioned[0];
  }
  return null;
}

export function formatDealDetailForAI(
  deal: DealWithTimeline
): string {
  const lines: string[] = [];
  lines.push(`DEAL: ${deal.name}`);
  lines.push(`- Value: $${deal.value.toLocaleString("en-US")}`);
  lines.push(`- Stage: ${deal.stage}`);
  lines.push(`- Status: ${deal.status}, Risk: ${deal.riskLevel}`);
  lines.push(`- Last activity: ${deal.lastActivityAt ? new Date(deal.lastActivityAt).toISOString().slice(0, 10) : "N/A"}`);
  if (deal.primaryRiskReason) lines.push(`- Risk reason: ${deal.primaryRiskReason}`);
  if (deal.recommendedAction) {
    lines.push(`- Recommended action: ${deal.recommendedAction.label} (${deal.recommendedAction.urgency})`);
  }
  if (deal.isActionOverdue && deal.actionOverdueByDays) {
    lines.push(`- Action overdue by ${deal.actionOverdueByDays} days`);
  }
  if (deal.assignedTo) {
    const n = [deal.assignedTo.name, deal.assignedTo.surname].filter(Boolean).join(" ");
    if (n) lines.push(`- Assigned to: ${n}`);
  }
  if (deal.timeline && deal.timeline.length > 0) {
    lines.push("RECENT TIMELINE:");
    deal.timeline.slice(0, 8).forEach((e) => {
      const d = new Date(e.createdAt).toISOString().slice(0, 10);
      lines.push(`  - ${d}: ${e.eventType}`);
    });
  }
  return lines.join("\n");
}
