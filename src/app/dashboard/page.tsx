import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getAllDeals, getDealCountsByCountry } from "@/app/actions/deals";
import {
  getUpcomingMeetings,
  getGoogleCalendarStatus,
} from "@/app/actions/google-calendar";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { getAuthenticatedUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import {
  calculatePipelineMetrics,
  calculateRevenueGrowth,
  calculateChartData,
  calculateRevenueBySource,
  getStageDistribution,
  calculateDealActivity,
} from "@/lib/analytics";
import {
  forecastPipelineValue,
  detectAnomalies,
  identifyDealPatterns,
  type DealForPrediction,
} from "@/lib/predictions";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { Hero } from "@/components/sentinel/hero/Hero";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { KPIBand } from "@/components/sentinel/sections/KPIBand";
import { AIPanel } from "@/components/sentinel/sections/AIPanel";
import { PerformanceGrid } from "@/components/sentinel/performance/PerformanceGrid";
import { InsightsGrid } from "@/components/sentinel/insights/InsightsGrid";
import { DeskGrid } from "@/components/sentinel/desk/DeskGrid";
import { Colophon } from "@/components/sentinel/Colophon";

import {
  buildShortList,
  buildBriefingItems,
  deriveLeadHeadline,
  deriveAIPanel,
  deriveAtRisk,
  deriveCountedActive,
  deriveForecastConfidence,
} from "@/components/sentinel/derive";

export const dynamic = "force-dynamic";

const isClosedStage = (s: string) => {
  const norm = s.toLowerCase().replace(/\s+/g, "_");
  return norm === "closed_won" || norm === "closed_lost";
};

const isClosedWonStage = (s: string) => {
  const norm = s.toLowerCase().replace(/\s+/g, "_");
  return norm === "closed_won" || norm === "closed";
};

function formatShortMoney(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} billion`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} million`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

export default async function DashboardPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/dashboard");
  }

  const [
    dealsResult,
    integrationStatusesResult,
    meetingsResult,
    calStatusResult,
    countryCountsResult,
  ] = await Promise.allSettled([
    getAllDeals(),
    getAllIntegrationStatuses(),
    getUpcomingMeetings(),
    getGoogleCalendarStatus(),
    getDealCountsByCountry(),
  ]);

  const settled = <T,>(
    label: string,
    result: PromiseSettledResult<T>,
    fallback: T
  ): T => {
    if (result.status === "fulfilled") return result.value;
    logError(`dashboard fetch failed: ${label}`, result.reason, { label });
    return fallback;
  };

  const dealsRaw = settled<Awaited<ReturnType<typeof getAllDeals>>>(
    "deals",
    dealsResult,
    []
  );
  const dbUnavailable = dealsResult.status === "rejected";
  const integrationStatuses = settled<Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null>("integrationStatuses", integrationStatusesResult, null);
  const meetingsRaw = settled<Awaited<ReturnType<typeof getUpcomingMeetings>>>(
    "upcomingMeetings",
    meetingsResult,
    []
  );
  const calStatus = settled<Awaited<ReturnType<typeof getGoogleCalendarStatus>>>(
    "googleCalendarStatus",
    calStatusResult,
    { connected: false } as Awaited<ReturnType<typeof getGoogleCalendarStatus>>
  );
  const calendarConnected = calStatus.connected;
  const countryCounts = settled<Array<{ country: string; count: number }>>(
    "dealCountsByCountry",
    countryCountsResult,
    []
  );

  const realDealsRaw = dealsRaw.filter((d) => !d.isDemo);
  const dealsForDeskRaw = realDealsRaw.length > 0 ? realDealsRaw : dealsRaw;
  const isDemoMode =
    dealsForDeskRaw.length > 0 && dealsForDeskRaw.every((d) => d.isDemo);
  const hasAnyDeals = dealsForDeskRaw.length > 0;

  const deals = mapRawDealsToSentinel(dealsForDeskRaw);

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

  const { totalValue, totalDeals } = calculatePipelineMetrics(dealsForDeskRaw);
  const { growthPercent: revenueGrowthPercent } =
    calculateRevenueGrowth(dealsForDeskRaw);
  const { data: chartData, avgGrowthRate } = calculateChartData(dealsForDeskRaw);
  const revenueSources = calculateRevenueBySource(dealsForDeskRaw);
  const stageDist = getStageDistribution(dealsForDeskRaw);
  const { avgDealAge } = calculateDealActivity(dealsForDeskRaw);

  const closedWonCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedWonStage(stage) ? count : 0),
    0
  );
  const winRate =
    totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0;

  const counts = deriveCountedActive(deals);
  const pipelineForecast = forecastPipelineValue(dealsForPrediction);
  const { anomalies } = detectAnomalies(dealsForPrediction);
  const { insights, recommendations } = identifyDealPatterns(dealsForPrediction);

  const atRisk = deriveAtRisk(deals);
  const shortList = buildShortList(deals);
  const briefing = buildBriefingItems(deals);
  const headline = deriveLeadHeadline(deals, hasAnyDeals);
  const aiPanel = deriveAIPanel(deals);

  const now = new Date();
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent: totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const last30 = chartData.slice(-30);
  const velocityCurrent = last30.map((p) =>
    typeof p.actual === "number" ? p.actual : 0
  );
  const velocityPrior = last30.map((p) =>
    typeof p.lastMonth === "number" ? p.lastMonth : 0
  );
  const velocityLabels = last30.map((p) => p.month);
  const lastWonIdx = (() => {
    if (velocityCurrent.length === 0) return null;
    let bestIdx = -1;
    let best = -Infinity;
    velocityCurrent.forEach((v, i) => {
      if (v > best) {
        best = v;
        bestIdx = i;
      }
    });
    return bestIdx >= 0 ? bestIdx : null;
  })();
  const marker =
    lastWonIdx !== null && velocityCurrent[lastWonIdx] > 0
      ? {
        index: lastWonIdx,
        label: "PEAK",
        value: formatShortMoney(velocityCurrent[lastWonIdx]),
      }
      : null;

  const totalChannelValue = revenueSources.reduce((s, r) => s + r.value, 0);
  const sumOrOne = totalChannelValue || 1;
  const revenueBars = revenueSources.map((r) => ({
    label: r.source.toUpperCase(),
    value: r.value,
    share: r.value / sumOrOne,
  }));

  const months = pipelineForecast.monthly.slice(0, 6).map((m) => m.month);
  const expectedSeries = pipelineForecast.monthly
    .slice(0, 6)
    .map((m) => m.value);
  const bestSeries = pipelineForecast.monthly
    .slice(0, 6)
    .map((m) => m.bestCase ?? m.value * 1.18);
  const worstSeries = pipelineForecast.monthly
    .slice(0, 6)
    .map((m) => m.worstCase ?? m.value * 0.78);

  const weightedConfidence = deriveForecastConfidence(
    pipelineForecast.expected,
    pipelineForecast.bestCase,
    pipelineForecast.worstCase
  );

  const topActive = [...deals]
    .filter((d) => !isClosedStage(d.stage))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      name: d.name,
      segment:
        d.value >= 500_000 ? "Enterprise" : d.value >= 100_000 ? "Mid-market" : "Startup",
      stage: d.stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: d.value,
    }));

  const dealNameById = new Map(deals.map((d) => [d.id, d.name]));
  const meetings = meetingsRaw.map((m) => ({
    id: m.id,
    title: m.title,
    startTime: m.startTime,
    endTime: m.endTime,
    location: m.location ?? null,
    meetingLink: m.meetingLink ?? null,
    attendees: m.attendees ?? [],
    associatedDealName: m.dealId ? dealNameById.get(m.dealId) ?? null : null,
  }));

  const syncTime = shellContext.syncTime;
  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const weatherLine = `WEATHER ${anomalies.length > 0 ? "OVERCAST" : "CLEAR"
    } · WIND ${counts.newPerWeek}/W`;

  const sparkActual = chartData.slice(-30).map((p) =>
    typeof p.actual === "number" ? p.actual : 0
  );
  const kpiBand = {
    hero: {
      label: "PIPELINE WEIGHTED",
      display: formatShortMoney(totalValue),
      italicWord: formatShortMoney(totalValue),
      delta: {
        value: `${revenueGrowthPercent >= 0 ? "+" : ""}${revenueGrowthPercent.toFixed(1)}% vs last month`,
        positive: revenueGrowthPercent >= 0,
      },
      meta: `${counts.active} ACTIVE · ${counts.closedWon} CLOSED · ${counts.closedLost} LOST`,
      spark: sparkActual,
    },
    cards: [
      {
        label: "AT RISK",
        display: formatShortMoney(atRisk.totalValue),
        delta: atRisk.flaggedCount
          ? {
            value: `${atRisk.flaggedCount} FLAGGED`,
            positive: false,
          }
          : undefined,
        meta:
          atRisk.flaggedNames.length > 0
            ? atRisk.flaggedNames.join(" · ")
            : "NO FLAGS",
      },
      {
        label: "WIN RATE",
        display: `${winRate.toFixed(1)}%`,
        delta:
          avgGrowthRate >= 0
            ? { value: `+${avgGrowthRate.toFixed(1)}% trend`, positive: true }
            : { value: `${avgGrowthRate.toFixed(1)}% trend`, positive: false },
        meta: `${counts.avgIdle}D AVG IDLE`,
      },
      {
        label: "NEW · 7D",
        display: String(counts.newPerWeek),
        delta: undefined,
        meta: `${counts.active} ACTIVE TOTAL`,
      },
    ],
  };

  const forecastBlock = {
    expected: pipelineForecast.expected,
    bestCase: pipelineForecast.bestCase,
    worstCase: pipelineForecast.worstCase,
    weightedConfidence,
    notes: [
      `${counts.active} OPEN`,
      `${avgDealAge}D AVG AGE`,
    ],
  };

  const firstDealMs = deals.reduce<number | null>((earliest, d) => {
    const t = new Date(d.createdAt).getTime();
    if (!Number.isFinite(t)) return earliest;
    return earliest === null || t < earliest ? t : earliest;
  }, null);
  const issueNumber =
    firstDealMs === null
      ? 1
      : Math.max(
        1,
        Math.floor((now.getTime() - firstDealMs) / 86_400_000) + 1
      );

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      {dbUnavailable && (
        <div
          role="alert"
          className="mt-4 mx-6 sm:mx-10 lg:mx-14"
          style={{
            padding: "12px 16px",
            border: "1px solid var(--copper)",
            borderLeft: "3px solid var(--copper)",
            background: "rgba(217,153,90,0.06)",
            color: "var(--cream-2)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          DESK OFFLINE · DATABASE UNREACHABLE - RETRY SHORTLY
        </div>
      )}

      <Hero
        issueNumber={issueNumber}
        dateLine={dateLine}
        weatherLine={weatherLine}
        metaLines={[
          `EDITION · ${syncTime}`,
          `WIN RATE · ${winRate.toFixed(1)}%`,
          `SOURCES · ${shellContext.sourceLabels.join(" · ")}`,
        ]}
        kicker={
          headline.variant === "slipping"
            ? "DESK BULLETIN - RISK"
            : headline.variant === "winning"
              ? "DESK BULLETIN - WINS"
              : headline.variant === "onboarding"
                ? "DESK BULLETIN - SETUP"
                : "DESK BULLETIN"
        }
        headline={headline}
        briefingItems={briefing.items}
      />

      <SectionRule
        number="01"
        label="THE BOOK"
        meta={`${counts.active} OPEN · ${counts.closedWon} WON · ${counts.closedLost} LOST`}
      />
      <KPIBand data={kpiBand} />

      <AIPanel content={aiPanel} />

      <SectionRule
        number="02"
        label="PERFORMANCE"
        meta={`AVG ${avgDealAge}D · ${revenueGrowthPercent >= 0 ? "↑" : "↓"} ${Math.abs(revenueGrowthPercent).toFixed(1)}%`}
      />
      <PerformanceGrid
        velocity={{
          current: velocityCurrent,
          prior: velocityPrior,
          labels: velocityLabels,
          marker,
        }}
        shortList={shortList}
        revenueBars={revenueBars}
        forecast={forecastBlock}
      />

      <SectionRule
        number="03"
        label="PIPELINE & INSIGHTS"
        meta={`${anomalies.length} ANOMALIES · ${insights.length} PATTERNS`}
      />
      <InsightsGrid
        scenarios={{
          months,
          best: bestSeries,
          expected: expectedSeries,
          worst: worstSeries,
        }}
        anomalies={anomalies.map((a) => ({
          severity: a.severity,
          dealName: a.deal.name,
          reason: a.reason,
        }))}
        patterns={insights.map((i) => ({
          type: i.type,
          description: i.description,
          impact: (i.impact ?? "neutral") as "positive" | "negative" | "neutral",
        }))}
        recommendations={recommendations}
      />

      <SectionRule
        number="04"
        label="THE DESK"
        meta={`${topActive.length} TOP · ${countryCounts.length} REGIONS · ${meetings.length} MEETINGS`}
      />
      <DeskGrid
        topDeals={topActive}
        countryPins={countryCounts}
        meetings={meetings}
        calendarConnected={calendarConnected}
      />

      <Colophon systemStatus={dbUnavailable ? "degraded" : "operational"} />
    </SentinelShell>
  );
}
