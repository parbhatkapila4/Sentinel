import { differenceInDays, differenceInHours } from "date-fns";
import {
  detectAnomalies,
  identifyDealPatterns,
  type DealForPrediction,
} from "@/lib/predictions";
import type {
  AIPanelContent,
  BriefingItem,
  SentinelDeal,
  ShortListItem,
  TickerItem,
} from "./types";
import { formatShortMoney as formatCurrencyShort } from "@/lib/format-money";

const CLOSED_WON = "closed_won";
const CLOSED_LOST = "closed_lost";

function isClosedStage(s: string) {
  const norm = s.toLowerCase().replace(/\s+/g, "_");
  return norm === CLOSED_WON || norm === CLOSED_LOST;
}

function isClosedWonStage(s: string) {
  const norm = s.toLowerCase().replace(/\s+/g, "_");
  return norm === CLOSED_WON || norm === "closed";
}

function daysIdle(d: SentinelDeal) {
  const last = d.lastActivityAt ?? d.createdAt;
  return differenceInDays(new Date(), new Date(last));
}

function hoursSinceCreated(d: SentinelDeal) {
  return differenceInHours(new Date(), new Date(d.createdAt));
}

function normalizeRiskLevel(d: SentinelDeal): "high" | "medium" | "low" {
  const lvl = (d.riskLevel ?? "").toLowerCase();
  if (lvl === "high" || lvl === "medium" || lvl === "low") return lvl;
  if (d.riskScore >= 70) return "high";
  if (d.riskScore >= 40) return "medium";
  return "low";
}

function shortName(name: string, max = 14): string {
  const upper = name.toUpperCase().replace(/[^A-Z0-9 &-]/g, "");
  if (upper.length <= max) return upper;
  return upper.slice(0, max).trimEnd();
}

function formatStageLabel(stage: string): string {
  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface TickerContext {
  sourceLabels?: string[];
  coveragePercent?: number;
  alertCount?: number;
  syncTime?: string;
  isDemoMode?: boolean;
  crmConnected?: boolean;
}

export function buildTickerItems(
  deals: SentinelDeal[],
  context: TickerContext = {}
): TickerItem[] {
  const items: TickerItem[] = [];
  const seen = new Set<string>();

  const push = (it: TickerItem) => {
    const key = `${it.tag}:${it.note}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(it);
  };

  const real = deals.filter((d) => !d.isDemo);
  const active = real.filter((d) => !isClosedStage(d.stage));
  const atRiskDeals = active.filter(
    (d) => normalizeRiskLevel(d) !== "low" || daysIdle(d) >= 7
  );
  const closedWon = real.filter((d) => isClosedWonStage(d.stage));

  const totalActiveValue = active.reduce((s, d) => s + d.value, 0);
  const totalAtRiskValue = atRiskDeals.reduce((s, d) => s + d.value, 0);

  const wonThisMonth = closedWon.filter((d) => {
    const last = d.lastActivityAt ?? d.createdAt;
    return differenceInDays(new Date(), new Date(last)) <= 31;
  });
  const wonThisMonthValue = wonThisMonth.reduce((s, d) => s + d.value, 0);

  const wonThisWeek = closedWon.filter((d) => {
    const last = d.lastActivityAt ?? d.createdAt;
    return differenceInDays(new Date(), new Date(last)) <= 7;
  });
  const wonThisWeekValue = wonThisWeek.reduce((s, d) => s + d.value, 0);

  const largestActive = [...active].sort((a, b) => b.value - a.value)[0];

  if (active.length > 0) {
    push({
      tag: "PIPELINE",
      value: totalActiveValue,
      trend: "up",
      note: `${active.length} ACTIVE`,
    });
  }

  if (atRiskDeals.length > 0) {
    const pct = totalActiveValue > 0
      ? Math.round((totalAtRiskValue / totalActiveValue) * 100)
      : 0;
    push({
      tag: "AT RISK",
      value: totalAtRiskValue,
      trend: "down",
      note: pct > 0
        ? `${atRiskDeals.length} DEAL${atRiskDeals.length === 1 ? "" : "S"} · ${pct}% OF BOOK`
        : `${atRiskDeals.length} DEAL${atRiskDeals.length === 1 ? "" : "S"}`,
    });
  }

  if (wonThisWeek.length > 0) {
    push({
      tag: "WON · WEEK",
      value: wonThisWeekValue,
      trend: "up",
      note: `${wonThisWeek.length} CLOSED`,
    });
  } else if (wonThisMonth.length > 0) {
    push({
      tag: "WON · MONTH",
      value: wonThisMonthValue,
      trend: "up",
      note: `${wonThisMonth.length} CLOSED`,
    });
  }

  if (largestActive) {
    push({
      tag: "TOP DEAL",
      value: largestActive.value,
      trend: "up",
      note: shortName(largestActive.name),
    });
  }

  if (
    typeof context.coveragePercent === "number" &&
    context.coveragePercent > 0
  ) {
    const cov = Math.round(context.coveragePercent);
    push({
      tag: "COVERAGE",
      value: 0,
      trend: cov >= 75 ? "up" : cov >= 50 ? "flat" : "down",
      note: `${cov}% TRACKED`,
    });
  }

  if ((context.alertCount ?? 0) > 0) {
    push({
      tag: "ALERTS",
      value: 0,
      trend: "down",
      note: `${context.alertCount} NEW · ACTION NEEDED`,
    });
  }

  const liveSources = (context.sourceLabels ?? []).filter(
    (s) => s && s !== "NONE" && s !== "DEMO"
  );
  if (liveSources.length > 0 && context.syncTime) {
    push({
      tag: "SYNC",
      value: 0,
      trend: "flat",
      note: `${liveSources.join(" · ")} · ${context.syncTime}`,
    });
  }

  const recentAdvances = active
    .filter((d) => {
      const last = d.lastActivityAt ?? d.createdAt;
      const hours = differenceInHours(new Date(), new Date(last));
      return (
        hours <= 72 &&
        /(stage|proposal|negotiation|contract|technical|qualif)/i.test(d.stage)
      );
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  for (const d of recentAdvances) {
    push({
      tag: shortName(d.name),
      value: d.value,
      trend: "up",
      note: `↑ ${formatStageLabel(d.stage).toUpperCase()}`,
    });
  }

  const idleFlags = atRiskDeals
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  for (const d of idleFlags) {
    const idle = daysIdle(d);
    push({
      tag: shortName(d.name),
      value: d.value,
      trend: "down",
      note: idle >= 7 ? `◆ IDLE ${idle}D` : "↓ AT RISK",
    });
  }

  const recentWins = closedWon
    .filter((d) => {
      const last = d.lastActivityAt ?? d.createdAt;
      return differenceInHours(new Date(), new Date(last)) <= 72;
    })
    .slice(0, 2);
  for (const d of recentWins) {
    push({
      tag: shortName(d.name),
      value: d.value,
      trend: "up",
      note: "✓ WON",
    });
  }

  const fresh = active
    .filter(
      (d) => hoursSinceCreated(d) <= 72 && normalizeRiskLevel(d) === "low"
    )
    .slice(0, 2);
  for (const d of fresh) {
    push({
      tag: shortName(d.name),
      value: d.value,
      trend: "up",
      note: "★ NEW SIGNAL",
    });
  }

  if (items.length === 0) {
    if (!context.crmConnected) {
      push({
        tag: "SENTINEL",
        value: 0,
        trend: "flat",
        note: "STANDING BY",
      });
      push({
        tag: "SETUP",
        value: 0,
        trend: "flat",
        note: "CONNECT A CRM TO GO LIVE",
      });
      push({
        tag: "SOURCES",
        value: 0,
        trend: "flat",
        note: "SALESFORCE · HUBSPOT · CALENDAR · SLACK",
      });
      push({
        tag: "PRIVACY",
        value: 0,
        trend: "flat",
        note: "READ-ONLY · NO TRAINING ON YOUR DATA",
      });
      push({
        tag: "SIGNALS",
        value: 0,
        trend: "flat",
        note: "STAGE · RISK · ACTIVITY · IDLE-TIME",
      });
    } else {
      push({
        tag: "SENTINEL",
        value: 0,
        trend: "flat",
        note: "STANDING BY",
      });
      push({
        tag: "NO DEALS",
        value: 0,
        trend: "flat",
        note: "ADD A DEAL TO SEE YOUR WIRE",
      });
      if (liveSources.length > 0 && context.syncTime) {
        push({
          tag: "SYNC",
          value: 0,
          trend: "flat",
          note: `${liveSources.join(" · ")} · ${context.syncTime}`,
        });
      }
    }
  }

  return items.slice(0, 14);
}

export function buildShortList(deals: SentinelDeal[]): ShortListItem[] {
  const active = deals.filter((d) => !isClosedStage(d.stage));

  const scored = active.map((d) => {
    const idle = daysIdle(d);
    const risk = normalizeRiskLevel(d);
    const riskWeight = risk === "high" ? 3 : risk === "medium" ? 2 : 1;
    const urgency = riskWeight * 1_000 + idle * 100;
    return { d, score: urgency * Math.log10(Math.max(d.value, 10)) };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(({ d }, i) => {
    const idle = daysIdle(d);
    const risk = normalizeRiskLevel(d);
    let ageNote: string;
    let ageSeverity: ShortListItem["ageSeverity"] = "neutral";
    if (idle >= 14) {
      ageNote = `IDLE ${idle}D`;
      ageSeverity = "high";
    } else if (idle >= 7) {
      ageNote = `IDLE ${idle}D`;
      ageSeverity = "medium";
    } else if (idle >= 3) {
      ageNote = `IDLE ${idle}D`;
      ageSeverity = "low";
    } else {
      ageNote = idle === 0 ? "ACTIVE TODAY" : `ADVANCED ${idle}D AGO`;
      ageSeverity = "low";
    }

    const riskPercent =
      risk === "high"
        ? Math.min(95, 60 + Math.min(idle, 30))
        : risk === "medium"
          ? Math.min(75, 40 + Math.min(idle, 20))
          : Math.min(35, 15 + Math.min(idle, 15));

    const riskLabel: ShortListItem["riskLabel"] =
      risk === "high" ? "HIGH" : risk === "medium" ? "MEDIUM" : "HEALTHY";

    return {
      id: d.id,
      index: i + 1,
      name: d.name,
      segment: inferSegment(d),
      stage: formatStageLabel(d.stage),
      location: d.country ?? undefined,
      ageNote,
      ageSeverity,
      value: d.value,
      riskPercent,
      riskLabel,
    };
  });
}

function inferSegment(d: SentinelDeal): string {
  if (d.value >= 500_000) return "Enterprise";
  if (d.value >= 100_000) return "Mid-market";
  return "Startup";
}

export interface LeadHeadline {
  variant: "slipping" | "winning" | "quiet" | "onboarding";
  prefix: string;
  italicWord: string;
  suffix: string;
  hangingClause: string;
  deck: string;
  emphases: string[];
}

export function deriveLeadHeadline(
  deals: SentinelDeal[],
  hasAnyDeals: boolean
): LeadHeadline {
  if (!hasAnyDeals) {
    return {
      variant: "onboarding",
      prefix: "Your desk is",
      italicWord: "empty.",
      suffix: "",
      hangingClause: "-\nconnect your CRM to begin.",
      deck:
        "Sentinel reads from HubSpot, Salesforce, and Google Calendar, and sends alerts through Slack. Once one source is live, signals start flowing and this page fills in around them.",
      emphases: ["HubSpot", "Salesforce"],
    };
  }

  const active = deals.filter((d) => !isClosedStage(d.stage));
  const slipping = active.filter(
    (d) => normalizeRiskLevel(d) !== "low" || daysIdle(d) >= 7
  );

  if (slipping.length >= 2) {
    const top = [...slipping].sort((a, b) => b.value - a.value).slice(0, 2);
    const wordForCount = numberWord(slipping.length);
    return {
      variant: "slipping",
      prefix: `${wordForCount} deals are`,
      italicWord: "slipping.",
      suffix: "",
      hangingClause: "-\nand the forecast is still up.",
      deck: `Activity across the book is the strongest it's been in weeks, but ${top[0].name} has gone quiet and ${top[1].name}'s champion hasn't logged in in days. Your weighted number is holding - for now.`,
      emphases: top.map((d) => d.name),
    };
  }

  const wonRecently = deals.filter(
    (d) =>
      isClosedWonStage(d.stage) &&
      differenceInDays(
        new Date(),
        new Date(d.lastActivityAt ?? d.createdAt)
      ) <= 7
  );
  if (wonRecently.length >= 1) {
    const top = wonRecently.sort((a, b) => b.value - a.value)[0];
    return {
      variant: "winning",
      prefix: "The book is",
      italicWord: "moving.",
      suffix: "",
      hangingClause: "-\nclosed wins lead the wire.",
      deck: `${top.name} closed this week, and the rest of the pipeline is showing positive engagement signals. Most active deals are advancing on schedule.`,
      emphases: [top.name],
    };
  }

  return {
    variant: "quiet",
    prefix: "The book is",
    italicWord: "steady.",
    suffix: "",
    hangingClause: "-\nno red flags this morning.",
    deck:
      "All active deals are within their expected cadence. Your weighted forecast is holding, and there are no anomalies severe enough to surface here.",
    emphases: [],
  };
}

function numberWord(n: number): string {
  const map: Record<number, string> = {
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
  };
  return map[n] ?? String(n);
}

export function buildBriefingItems(deals: SentinelDeal[]): {
  title: string;
  items: BriefingItem[];
} {
  const dealsForPrediction = toDealsForPrediction(deals);
  const { anomalies } = detectAnomalies(dealsForPrediction);
  const { insights } = identifyDealPatterns(dealsForPrediction);

  const items: BriefingItem[] = [];

  if (anomalies.length > 0) {
    const top = anomalies[0];
    items.push({
      body: `${top.deal.name} ${top.reason.toLowerCase()}`,
      emphasis: top.deal.name,
    });
  }

  const recentWins = deals
    .filter((d) => isClosedWonStage(d.stage))
    .filter(
      (d) =>
        differenceInDays(
          new Date(),
          new Date(d.lastActivityAt ?? d.createdAt)
        ) <= 7
    )
    .sort((a, b) => b.value - a.value);
  if (recentWins.length > 0) {
    const w = recentWins[0];
    items.push({
      body: `${w.name} closed this week. +${formatCurrencyShort(w.value)} weighted.`,
      emphasis: w.name,
    });
  }

  const advancing = deals.filter((d) => {
    const last = d.lastActivityAt ?? d.createdAt;
    return (
      !isClosedStage(d.stage) &&
      differenceInHours(new Date(), new Date(last)) <= 48 &&
      normalizeRiskLevel(d) === "low"
    );
  });
  if (advancing.length > 0) {
    const names = advancing.slice(0, 3).map((d) => d.name);
    items.push({
      body:
        names.length === 1
          ? `New signals on ${names[0]}.`
          : `New signals across ${joinNames(names)}.`,
      emphasis: names[0],
    });
  }

  for (const ins of insights) {
    if (items.length >= 4) break;
    if (
      ins.impact === "negative" ||
      ins.impact === "positive" ||
      items.length < 3
    ) {
      items.push({ body: ins.description });
    }
  }

  while (items.length < 4) {
    items.push({
      body: "Pipeline cadence is steady; no escalations needed.",
    });
  }

  return {
    title: anomalies.length > 0 ? "Four things\nbefore your 9am." : "Today on the desk.",
    items: items.slice(0, 4),
  };
}

function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function deriveAIPanel(deals: SentinelDeal[]): AIPanelContent {
  const dealsForPrediction = toDealsForPrediction(deals);
  const { anomalies } = detectAnomalies(dealsForPrediction);
  const { insights, recommendations } = identifyDealPatterns(dealsForPrediction);

  const now = new Date();
  const answeredAt = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const highSev = anomalies.find((a) => a.severity === "high") ?? anomalies[0];
  if (highSev) {
    const deal = deals.find((d) => d.id === highSev.deal.id);
    const name = highSev.deal.name;
    const idle = deal ? daysIdle(deal) : 0;
    const recommendation =
      recommendations[0] ?? "Add a next action and route to the account owner.";
    return {
      subject: name,
      question: `Why is ${name} at risk, and what should I do about it?`,
      answer: [
        { kind: "text", value: `${name} is flagged as ` },
        { kind: "italic", value: `${highSev.severity} risk` },
        {
          kind: "text",
          value: idle > 0 ? ` after ${idle} days without activity. ` : ". ",
        },
        { kind: "text", value: `${highSev.reason} ` },
        { kind: "text", value: "Recommended next step: " },
        { kind: "mark", value: recommendation },
      ],
      citations: ["RISK MODEL", "TIMELINE", "CRM LOG", "ACTIVITY"],
      actions: [
        {
          title: "Open the deal",
          subtitle: `${formatStageLabel(highSev.deal.stage)} · ${formatCurrencyShort(highSev.deal.value)}`,
          href: `/deals/${highSev.deal.id}`,
        },
        {
          title: "Pull similar at-risk deals",
          subtitle: `Across ${deals.length} deals`,
          href: "/risk-overview",
        },
        { title: "Ask a follow-up", subtitle: "Continue the thread", href: "/insights" },
      ],
      answeredAt,
      sourceCount: 4,
    };
  }

  const significant = insights.find(
    (i) => i.impact === "negative" || i.impact === "positive"
  );
  if (significant) {
    return {
      subject: significant.type.replace(/_/g, " "),
      question: `What pattern is Sentinel seeing across the book?`,
      answer: [
        { kind: "text", value: significant.description + " " },
        ...(recommendations[0]
          ? ([
            { kind: "text", value: "Recommended: " },
            { kind: "mark", value: recommendations[0] },
          ] as AIPanelContent["answer"])
          : []),
      ],
      citations: ["PATTERN MODEL", "PIPELINE", "ACTIVITY", "RISK"],
      actions: [
        { title: "Review pipeline", subtitle: "Open the deals view", href: "/deals" },
        { title: "Triage at-risk deals", subtitle: "Urgent · Important · Safe", href: "/risk-overview" },
        { title: "Ask a follow-up", subtitle: "Continue the thread", href: "/insights" },
      ],
      answeredAt,
      sourceCount: 4,
    };
  }

  const top = [...deals]
    .filter((d) => !isClosedStage(d.stage))
    .sort((a, b) => b.value - a.value)[0];
  if (top) {
    const idle = daysIdle(top);
    return {
      subject: top.name,
      question: `How is ${top.name} trending right now?`,
      answer: [
        { kind: "text", value: `${top.name} sits at ` },
        { kind: "italic", value: formatStageLabel(top.stage).toLowerCase() },
        { kind: "text", value: ` worth ${formatCurrencyShort(top.value)}. ` },
        {
          kind: "text",
          value:
            idle <= 3
              ? "Activity is fresh - last touch in the past 72 hours. "
              : `Last activity was ${idle} days ago. `,
        },
        { kind: "text", value: "Risk level is " },
        { kind: "mark", value: normalizeRiskLevel(top).toUpperCase() },
        { kind: "text", value: ". Keep momentum on the next step." },
      ],
      citations: ["DEAL", "TIMELINE", "RISK MODEL", "ACTIVITY"],
      actions: [
        {
          title: "Open the deal",
          subtitle: `${formatStageLabel(top.stage)} · ${formatCurrencyShort(top.value)}`,
          href: `/deals/${top.id}`,
        },
        { title: "Open the pipeline", subtitle: "All active deals", href: "/deals" },
        { title: "Ask a follow-up", subtitle: "Continue the thread", href: "/insights" },
      ],
      answeredAt,
      sourceCount: 4,
    };
  }

  return {
    subject: "Sentinel",
    question: "What can Sentinel help with?",
    answer: [
      { kind: "text", value: "Once you " },
      { kind: "italic", value: "connect a CRM" },
      {
        kind: "text",
        value:
          " or add a deal, this panel surfaces the highest-priority signal of the morning - the one deal you should look at first.",
      },
    ],
    citations: ["DOCS"],
    actions: [
      {
        title: "Connect a CRM",
        subtitle: "HubSpot · Salesforce",
        href: "/settings?tab=integrations",
      },
      { title: "Add a deal manually", subtitle: "Two-minute setup", href: "/deals/new" },
      { title: "Read the docs", subtitle: "How Sentinel works", href: "/docs" },
    ],
    answeredAt,
    sourceCount: 1,
  };
}

function toDealsForPrediction(deals: SentinelDeal[]): DealForPrediction[] {
  return deals.map((d) => ({
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    createdAt: new Date(d.createdAt),
    lastActivityAt: new Date(d.lastActivityAt ?? d.createdAt),
    riskScore: d.riskScore,
    riskLevel: d.riskLevel ?? undefined,
    status: d.status ?? undefined,
  }));
}

export function deriveAtRisk(deals: SentinelDeal[]): {
  totalValue: number;
  flaggedNames: string[];
  flaggedCount: number;
} {
  const flagged = deals
    .filter((d) => !isClosedStage(d.stage))
    .filter((d) => normalizeRiskLevel(d) !== "low" || daysIdle(d) >= 7);
  return {
    totalValue: flagged.reduce((s, d) => s + d.value, 0),
    flaggedNames: flagged
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((d) => d.name.toUpperCase()),
    flaggedCount: flagged.length,
  };
}

export function deriveForecastConfidence(
  expected: number,
  bestCase: number,
  worstCase: number
): number {
  if (bestCase <= 0 || expected <= 0) return 0;
  const spread = bestCase - worstCase;
  if (spread <= 0) return 95;
  const tightness = 1 - spread / bestCase;
  return Math.max(40, Math.min(95, Math.round(40 + tightness * 60)));
}

export function deriveCountedActive(deals: SentinelDeal[]): {
  active: number;
  closedWon: number;
  closedLost: number;
  avgIdle: number;
  newPerWeek: number;
} {
  const active = deals.filter((d) => !isClosedStage(d.stage));
  const closedWon = deals.filter((d) => isClosedWonStage(d.stage)).length;
  const closedLost = deals.filter((d) => {
    const norm = d.stage.toLowerCase().replace(/\s+/g, "_");
    return norm === CLOSED_LOST;
  }).length;

  const idle =
    active.length > 0
      ? Math.round(
        active.reduce((s, d) => s + daysIdle(d), 0) / active.length
      )
      : 0;
  const lastWeek = deals.filter(
    (d) =>
      differenceInDays(new Date(), new Date(d.createdAt)) <= 7
  ).length;

  return {
    active: active.length,
    closedWon,
    closedLost,
    avgIdle: idle,
    newPerWeek: lastWeek,
  };
}
