import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow, isToday } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import {
  getAISessionSummaries,
  getRecentUserQuestions,
} from "@/app/actions/chats";
import { logError } from "@/lib/logger";
import {
  calculatePipelineMetrics,
  calculateDealActivity,
  getStageDistribution,
} from "@/lib/analytics";
import {
  detectAnomalies,
  type DealForPrediction,
} from "@/lib/predictions";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { InsightsPageTrack } from "@/components/insights-page-track";

import { AIWorkspace } from "@/components/sentinel/ai/AIWorkspace";
import {
  categorizeSession,
  countSessionsToday,
  formatShortMoney,
} from "@/components/sentinel/ai/derive";
import type {
  AIBookFact,
  AIConnectedSource,
  AIPromptCard,
  AIRecentAnswer,
  AISession,
} from "@/components/sentinel/ai/types";

export const dynamic = "force-dynamic";

const normalizeStage = (s: string) => s.toLowerCase().replace(/\s+/g, "_");

const isClosedWon = (s: string) => {
  const n = normalizeStage(s);
  return n === "closed_won" || n === "closed";
};

const isClosedLost = (s: string) => normalizeStage(s) === "closed_lost";

const isClosedStage = (s: string) =>
  isClosedWon(s) || isClosedLost(s);

export default async function InsightsPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/insights");
  }

  const [
    dealsRaw,
    integrationStatuses,
    sessionSummaries,
    recentQuestions,
  ] = await Promise.all([
    safeCall(() => getAllDeals(), [], "deals"),
    safeCall(() => getAllIntegrationStatuses(), null, "integrationStatuses"),
    safeCall(() => getAISessionSummaries(), [], "aiSessionSummaries"),
    safeCall(() => getRecentUserQuestions(3), [], "recentUserQuestions"),
  ]);

  const hasAnyDeals = dealsRaw.length > 0;
  const isDemoMode = hasAnyDeals && dealsRaw.every((d) => d.isDemo);
  const deals = mapRawDealsToSentinel(dealsRaw);

  const { totalDeals } = calculatePipelineMetrics(dealsRaw);
  const stageDist = getStageDistribution(dealsRaw);
  const closedWonCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedWon(stage) ? count : 0),
    0
  );
  const coveragePercent =
    totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0;

  const now = new Date();
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const { totalValue } = calculatePipelineMetrics(dealsRaw);
  const active = deals.filter((d) => !isClosedStage(d.stage));
  const wonCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedWon(stage) ? count : 0),
    0
  );
  const lostCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedLost(stage) ? count : 0),
    0
  );

  const atRiskCount = shellContext.alertCount;
  const { avgDealAge } = calculateDealActivity(dealsRaw);

  const dealsForPrediction: DealForPrediction[] = deals.map((d) => ({
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
  const { anomalies } = detectAnomalies(dealsForPrediction);
  const signalCount = anomalies.length;

  const countrySet = new Set(
    deals.map((d) => d.country?.trim()).filter(Boolean) as string[]
  );

  const sessions: AISession[] = sessionSummaries.map((s) => ({
    id: s.id,
    title: s.title.trim() || "New thread",
    updatedAt: s.updatedAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    messageCount: s.messageCount,
    category: categorizeSession(s.firstUserMessage ?? s.title),
  }));

  const todayChatCount = countSessionsToday(sessions);

  const connectedSourceCount = sourcesConnectedCount(integrationStatuses);
  const promptCards: AIPromptCard[] = [
    {
      index: "01",
      title: "Deal",
      italicWord: "prioritization.",
      sub: "Which deals deserve your attention this week, ranked by urgency × value × win probability.",
      tag:
        atRiskCount > 0
          ? `${atRiskCount} ${atRiskCount === 1 ? "DEAL" : "DEALS"} FLAGGED`
          : "PIPELINE STEADY",
      tone: "copper",
      icon: "check",
      prompt:
        "Which deals should I prioritize this week? Rank them by urgency, deal value, and win probability, and explain why.",
    },
    {
      index: "02",
      title: "Revenue",
      italicWord: "optimization.",
      sub: "Where to push to maximize close rate, deal size, and velocity across the book.",
      tag: hasAnyDeals
        ? `${formatShortMoney(totalValue)} PIPELINE`
        : "NO PIPELINE YET",
      tone: "ivy",
      icon: "dollar",
      prompt:
        "Where should I push to maximize close rate, deal size, and velocity across my book right now?",
    },
    {
      index: "03",
      title: "Win & loss",
      italicWord: "patterns.",
      sub: "What do your closed-won deals share? What killed the closed-lost ones? Sentinel finds the threads.",
      tag:
        wonCount + lostCount > 0
          ? `${wonCount} WON · ${lostCount} LOST`
          : "AWAITING CLOSED DEALS",
      tone: "cream",
      icon: "chart",
      prompt:
        "Analyze my win/loss patterns this quarter. What do my closed-won deals share, and what killed the closed-lost ones?",
    },
    {
      index: "04",
      title: "Sales",
      italicWord: "velocity.",
      sub: "Where deals are sticking, which stages are slow, and what to change to compress the cycle.",
      tag: hasAnyDeals
        ? `AVG ${avgDealAge}D / DEAL`
        : "NO ACTIVITY YET",
      tone: "signal",
      icon: "bolt",
      prompt:
        "Where are deals sticking in my pipeline, which stages are slow, and what should I change to compress the cycle?",
    },
  ];

  const suggestedPrompts: string[] = [
    "Why is my top at-risk deal slipping?",
    "Draft a re-engagement email for my oldest open deal",
    "Compare this quarter to last quarter",
    "Who are my best champions, by deal value?",
    "Summarize all activity in the last 24 hours",
    "What signals did I miss this week?",
  ];

  const bookFacts: AIBookFact[] = hasAnyDeals
    ? [
      {
        label: "active deals",
        highlight: `${active.length} active ${active.length === 1 ? "deal" : "deals"}`,
        rest:
          countrySet.size > 0
            ? `across ${countrySet.size} ${countrySet.size === 1 ? "country" : "countries"}`
            : "in your book",
      },
      {
        label: "pipeline value",
        highlight: `${formatShortMoney(totalValue)} pipeline value`,
        rest: "weighted by stage",
      },
      {
        label: "at-risk",
        highlight: `${atRiskCount} ${atRiskCount === 1 ? "deal" : "deals"} flagged`,
        rest: atRiskCount > 0 ? "as at-risk this morning" : "- book is healthy",
      },
      {
        label: "signals",
        highlight: `${signalCount} ${signalCount === 1 ? "signal" : "signals"}`,
        rest:
          signalCount > 0
            ? "detected in the last 24 hours"
            : "- no anomalies detected today",
      },
    ]
    : [];

  const sources: AIConnectedSource[] = buildSources(
    integrationStatuses,
    dealsRaw.length,
    active.length
  );

  const recentAnswers: AIRecentAnswer[] = recentQuestions.map((q) => {
    const when = isToday(q.createdAt)
      ? format(q.createdAt, "HH:mm").toUpperCase()
      : formatDistanceToNow(q.createdAt, { addSuffix: true }).toUpperCase();
    const snippet =
      q.content.length > 90 ? `${q.content.slice(0, 87).trim()}…` : q.content;
    return {
      id: q.id,
      question: snippet,
      when,
      meta: "",
    };
  });

  const modelLabel = "SENTINEL · MULTI-MODEL";
  const ctxLabel = `${active.length} DEALS · ${signalCount} SIGNALS`;

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
      fullHeight
    >
      <InsightsPageTrack />
      <div className="flex flex-col h-full min-h-0">
        <AIWorkspace
          sessions={sessions}
          promptCards={promptCards}
          suggestedPrompts={suggestedPrompts}
          bookFacts={bookFacts}
          sources={sources}
          recentAnswers={recentAnswers}
          modelLabel={modelLabel}
          ctxLabel={ctxLabel}
          syncTime={shellContext.syncTime}
          todayChatCount={todayChatCount}
          nowISO={now.toISOString()}
        />
      </div>
    </SentinelShell>
  );
}

async function safeCall<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    logError(`insights fetch failed: ${label}`, err, { label });
    return fallback;
  }
}

function sourcesConnectedCount(
  s: Awaited<ReturnType<typeof getAllIntegrationStatuses>> | null
): number {
  if (!s) return 0;
  let n = 0;
  if (s.salesforce.connected) n += 1;
  if (s.hubspot.connected) n += 1;
  if (s.googleCalendar.connected) n += 1;
  const slack = s.slack as
    | { connected?: boolean; workspaces?: unknown[] }
    | unknown[]
    | undefined;
  const slackConnected = Array.isArray(slack)
    ? slack.length > 0
    : Boolean(slack?.connected) ||
    (Array.isArray(slack?.workspaces) && slack!.workspaces!.length > 0);
  if (slackConnected) n += 1;
  return n;
}

function buildSources(
  s: Awaited<ReturnType<typeof getAllIntegrationStatuses>> | null,
  totalDealCount: number,
  activeCount: number
): AIConnectedSource[] {
  const crmMeta = `CRM · ${totalDealCount} ${totalDealCount === 1 ? "DEAL" : "DEALS"}`;

  const list: AIConnectedSource[] = [];

  if (s) {
    list.push({
      name: "HubSpot",
      kind: "CRM",
      metaLine: s.hubspot.connected
        ? `${crmMeta} · ${s.hubspot.totalSynced} SYNCED`
        : "NOT CONNECTED",
      connected: s.hubspot.connected,
    });

    list.push({
      name: "Salesforce",
      kind: "CRM",
      metaLine: s.salesforce.connected
        ? `${crmMeta} · ${s.salesforce.totalSynced} SYNCED`
        : "NOT CONNECTED",
      connected: s.salesforce.connected,
    });

    list.push({
      name: "Google Calendar",
      kind: "CALENDAR",
      metaLine: s.googleCalendar.connected
        ? `CALENDAR · ${activeCount} ACTIVE`
        : "NOT CONNECTED",
      connected: s.googleCalendar.connected,
    });

    const slack = s.slack as
      | {
        connected?: boolean;
        workspaces?: unknown[];
      }
      | unknown[]
      | undefined;
    const slackConnected = Array.isArray(slack)
      ? slack.length > 0
      : Boolean(slack?.connected) ||
      (Array.isArray(slack?.workspaces) && slack!.workspaces!.length > 0);
    list.push({
      name: "Slack",
      kind: "SLACK",
      metaLine: slackConnected ? "CONNECTED · LIVE" : "NOT CONNECTED",
      connected: slackConnected,
    });
  } else {
    list.push(
      { name: "HubSpot", kind: "CRM", metaLine: "NOT CONNECTED", connected: false },
      { name: "Salesforce", kind: "CRM", metaLine: "NOT CONNECTED", connected: false },
      { name: "Google Calendar", kind: "CALENDAR", metaLine: "NOT CONNECTED", connected: false },
      { name: "Slack", kind: "SLACK", metaLine: "NOT CONNECTED", connected: false }
    );
  }

  return list;
}
