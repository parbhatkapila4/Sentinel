import { differenceInDays } from "date-fns";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_ORDER } from "@/lib/config";
import type {
  DaysToClosePrediction,
  WinProbability,
  DealPatterns,
  SimilarDealsResult,
  SimilarDeal,
  PipelineForecast,
  AnomaliesResult,
  DealAnomaly,
  PredictionConfidence,
  WinProbabilityTrend,
} from "@/types";

const ACTIVE_STAGES = ["discover", "qualify", "proposal", "negotiation"];
const CLOSED_WON = "closed_won";
const CLOSED_LOST = "closed_lost";

export interface DealForPrediction {
  id: string;
  name: string;
  stage: string;
  value: number;
  createdAt: Date;
  lastActivityAt: Date;
  riskScore: number;
  riskLevel?: string;
  status?: string;
}

function isClosed(s: string) {
  return s === CLOSED_WON || s === CLOSED_LOST;
}

function dealAge(d: DealForPrediction) {
  return differenceInDays(new Date(), new Date(d.createdAt));
}

function daysSinceActivity(d: DealForPrediction) {
  const la = d.lastActivityAt ? new Date(d.lastActivityAt) : new Date(d.createdAt);
  return differenceInDays(new Date(), la);
}

function closedDealCycleDays(d: DealForPrediction): number {
  const end = d.lastActivityAt ? new Date(d.lastActivityAt) : new Date(d.createdAt);
  return differenceInDays(end, new Date(d.createdAt));
}

export function predictDaysToClose(
  deal: DealForPrediction,
  allDeals: DealForPrediction[]
): DaysToClosePrediction {
  const factors: string[] = [];
  const closedWon = allDeals.filter((d) => d.stage === CLOSED_WON);
  const cycleLengths = closedWon.map(closedDealCycleDays).filter((x) => x >= 0);

  if (cycleLengths.length === 0) {
    const fallback = 45;
    factors.push("No closed-won history; using default cycle length");
    return {
      estimatedDays: Math.max(0, fallback - dealAge(deal)),
      confidence: "low",
      factors,
    };
  }

  const avgCycle = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  factors.push(`Avg cycle length: ${Math.round(avgCycle)} days (n=${cycleLengths.length})`);

  const valueRatio = allDeals.length > 0
    ? deal.value / Math.max(1, allDeals.reduce((s, x) => s + x.value, 0) / allDeals.length)
    : 1;
  let multiplier = 1;
  if (valueRatio > 1.5) {
    multiplier = 1.2;
    factors.push("Larger-than-average deal; typically takes longer");
  } else if (valueRatio < 0.5) {
    multiplier = 0.85;
    factors.push("Smaller-than-average deal; often closes faster");
  }

  const stageOrder = STAGE_ORDER[deal.stage] ?? 3;
  const progress = (stageOrder - 1) / 4;
  const remaining = 1 - progress;
  const baseEstimate = avgCycle * remaining * multiplier;
  const age = dealAge(deal);
  const estimated = Math.max(0, Math.round(baseEstimate - age * 0.3));

  const daysSince = daysSinceActivity(deal);
  if (daysSince > 14) {
    factors.push(`Low activity (${daysSince}d since last); may extend timeline`);
  } else if (daysSince <= 3) {
    factors.push("Recent activity; favorable for faster close");
  }

  let confidence: PredictionConfidence = "medium";
  if (cycleLengths.length >= 10) confidence = "high";
  else if (cycleLengths.length < 3) confidence = "low";

  return { estimatedDays: estimated, confidence, factors };
}

export function calculateWinProbability(
  deal: DealForPrediction,
  allDeals: DealForPrediction[]
): WinProbability {
  const factors: string[] = [];
  const won = allDeals.filter((d) => d.stage === CLOSED_WON);
  const lost = allDeals.filter((d) => d.stage === CLOSED_LOST);
  const totalClosed = won.length + lost.length;
  const baseRate = totalClosed > 0 ? won.length / totalClosed : 0.5;
  let p = baseRate * 100;
  factors.push(`Historical win rate: ${(baseRate * 100).toFixed(0)}%`);

  const stageOrder = STAGE_ORDER[deal.stage] ?? 3;
  if (stageOrder <= 4) {
    const stageBoost = (stageOrder / 4) * 15;
    p += stageBoost;
    factors.push(`Later stage (${deal.stage}) tends to win more`);
  }

  const riskLevel = deal.riskLevel ?? formatRiskLevel(deal.riskScore);
  if (riskLevel === "High") {
    p -= 18;
    factors.push("High risk score reduces win probability");
  } else if (riskLevel === "Medium") {
    p -= 6;
    factors.push("Medium risk slightly reduces win probability");
  } else {
    factors.push("Low risk supports win probability");
  }

  const daysSince = daysSinceActivity(deal);
  if (daysSince > 21) {
    p -= 12;
    factors.push(`No activity in ${daysSince} days; deal may be stalling`);
  } else if (daysSince <= 5) {
    p += 5;
    factors.push("Recent activity improves likelihood");
  }

  const age = dealAge(deal);
  const closedCycles = [...won, ...lost].map(closedDealCycleDays).filter((x) => x >= 0);
  const p90Cycle = closedCycles.length > 0
    ? closedCycles.sort((a, b) => a - b)[Math.floor(closedCycles.length * 0.9)] ?? 60
    : 60;
  if (age > p90Cycle) {
    p -= 10;
    factors.push(`Deal older than 90% of closed deals; may indicate stall`);
  }

  p = Math.max(0, Math.min(100, Math.round(p)));
  let trend: WinProbabilityTrend = "stable";
  if (deal.status === "at_risk" || riskLevel === "High") trend = "down";
  else if (daysSince <= 5 && riskLevel === "Low") trend = "up";

  return { probability: p, trend, factors };
}

export function identifyDealPatterns(deals: DealForPrediction[]): DealPatterns {
  const insights: DealPatterns["insights"] = [];
  const recommendations: string[] = [];
  const won = deals.filter((d) => d.stage === CLOSED_WON);
  const lost = deals.filter((d) => d.stage === CLOSED_LOST);
  const active = deals.filter((d) => !isClosed(d.stage));

  if (won.length + lost.length === 0) {
    insights.push({
      type: "data",
      description: "No closed deals yet; patterns will emerge as you close more.",
      impact: "neutral",
    });
    recommendations.push("Close more deals to unlock pattern-based insights.");
    return { insights, recommendations };
  }

  const winRate = won.length / (won.length + lost.length);
  insights.push({
    type: "win_rate",
    description: `Overall win rate: ${(winRate * 100).toFixed(0)}% (${won.length} won, ${lost.length} lost).`,
    metric: `${(winRate * 100).toFixed(0)}%`,
    impact: winRate >= 0.5 ? "positive" : "negative",
  });

  const wonCycles = won.map(closedDealCycleDays).filter((x) => x >= 0);
  const lostCycles = lost.map(closedDealCycleDays).filter((x) => x >= 0);
  const avgWonCycle = wonCycles.length ? wonCycles.reduce((a, b) => a + b, 0) / wonCycles.length : 0;
  const avgLostCycle = lostCycles.length ? lostCycles.reduce((a, b) => a + b, 0) / lostCycles.length : 0;
  if (avgWonCycle > 0 && avgLostCycle > 0) {
    insights.push({
      type: "cycle",
      description: `Won deals average ${Math.round(avgWonCycle)} days to close; lost deals ${Math.round(avgLostCycle)} days.`,
      impact: avgWonCycle < avgLostCycle ? "positive" : "neutral",
    });
    if (avgLostCycle > avgWonCycle * 1.5) {
      recommendations.push("Deals that run much longer than average often end up lost; prioritize follow-up on aged deals.");
    }
  }

  const wonValues = won.map((d) => d.value);
  const lostValues = lost.map((d) => d.value);
  const avgWonValue = wonValues.length ? wonValues.reduce((a, b) => a + b, 0) / wonValues.length : 0;
  const avgLostValue = lostValues.length ? lostValues.reduce((a, b) => a + b, 0) / lostValues.length : 0;
  if (avgWonValue > 0 || avgLostValue > 0) {
    insights.push({
      type: "value",
      description: `Avg won deal: $${Math.round(avgWonValue).toLocaleString()}; avg lost: $${Math.round(avgLostValue).toLocaleString()}.`,
      impact: "neutral",
    });
  }

  const highRiskLost = lost.filter((d) => (d.riskLevel ?? formatRiskLevel(d.riskScore)) === "High").length;
  const highRiskWon = won.filter((d) => (d.riskLevel ?? formatRiskLevel(d.riskScore)) === "High").length;
  if (lost.length > 0 && highRiskLost / lost.length > 0.5) {
    insights.push({
      type: "risk",
      description: "Many lost deals had high risk scores; early risk mitigation may improve outcomes.",
      impact: "negative",
    });
    recommendations.push("Address risk signals early (follow-ups, activity) to improve win rate.");
  }

  const stuck = active.filter((d) => daysSinceActivity(d) > 14);
  if (stuck.length > 0) {
    insights.push({
      type: "activity",
      description: `${stuck.length} active deal(s) with no activity in 14+ days.`,
      impact: "negative",
    });
    recommendations.push("Re-engage deals with no recent activity to prevent them from going cold.");
  }

  return { insights, recommendations };
}

function valueBucket(v: number): number {
  if (v < 10_000) return 1;
  if (v < 50_000) return 2;
  if (v < 200_000) return 3;
  return 4;
}

export function findSimilarDeals(
  deal: DealForPrediction,
  allDeals: DealForPrediction[]
): SimilarDealsResult {
  const closed = allDeals.filter((d) => isClosed(d.stage) && d.id !== deal.id);
  const age = dealAge(deal);
  const vb = valueBucket(deal.value);
  const act = daysSinceActivity(deal);

  const scored = closed.map((d) => {
    const valueMatch = Math.abs(valueBucket(d.value) - vb);
    const cycle = closedDealCycleDays(d);
    const cycleMatch = Math.min(5, Math.abs(cycle - age) / 15);
    const score = valueMatch * 2 + cycleMatch;
    return { deal: d, score };
  });
  scored.sort((a, b) => a.score - b.score);
  const top = scored.slice(0, 5).map(({ deal: d }) => ({
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    outcome: d.stage === CLOSED_WON ? ("won" as const) : ("lost" as const),
    daysToClose: isClosed(d.stage) ? closedDealCycleDays(d) : undefined,
  })) as SimilarDeal[];

  const similarClosed = closed.filter((d) =>
    top.some((t) => t.id === d.id)
  );
  const wonAmong = similarClosed.filter((d) => d.stage === CLOSED_WON).length;
  const winRate = similarClosed.length > 0 ? wonAmong / similarClosed.length : 0;
  const cycles = similarClosed.map(closedDealCycleDays).filter((x) => x >= 0);
  const avgDaysToClose = cycles.length > 0
    ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length)
    : 0;

  return { similar: top, winRate, avgDaysToClose };
}

export function forecastPipelineValue(deals: DealForPrediction[]): PipelineForecast {
  const active = deals.filter((d) => !isClosed(d.stage));
  const probs = active.map((d) => calculateWinProbability(d, deals));
  let expected = 0;
  for (let i = 0; i < active.length; i++) {
    expected += active[i].value * (probs[i].probability / 100);
  }
  const bestCase = active.reduce((s, d, i) => s + d.value * Math.min(1, (probs[i].probability + 20) / 100), 0);
  const worstCase = active.reduce((s, d, i) => s + d.value * Math.max(0, (probs[i].probability - 25) / 100), 0);

  const months: PipelineForecast["monthly"] = [];
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const third = expected / 3;
  const bestThird = bestCase / 3;
  const worstThird = Math.max(0, worstCase) / 3;
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      month: names[d.getMonth()],
      value: Math.round(third),
      bestCase: Math.round(bestThird),
      worstCase: Math.round(worstThird),
    });
  }

  return {
    expected: Math.round(expected),
    bestCase: Math.round(bestCase),
    worstCase: Math.round(Math.max(0, worstCase)),
    monthly: months,
  };
}

export function detectAnomalies(deals: DealForPrediction[]): AnomaliesResult {
  const anomalies: DealAnomaly[] = [];
  const active = deals.filter((d) => !isClosed(d.stage));
  const closed = deals.filter((d) => isClosed(d.stage));
  const cycles = closed.map(closedDealCycleDays).filter((x) => x >= 0);
  const p90 = cycles.length > 0
    ? (cycles.sort((a, b) => a - b)[Math.floor(cycles.length * 0.9)] ?? 60)
    : 60;

  const values = active.map((d) => d.value);
  const avgVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const stdVal = values.length > 1
    ? Math.sqrt(values.reduce((s, v) => s + (v - avgVal) ** 2, 0) / (values.length - 1))
    : 0;

  for (const d of active) {
    const age = dealAge(d);
    const since = daysSinceActivity(d);

    if (age > p90 * 1.2) {
      anomalies.push({
        deal: { id: d.id, name: d.name, stage: d.stage, value: d.value },
        reason: `Stuck ${age} days (top 10% of cycles ≈ ${p90}d). Consider re-engaging or disqualifying.`,
        severity: age > p90 * 1.5 ? "high" : "medium",
      });
    }
    if (since >= 21) {
      anomalies.push({
        deal: { id: d.id, name: d.name, stage: d.stage, value: d.value },
        reason: `No activity in ${since} days; sudden drop in engagement.`,
        severity: since >= 35 ? "high" : "medium",
      });
    }
    if (stdVal > 0 && (d.value > avgVal + 2 * stdVal || d.value < Math.max(0, avgVal - 2 * stdVal))) {
      anomalies.push({
        deal: { id: d.id, name: d.name, stage: d.stage, value: d.value },
        reason: `Value $${d.value.toLocaleString()} is unusual for your pipeline (avg ≈ $${Math.round(avgVal).toLocaleString()}).`,
        severity: "low",
      });
    }
  }

  return { anomalies };
}
