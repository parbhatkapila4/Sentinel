import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format, differenceInDays } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_ORDER } from "@/lib/config";
import { formatRevenue } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";
import {
  calculatePipelineMetrics,
  calculateDealActivity,
  calculateRiskDistribution,
  getStageDistribution,
  getValueByStage,
} from "@/lib/analytics";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { Colophon } from "@/components/sentinel/Colophon";

import { DealsMasthead } from "@/components/sentinel/deals/DealsMasthead";
import { DealsKPIs } from "@/components/sentinel/deals/DealsKPIs";
import { Panel } from "@/components/sentinel/analytics/Panel";

import { ReportExportButton } from "@/components/sentinel/reports/ReportExportButton";
import { QuickReportsEditorial } from "@/components/sentinel/reports/QuickReportsEditorial";
import {
  PipelineByStageTable,
  type PipelineByStageRow,
} from "@/components/sentinel/reports/PipelineByStageTable";
import {
  DealRegistryTable,
  type DealRegistryRow,
} from "@/components/sentinel/reports/DealRegistryTable";
import { ActivityByDay } from "@/components/sentinel/reports/ActivityByDay";
import { AgeDistribution } from "@/components/sentinel/reports/AgeDistribution";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { formatShortMoney } from "@/lib/format-money";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

const STAGE_DISPLAY: Record<string, string> = {
  lead: "Lead",
  discover: "Discover",
  discovery: "Discover",
  qualify: "Qualify",
  qualified: "Qualified",
  qualification: "Qualify",
  proposal: "Proposal",
  negotiation: "Negotiation",
  negotiate: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

function prettyStage(s: string) {
  const k = s.toLowerCase().replace(/\s+/g, "_");
  return (
    STAGE_DISPLAY[k] ??
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default async function ReportsPage() {
  noStore();
  const now = new Date();

  let dealsRaw: RawDeal[] = [];
  let dataError = false;
  try {
    dealsRaw = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/reports");
    }
    dataError = true;
  }

  let integrationStatuses: Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null = null;
  try {
    integrationStatuses = await getAllIntegrationStatuses();
  } catch {
    integrationStatuses = null;
  }

  const { totalDeals, totalValue, avgDealValue } =
    calculatePipelineMetrics(dealsRaw);
  const {
    recentDeals,
    thirtyDayDeals,
    recentDealsValue,
    thirtyDayValue,
    avgDealAge,
    avgDaysSinceActivity,
  } = calculateDealActivity(dealsRaw);
  const riskDist = calculateRiskDistribution(dealsRaw);
  const stageDistribution = getStageDistribution(dealsRaw);
  const valueByStage = getValueByStage(dealsRaw);

  const avgValueByStage: Record<string, number> = {};
  for (const stage of Object.keys(stageDistribution)) {
    const count = stageDistribution[stage] ?? 0;
    const value = valueByStage[stage] ?? 0;
    avgValueByStage[stage] = count > 0 ? value / count : 0;
  }

  const activeDeals = dealsRaw.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  );
  const atRiskDeals = dealsRaw.filter((d) => d.status === "at_risk");
  const dealsWithActions = dealsRaw.filter(
    (d) => d.recommendedAction != null
  );
  const overdueDeals = dealsRaw.filter((d) => d.isActionOverdue === true);

  const avgRiskScore =
    totalDeals > 0
      ? dealsRaw.reduce((sum, d) => sum + d.riskScore, 0) / totalDeals
      : 0;

  const topDeals = [...dealsRaw].sort((a, b) => b.value - a.value).slice(0, 5);
  const topDealsValue = topDeals.reduce((sum, d) => sum + d.value, 0);
  const topDealsPercentage =
    totalValue > 0 ? (topDealsValue / totalValue) * 100 : 0;

  const sortedStages = Object.keys(stageDistribution).sort((a, b) => {
    const orderA = STAGE_ORDER[a.toLowerCase()] ?? 99;
    const orderB = STAGE_ORDER[b.toLowerCase()] ?? 99;
    return orderA - orderB;
  });

  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < sortedStages.length - 1; i++) {
    const currentStage = sortedStages[i];
    const nextStage = sortedStages[i + 1];
    const nextCount = stageDistribution[nextStage] ?? 0;
    const totalAfterCurrent = dealsRaw.filter(
      (d) =>
        (STAGE_ORDER[d.stage.toLowerCase()] ?? 99) >=
        (STAGE_ORDER[currentStage.toLowerCase()] ?? 99)
    ).length;
    conversionRates[currentStage] =
      totalAfterCurrent > 0 ? (nextCount / totalAfterCurrent) * 100 : 0;
  }

  const { low: lowRisk, medium: mediumRisk, high: highRisk } = riskDist;

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const dealsThisWeek = dealsRaw.filter(
    (d) => new Date(d.createdAt) >= weekAgo
  );
  const valueThisWeek = dealsThisWeek.reduce((s, d) => s + d.value, 0);
  const wonThisWeek = dealsThisWeek.filter(
    (d) => d.stage === "closed_won"
  ).length;

  const funnelSteps = [
    { from: "lead", to: "qualified", label: "Lead → Qualified" },
    { from: "qualified", to: "proposal", label: "Qualified → Proposal" },
    { from: "proposal", to: "negotiation", label: "Proposal → Negotiation" },
    { from: "negotiation", to: "closed_won", label: "Negotiation → Won" },
  ].map(({ from, to, label }) => {
    const fromCount = dealsRaw.filter(
      (d) =>
        d.stage === from ||
        d.stage === to ||
        d.stage === "closed_won" ||
        d.stage === "closed_lost"
    ).length;
    const toCount = dealsRaw.filter(
      (d) => d.stage === to || d.stage === "closed_won"
    ).length;
    const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
    return { label, rate };
  });

  const highestDeal =
    dealsRaw.length > 0
      ? dealsRaw.reduce(
        (max, d) => (d.value > max.value ? d : max),
        dealsRaw[0]
      )
      : null;

  const activityItems = DAY_LABELS.map((label, idx) => {
    const dayNumber = idx === 6 ? 0 : idx + 1;
    const count = dealsRaw.filter(
      (d) => new Date(d.createdAt).getDay() === dayNumber
    ).length;
    return { label, count };
  });

  const ageBuckets = [
    { label: "< 7 days", min: 0, max: 7, maxDays: 7 },
    { label: "7–14 days", min: 7, max: 14, maxDays: 14 },
    { label: "14–30 days", min: 14, max: 30, maxDays: 30 },
    { label: "30–60 days", min: 30, max: 60, maxDays: 60 },
    { label: "60+ days", min: 60, max: Infinity, maxDays: Infinity },
  ].map((b) => ({
    label: b.label,
    maxDays: b.maxDays,
    count: dealsRaw.filter((d) => {
      const age = differenceInDays(now, new Date(d.createdAt));
      return age >= b.min && age < b.max;
    }).length,
  }));

  const pipelineRows: PipelineByStageRow[] = sortedStages.map((stage) => {
    const count = stageDistribution[stage] || 0;
    const value = valueByStage[stage] || 0;
    const avgValue = avgValueByStage[stage] || 0;
    const conv = conversionRates[stage];
    return {
      stage,
      label: prettyStage(stage),
      count,
      value,
      valueDisplay: formatRevenue(value),
      avgValueDisplay: formatRevenue(avgValue),
      pctOfTotal: totalValue > 0 ? (value / totalValue) * 100 : 0,
      conversionPct: typeof conv === "number" ? conv : null,
    };
  });

  const pipelineTotals = {
    count: totalDeals,
    valueDisplay: formatRevenue(totalValue),
    avgValueDisplay: formatRevenue(avgDealValue),
  };

  const registryRows: DealRegistryRow[] = dealsRaw.map((d) => ({
    id: d.id,
    name: d.name,
    stage: d.stage,
    stageLabel: prettyStage(d.stage),
    valueDisplay: formatRevenue(d.value),
    riskLevel: formatRiskLevel(d.riskScore) as DealRegistryRow["riskLevel"],
    status:
      d.status === "at_risk"
        ? "at_risk"
        : d.status === "closed"
          ? "closed"
          : "active",
    nextAction: d.recommendedAction?.label ?? null,
  }));

  const wonDeals = dealsRaw.filter((d) => d.stage === "closed_won");
  const pipelineStageCounts = activeDeals.reduce(
    (acc, d) => {
      acc[d.stage] = (acc[d.stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const quickReportsSummary = {
    pipeline: {
      activeCount: activeDeals.length,
      totalValue: activeDeals.reduce((s, d) => s + d.value, 0),
      stageCounts: pipelineStageCounts,
    },
    won: {
      count: wonDeals.length,
      totalValue: wonDeals.reduce((s, d) => s + d.value, 0),
    },
    atRisk: {
      count: atRiskDeals.length,
      totalValue: atRiskDeals.reduce((s, d) => s + d.value, 0),
    },
  };

  const isDemoMode =
    dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const hasAnyDeals = dealsRaw.length > 0;
  const closedWonAll = dealsRaw.filter(
    (d) => d.stage.toLowerCase().replace(/\s+/g, "_") === "closed_won"
  ).length;
  const coveragePercent =
    dealsRaw.length > 0 ? (closedWonAll / dealsRaw.length) * 100 : 0;

  const deals = mapRawDealsToSentinel(dealsRaw);
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const kpiItems = [
    {
      index: "01",
      label: "Total Pipeline",
      value: formatShortMoney(totalValue),
      support: `${totalDeals} DEALS ON BOOK`,
      trendTone: "neutral" as const,
    },
    {
      index: "02",
      label: "Avg Deal Size",
      value: formatShortMoney(avgDealValue),
      support: "ACROSS ALL STAGES",
      trendTone: "neutral" as const,
    },
    {
      index: "03",
      label: "New This Week",
      value: String(recentDeals.length),
      support:
        recentDeals.length > 0
          ? `${formatShortMoney(recentDealsValue)} ADDED`
          : "QUIET WEEK",
      trendTone:
        recentDeals.length > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      index: "04",
      label: "At Risk",
      value: String(atRiskDeals.length),
      support:
        atRiskDeals.length > 0
          ? `${formatShortMoney(highRisk.value)} EXPOSED`
          : "DESK CLEAR",
      trendTone:
        atRiskDeals.length > 0 ? ("down" as const) : ("up" as const),
    },
  ];

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "Period", value: "All Time" },
    { label: "On Wire", value: String(totalDeals) },
    { label: "At Risk", value: String(atRiskDeals.length) },
  ];

  if (!hasAnyDeals && !dataError) {
    return (
      <SentinelShell
        syncTime={shellContext.syncTime}
        coveragePercent={shellContext.coveragePercent}
        sourceLabels={shellContext.sourceLabels}
        alertCount={shellContext.alertCount}
        tickerItems={shellContext.tickerItems}
        onboarding={shellContext.onboarding}
      >
        <DealsMasthead
          kicker={`Reports Desk · ${dateLine}`}
          headline="The book is"
          italicWord="unwritten."
          deck="No deals on the wire - once you create or sync your first deal, the reports desk will start composing the morning brief automatically."
          meta={masthHeadMeta}
        />
        <ReportsControlBand totalDeals={0} />
        <ReportsEmptyState />
        <Colophon systemStatus="operational" />
      </SentinelShell>
    );
  }

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      {dataError && (
        <div
          role="alert"
          style={{
            margin: "16px 56px 0",
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
          DATA TEMPORARILY UNAVAILABLE - DESK RUNNING ON CACHE
        </div>
      )}

      <DealsMasthead
        kicker={`Reports Desk · ${dateLine}`}
        headline="The book, on the"
        italicWord="record."
        deck="A composed read of the pipeline as it stands - value, velocity, risk weather, conversion math, and every deal on the desk laid out for the morning meeting."
        meta={masthHeadMeta}
      />

      <ReportsControlBand totalDeals={totalDeals} />

      <SectionRule
        number="01"
        label="HEADLINE METRICS"
        meta={`${totalDeals} DEALS · ${formatShortMoney(totalValue)}`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="ACTIVITY & RISK"
        meta="ROLLING WINDOW · POSTURE READ"
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ gap: 0 }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Recent activity"
            title="What landed on the"
            italicWord="desk."
            accent="signal"
            meta={`${recentDeals.length} NEW · ${thirtyDayDeals.length} IN 30D`}
          >
            <RecentActivityBlock
              recentCount={recentDeals.length}
              recentValue={recentDealsValue}
              thirtyCount={thirtyDayDeals.length}
              thirtyValue={thirtyDayValue}
              avgDealAge={avgDealAge}
              avgDaysSinceActivity={avgDaysSinceActivity}
            />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Risk distribution"
            title="The weather across the"
            italicWord="book."
            accent="wine"
            meta={`AVG SCORE ${(avgRiskScore * 100).toFixed(0)}%`}
          >
            <RiskBreakdown
              low={lowRisk}
              medium={mediumRisk}
              high={highRisk}
              avgRiskScore={avgRiskScore}
            />
          </Panel>
        </div>
      </section>

      <SectionRule
        number="03"
        label="PERFORMANCE & ACTION"
        meta={`${dealsWithActions.length} ACTIONS · ${overdueDeals.length} OVERDUE`}
      />
      <section className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 0 }}>
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Action items"
            title="What needs"
            italicWord="picking up."
            accent="copper"
          >
            <ActionItemsBlock
              actionsCount={dealsWithActions.length}
              overdueCount={overdueDeals.length}
              activeCount={activeDeals.length}
              topDealsValue={topDealsValue}
              topDealsPercentage={topDealsPercentage}
            />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Performance"
            title="The week's"
            italicWord="ledger."
            accent="ivy"
          >
            <PerformanceBlock
              dealsThisWeek={dealsThisWeek.length}
              valueThisWeek={valueThisWeek}
              wonThisWeek={wonThisWeek}
              funnelSteps={funnelSteps}
              highest={
                highestDeal
                  ? {
                    name: highestDeal.name,
                    valueDisplay: formatRevenue(highestDeal.value),
                  }
                  : null
              }
            />
          </Panel>
        </div>
      </section>

      <SectionRule
        number="04"
        label="PIPELINE BY STAGE"
        meta={`${sortedStages.length} STAGES · ${formatShortMoney(totalValue)}`}
      />
      <section style={{ padding: "0 32px 40px" }}>
        <PipelineByStageTable rows={pipelineRows} totals={pipelineTotals} />
      </section>

      <SectionRule
        number="05"
        label="RHYTHM & QUICK REPORTS"
        meta="WEEKLY CADENCE · AGE · ON-DEMAND"
      />
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        style={{ gap: 0 }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Activity by day"
            title="Where the week"
            italicWord="lands."
            accent="signal"
          >
            <ActivityByDay items={activityItems} />
          </Panel>
        </div>

        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Deal age"
            title="How long deals are"
            italicWord="lingering."
            accent="copper"
          >
            <AgeDistribution buckets={ageBuckets} total={dealsRaw.length} />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Quick reports"
            title="Pulled on"
            italicWord="demand."
            accent="ivy"
          >
            <QuickReportsEditorial summary={quickReportsSummary} />
          </Panel>
        </div>
      </section>

      <SectionRule
        number="06"
        label="DEAL REGISTRY"
        meta={`${dealsRaw.length} DEALS · NAME / STAGE / VALUE / RISK / ACTION`}
      />
      <section style={{ padding: "0 0 8px" }}>
        <DealRegistryTable rows={registryRows} />
      </section>

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}


function ReportsControlBand({ totalDeals }: { totalDeals: number }) {
  return (
    <section
      aria-label="Report controls"
      className="flex flex-wrap items-center"
      style={{
        gap: 14,
        padding: "16px 56px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        {totalDeals > 0
          ? "Composed live from your pipeline · refresh on every visit"
          : "No data yet - connect a CRM or create your first deal"}
      </span>
      <span className="flex-1" />
      <span
        className="tabular"
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        {totalDeals} ON WIRE
      </span>
      <ReportExportButton />
    </section>
  );
}

function ReportsEmptyState() {
  return (
    <section
      style={{
        padding: "100px 56px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.22em",
          color: "var(--signal)",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Empty Edition
      </p>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 40,
          lineHeight: 1.05,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          maxWidth: 560,
          margin: "0 auto 16px",
        }}
      >
        No deals to put on the{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          record yet.
        </em>
      </h3>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--cream-2)",
          maxWidth: 480,
          margin: "0 auto 22px",
        }}
      >
        Create your first deal or connect a CRM. Reports populate the moment
        Sentinel sees activity on the wire.
      </p>
      <Link
        href="/deals/new"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink)",
          background: "var(--cream)",
          border: "1px solid var(--cream)",
        }}
      >
        → Create the first deal
      </Link>
    </section>
  );
}


interface RecentActivityBlockProps {
  recentCount: number;
  recentValue: number;
  thirtyCount: number;
  thirtyValue: number;
  avgDealAge: number;
  avgDaysSinceActivity: number;
}

function RecentActivityBlock({
  recentCount,
  recentValue,
  thirtyCount,
  thirtyValue,
  avgDealAge,
  avgDaysSinceActivity,
}: RecentActivityBlockProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ActivityRow
        label="Last 7 days"
        count={recentCount}
        valueDisplay={formatRevenue(recentValue)}
      />
      <ActivityRow
        label="Last 30 days"
        count={thirtyCount}
        valueDisplay={formatRevenue(thirtyValue)}
      />
      <dl
        className="grid grid-cols-2"
        style={{
          margin: 0,
          gap: 0,
          paddingTop: 16,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <SmallStat
          label="Avg Deal Age"
          value={`${avgDealAge.toFixed(0)}D`}
          tint="var(--cream)"
        />
        <SmallStat
          label="Avg Since Activity"
          value={`${avgDaysSinceActivity.toFixed(0)}D`}
          tint={
            avgDaysSinceActivity >= 14
              ? "var(--copper)"
              : "var(--cream)"
          }
          divider
        />
      </dl>
    </div>
  );
}

function ActivityRow({
  label,
  count,
  valueDisplay,
}: {
  label: string;
  count: number;
  valueDisplay: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between"
      style={{
        gap: 12,
        paddingBottom: 4,
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ textAlign: "right" }}>
        <div
          className="tabular"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            color: "var(--cream)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {count}
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 9.5,
              color: "var(--cream-4)",
              letterSpacing: "0.14em",
              marginLeft: 6,
              textTransform: "uppercase",
            }}
          >
            DEALS
          </span>
        </div>
        <div
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          {valueDisplay}
        </div>
      </div>
    </div>
  );
}


interface RiskBreakdownProps {
  low: { count: number; value: number };
  medium: { count: number; value: number };
  high: { count: number; value: number };
  avgRiskScore: number;
}

function RiskBreakdown({ low, medium, high, avgRiskScore }: RiskBreakdownProps) {
  const rows = [
    { label: "Low risk", value: low, color: "var(--ivy)" },
    { label: "Medium risk", value: medium, color: "var(--copper)" },
    { label: "High risk", value: high, color: "var(--wine)" },
  ];
  const total = low.count + medium.count + high.count;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rows.map((r, i) => {
        const pct = total > 0 ? (r.value.count / total) * 100 : 0;
        return (
          <div
            key={r.label}
            className="anim-rise"
            style={{ animationDelay: `${100 + i * 60}ms` }}
          >
            <div
              className="flex items-baseline justify-between"
              style={{ gap: 12, marginBottom: 6 }}
            >
              <span
                className="inline-flex items-center"
                style={{
                  gap: 8,
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "var(--cream-3)",
                  textTransform: "uppercase",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    background: r.color,
                  }}
                />
                {r.label}
              </span>
              <div className="text-right">
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    color: r.color,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.value.count}
                </span>
                <span
                  className="tabular"
                  style={{
                    marginLeft: 8,
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "var(--cream-4)",
                    textTransform: "uppercase",
                  }}
                >
                  {formatRevenue(r.value.value)}
                </span>
              </div>
            </div>
            <div
              style={{
                height: 2,
                background: "var(--ink-03)",
                overflow: "hidden",
              }}
              aria-hidden
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.max(pct, r.value.count > 0 ? 4 : 0)}%`,
                  background: r.color,
                }}
              />
            </div>
          </div>
        );
      })}

      <div
        className="flex items-baseline justify-between"
        style={{
          gap: 12,
          paddingTop: 14,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          Avg risk score
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            color:
              avgRiskScore < 0.4
                ? "var(--ivy)"
                : avgRiskScore < 0.6
                  ? "var(--copper)"
                  : "var(--wine)",
            letterSpacing: "-0.02em",
          }}
        >
          {(avgRiskScore * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}


interface ActionItemsBlockProps {
  actionsCount: number;
  overdueCount: number;
  activeCount: number;
  topDealsValue: number;
  topDealsPercentage: number;
}

function ActionItemsBlock({
  actionsCount,
  overdueCount,
  activeCount,
  topDealsValue,
  topDealsPercentage,
}: ActionItemsBlockProps) {
  const rows = [
    { label: "Deals needing action", value: String(actionsCount), tone: "var(--cream)" },
    {
      label: "Overdue actions",
      value: String(overdueCount),
      tone: overdueCount > 0 ? "var(--copper)" : "var(--cream)",
    },
    { label: "Active deals", value: String(activeCount), tone: "var(--cream)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {rows.map((r, i) => (
          <li
            key={r.label}
            className="flex items-baseline justify-between anim-rise"
            style={{
              gap: 12,
              padding: "14px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
              animationDelay: `${100 + i * 60}ms`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
              }}
            >
              {r.label}
            </span>
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                color: r.tone,
                letterSpacing: "-0.02em",
              }}
            >
              {r.value}
            </span>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 18,
          paddingTop: 18,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <div
          className="flex items-baseline justify-between"
          style={{ gap: 12 }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
            }}
          >
            Top 5 deals value
          </span>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              color: "var(--cream)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatRevenue(topDealsValue)}
          </span>
        </div>
        <div
          className="tabular"
          style={{
            marginTop: 4,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
          }}
        >
          {topDealsPercentage.toFixed(1)}% OF TOTAL PIPELINE
        </div>
      </div>
    </div>
  );
}


interface PerformanceBlockProps {
  dealsThisWeek: number;
  valueThisWeek: number;
  wonThisWeek: number;
  funnelSteps: { label: string; rate: number }[];
  highest: { name: string; valueDisplay: string } | null;
}

function PerformanceBlock({
  dealsThisWeek,
  valueThisWeek,
  wonThisWeek,
  funnelSteps,
  highest,
}: PerformanceBlockProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          This week
        </div>
        <dl
          className="grid grid-cols-3"
          style={{
            margin: 0,
            gap: 0,
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <SmallStat
            label="Deals Created"
            value={String(dealsThisWeek)}
            tint="var(--cream)"
          />
          <SmallStat
            label="Value Added"
            value={formatRevenue(valueThisWeek)}
            tint="var(--ivy)"
            divider
          />
          <SmallStat
            label="Closed Won"
            value={String(wonThisWeek)}
            tint={wonThisWeek > 0 ? "var(--signal)" : "var(--cream)"}
            divider
          />
        </dl>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Conversion funnel
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {funnelSteps.map((step, i) => {
            const tone =
              step.rate >= 50
                ? "var(--ivy)"
                : step.rate >= 25
                  ? "var(--copper)"
                  : "var(--wine)";
            return (
              <li
                key={step.label}
                className="anim-rise"
                style={{
                  animationDelay: `${100 + i * 60}ms`,
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <div
                  className="flex items-baseline justify-between"
                  style={{ gap: 12, marginBottom: 6 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      color: "var(--cream-2)",
                      textTransform: "uppercase",
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    className="tabular"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      color: tone,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.rate}%
                  </span>
                </div>
                <div
                  style={{
                    height: 2,
                    background: "var(--ink-03)",
                    overflow: "hidden",
                  }}
                  aria-hidden
                >
                  <span
                    className="anim-bar-fill"
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${Math.max(step.rate, step.rate > 0 ? 4 : 0)}%`,
                      background: tone,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {highest && (
        <div
          style={{
            padding: "14px 16px",
            borderLeft: "2px solid var(--signal)",
            background: "rgba(196,166,107,0.05)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--signal)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Highest value deal
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {highest.name}
          </div>
          <div
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 24,
              color: "var(--signal)",
              letterSpacing: "-0.02em",
            }}
          >
            {highest.valueDisplay}
          </div>
        </div>
      )}
    </div>
  );
}


function SmallStat({
  label,
  value,
  tint,
  divider,
}: {
  label: string;
  value: string;
  tint: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 14px",
        borderLeft: divider ? "1px solid var(--rule)" : "none",
      }}
    >
      <dt
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.16em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </dt>
      <dd
        className="tabular"
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          color: tint,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
