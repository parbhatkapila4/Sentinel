import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import {
  getAISessionSummaries,
  getRecentUserQuestions,
} from "@/app/actions/chats";
import { logError } from "@/lib/logger";
import { calculatePipelineMetrics, getStageDistribution } from "@/lib/analytics";
import {
  forecastPipelineValue,
  type DealForPrediction,
} from "@/lib/predictions";
import { formatShortMoney } from "@/lib/format-money";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { InsightsPageTrack } from "@/components/insights-page-track";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { AIView } from "@/components/sentinel/daylight/ai/AIView";
import { AIWorkspaceProvider } from "@/components/sentinel/daylight/ai/AIWorkspaceProvider";
import { SidebarThreads } from "@/components/sentinel/daylight/ai/threads";
import {
  categoryLabel,
  threadWhen,
  type AIPrompt,
  type AISource,
} from "@/components/sentinel/daylight/ai/model";
import { isOpen } from "@/components/sentinel/daylight/book";
import { closedKind } from "@/components/sentinel/daylight/deals/model";
import {
  categorizeSession,
  countSessionsToday,
} from "@/components/sentinel/ai/derive";
import type { AIRecentAnswer, AISession } from "@/components/sentinel/ai/types";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "Why is my top at-risk deal slipping?",
  "Draft a re-engagement email for my oldest open deal",
  "Compare this quarter to last quarter",
  "Who are my best champions, by deal value?",
  "Summarize all activity in the last 24 hours",
  "What signals did I miss this week?",
];

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
    (sum, [stage, count]) => sum + (closedKind(stage) === "won" ? count : 0),
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

  const open = dealsRaw.filter((d) => isOpen(d));
  const openValue = open.reduce((sum, d) => sum + d.value, 0);
  const won = dealsRaw.filter((d) => closedKind(d.stage) === "won").length;
  const lost = dealsRaw.filter((d) => closedKind(d.stage) === "lost").length;
  const atRiskCount = shellContext.alertCount;

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
  const { expected } = forecastPipelineValue(dealsForPrediction);

  const sessions: AISession[] = sessionSummaries.map((s) => ({
    id: s.id,
    title: s.title.trim() || "New thread",
    updatedAt: s.updatedAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    messageCount: s.messageCount,
    category: categorizeSession(s.firstUserMessage ?? s.title),
  }));

  const prompts: AIPrompt[] = [
    {
      key: "priority",
      title: "Deal",
      emphasis: "prioritization",
      sub: "Which deals deserve your attention this week, ranked by urgency, value and win chance.",
      tag: atRiskCount > 0 ? `${atRiskCount} at risk` : "Pipeline steady",
      prompt:
        "Which deals should I prioritize this week? Rank them by urgency, deal value, and win probability, and explain why.",
    },
    {
      key: "revenue",
      title: "Revenue",
      emphasis: "optimization",
      sub: "Where to push to lift close rate, deal size and speed across the book.",
      tag: hasAnyDeals ? `${formatShortMoney(openValue)} open` : "No pipeline yet",
      prompt:
        "Where should I push to maximize close rate, deal size, and velocity across my book right now?",
    },
    {
      key: "patterns",
      title: "Win and loss",
      emphasis: "patterns",
      sub: "What your won deals share, and what sank the lost ones.",
      tag: won + lost > 0 ? `${won} won · ${lost} lost` : "No closed deals yet",
      prompt:
        "Analyze my win/loss patterns this quarter. What do my closed-won deals share, and what killed the closed-lost ones?",
    },
    {
      key: "velocity",
      title: "Sales",
      emphasis: "velocity",
      sub: "Where deals stick, which stages are slow, and what would shorten the cycle.",
      tag: hasAnyDeals
        ? `${open.length} open ${open.length === 1 ? "deal" : "deals"}`
        : "No activity yet",
      prompt:
        "Where are deals sticking in my pipeline, which stages are slow, and what should I change to compress the cycle?",
    },
  ];

  const recentAnswers: AIRecentAnswer[] = recentQuestions.map((q) => {
    const snippet =
      q.content.length > 90 ? `${q.content.slice(0, 87).trim()}…` : q.content;
    const category = categoryLabel(categorizeSession(q.chatTitle ?? q.content));
    return {
      id: q.id,
      question: snippet,
      when: `${threadWhen(q.createdAt.toISOString(), now)} · ${category}`,
      meta: "",
      chatId: q.chatId,
    };
  });

  const sources = buildSources(integrationStatuses);

  return (
    <AIWorkspaceProvider
      sessions={sessions}
      recentAnswers={recentAnswers}
      todayChatCount={countSessionsToday(sessions)}
      connectedSourceCount={sources.filter((s) => s.connected).length}
      nowISO={now.toISOString()}
    >
      <DaylightShell
        title="Sentinel AI"
        dateLabel={format(now, "EEEE, MMMM d")}
        syncTime={shellContext.syncTime}
        sourceLabels={shellContext.sourceLabels}
        alertCount={shellContext.alertCount}
        onboarding={shellContext.onboarding}
        pageNav={<SidebarThreads />}
      >
        <InsightsPageTrack />
        <AIView
          prompts={prompts}
          suggestions={SUGGESTIONS}
          book={{
            activeDeals: open.length,
            openValue,
            flagged: atRiskCount,
            overdue: open.filter((d) => d.isActionOverdue).length,
            likely: expected,
          }}
          sources={sources}
        />
      </DaylightShell>
    </AIWorkspaceProvider>
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

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildSources(
  s: Awaited<ReturnType<typeof getAllIntegrationStatuses>> | null
): AISource[] {
  return [
    {
      key: "hubspot",
      name: "HubSpot",
      monogram: "HS",
      kind: "CRM",
      connected: Boolean(s?.hubspot.connected),
      syncedAt: iso(s?.hubspot.lastSyncAt),
    },
    {
      key: "salesforce",
      name: "Salesforce",
      monogram: "SF",
      kind: "CRM",
      connected: Boolean(s?.salesforce.connected),
      syncedAt: iso(s?.salesforce.lastSyncAt),
    },
    {
      key: "calendar",
      name: "Google Calendar",
      monogram: "GC",
      kind: "Calendar",
      connected: Boolean(s?.googleCalendar.connected),
      syncedAt: iso(s?.googleCalendar.lastSyncAt),
    },
    {
      key: "gmail",
      name: "Gmail",
      monogram: "GM",
      kind: "Email",
      connected: Boolean(s?.gmail.connected),
      syncedAt: iso(s?.gmail.lastSyncAt),
    },
    {
      key: "slack",
      name: "Slack",
      monogram: "SL",
      kind: "Messages",
      connected: Boolean(s?.slack.connected),
      syncedAt: null,
    },
  ];
}
