import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import Link from "next/link";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRiskLevel } from "@/lib/dealRisk";
import { UnauthorizedError } from "@/lib/errors";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { Colophon } from "@/components/sentinel/Colophon";

import { DealsMasthead } from "@/components/sentinel/deals/DealsMasthead";
import { DealsKPIs } from "@/components/sentinel/deals/DealsKPIs";
import {
  AnalyticsRangeFilter,
  type AnalyticsRange,
} from "@/components/sentinel/analytics/AnalyticsRangeFilter";
import { RiskDonut } from "@/components/sentinel/analytics/RiskDonut";
import {
  DealList,
  type DealListItem,
} from "@/components/sentinel/analytics/DealList";
import {
  ValueByStageBars,
  type ValueByStageItem,
} from "@/components/sentinel/analytics/ValueByStageBars";
import {
  StageVelocityList,
  type VelocityRow,
} from "@/components/sentinel/analytics/StageVelocityList";
import { QuickInsights } from "@/components/sentinel/analytics/QuickInsights";
import { Panel } from "@/components/sentinel/analytics/Panel";
import { ExportButton } from "@/components/export-button";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { formatShortMoney } from "@/lib/format-money";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

function filterByRange(deals: RawDeal[], range: AnalyticsRange, now: Date): RawDeal[] {
  if (range === "all") return deals;
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const cutoff = subDays(now, days);
  return deals.filter((d) => new Date(d.createdAt) >= cutoff);
}

function rangeLabel(range: AnalyticsRange): string {
  switch (range) {
    case "7d":
      return "LAST 7D";
    case "90d":
      return "LAST 90D";
    case "all":
      return "ALL TIME";
    case "30d":
    default:
      return "LAST 30D";
  }
}

const STAGE_DISPLAY: Record<string, string> = {
  lead: "Lead",
  discover: "Discover",
  qualify: "Qualify",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
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

function trendArrow(positive: boolean) {
  return positive ? "↑" : "↓";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const rangeRaw = (params?.range || "all") as string;
  const range: AnalyticsRange =
    rangeRaw === "7d" || rangeRaw === "90d" || rangeRaw === "all"
      ? rangeRaw
      : "all";

  let allDealsRaw: RawDeal[] = [];
  let dataError = false;
  try {
    allDealsRaw = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect(
        "/sign-in?redirect=" +
        encodeURIComponent("/analytics?range=" + range)
      );
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

  const now = new Date();
  const dealsInRange = filterByRange(allDealsRaw, range, now);

  const totalDeals = dealsInRange.length;
  const totalValue = dealsInRange.reduce((s, d) => s + d.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const lowDeals = dealsInRange.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  );
  const mediumDeals = dealsInRange.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  );
  const highDeals = dealsInRange.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );

  const avgRiskScore =
    totalDeals > 0
      ? dealsInRange.reduce((s, d) => s + d.riskScore, 0) / totalDeals
      : 0;

  const dealsNeedingAction = dealsInRange.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;

  const lowAction = lowDeals.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;
  const mediumAction = mediumDeals.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;
  const highAction = highDeals.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;

  const won = dealsInRange.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_won";
  }).length;
  const lost = dealsInRange.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_lost";
  }).length;
  const closedTotal = won + lost;
  const winRate = closedTotal > 0 ? (won / closedTotal) * 100 : 0;

  const activeDeals = dealsInRange.filter((d) => d.status === "active");

  const periodDays = range === "7d" ? 7 : range === "90d" ? 90 : range === "all" ? null : 30;
  let pipelineDelta: { positive: boolean; pct: number } | null = null;
  let avgDealDelta: { positive: boolean; pct: number } | null = null;
  if (periodDays) {
    const priorStart = subDays(now, periodDays * 2);
    const priorEnd = subDays(now, periodDays);
    const priorWindow = allDealsRaw.filter((d) => {
      const t = new Date(d.createdAt);
      return t >= priorStart && t < priorEnd;
    });
    const priorTotal = priorWindow.reduce((s, d) => s + d.value, 0);
    const priorAvg =
      priorWindow.length > 0 ? priorTotal / priorWindow.length : 0;

    if (priorTotal > 0) {
      const change = ((totalValue - priorTotal) / priorTotal) * 100;
      pipelineDelta = { positive: change >= 0, pct: Math.abs(change) };
    }
    if (priorAvg > 0) {
      const change = ((avgDealValue - priorAvg) / priorAvg) * 100;
      avgDealDelta = { positive: change >= 0, pct: Math.abs(change) };
    }
  }

  const isDemoMode =
    allDealsRaw.length > 0 && allDealsRaw.every((d) => d.isDemo);
  const hasAnyDeals = allDealsRaw.length > 0;
  const closedWonAll = allDealsRaw.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_won";
  }).length;
  const coveragePercent =
    allDealsRaw.length > 0 ? (closedWonAll / allDealsRaw.length) * 100 : 0;

  const allDeals = mapRawDealsToSentinel(allDealsRaw);
  const shellContext = buildSentinelShellContext({
    deals: allDeals,
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
      support: pipelineDelta
        ? `${trendArrow(pipelineDelta.positive)} ${pipelineDelta.pct.toFixed(1)}% VS PRIOR`
        : `${totalDeals} DEALS IN RANGE`,
      trendTone: pipelineDelta
        ? pipelineDelta.positive
          ? ("up" as const)
          : ("down" as const)
        : ("neutral" as const),
    },
    {
      index: "02",
      label: "Avg Deal",
      value: formatShortMoney(avgDealValue),
      support: avgDealDelta
        ? `${trendArrow(avgDealDelta.positive)} ${avgDealDelta.pct.toFixed(1)}% VS PRIOR`
        : `${activeDeals.length} ACTIVE`,
      trendTone: avgDealDelta
        ? avgDealDelta.positive
          ? ("up" as const)
          : ("down" as const)
        : ("neutral" as const),
    },
    {
      index: "03",
      label: "Risk Index",
      value: `${(avgRiskScore * 100).toFixed(0)}%`,
      support:
        highDeals.length > 0
          ? `${highDeals.length} FLAGGED`
          : "DESK CLEAR",
      trendTone:
        avgRiskScore >= 0.6
          ? ("down" as const)
          : avgRiskScore >= 0.35
            ? ("neutral" as const)
            : ("up" as const),
    },
    {
      index: "04",
      label: "Needs Action",
      value: String(dealsNeedingAction),
      support:
        dealsNeedingAction > 0
          ? `${highAction} HIGH · ${mediumAction} MED · ${lowAction} LOW`
          : "NONE PENDING",
      trendTone:
        dealsNeedingAction > 0 ? ("down" as const) : ("up" as const),
    },
  ];

  const topPerformers: DealListItem[] = [...lowDeals]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((d, i) => ({
      id: d.id,
      index: i + 1,
      name: d.name,
      meta: `${prettyStage(d.stage).toUpperCase()} · LOW RISK`,
      trail: formatShortMoney(d.value),
      trailTone: "ivy",
    }));

  const atRiskList: DealListItem[] = [...highDeals]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((d, i) => ({
      id: d.id,
      index: i + 1,
      name: d.name,
      meta:
        d.recommendedAction?.label?.toUpperCase() ??
        `${prettyStage(d.stage).toUpperCase()} · NEEDS REVIEW`,
      trail: `${(d.riskScore * 100).toFixed(0)}% RISK`,
      trailTone: "wine",
    }));

  const attentionRows: DealListItem[] = [...highDeals]
    .slice(0, 5)
    .map((d, i) => ({
      id: d.id,
      index: i + 1,
      name: d.name,
      meta: `${prettyStage(d.stage).toUpperCase()} · ${formatShortMoney(d.value)}`,
      trail: "HIGH",
      trailTone: "wine",
    }));

  const stageOrder = ["lead", "qualify", "proposal", "negotiation", "closed_won"];
  const valueByStage: ValueByStageItem[] = stageOrder.map((stage) => {
    const matched = dealsInRange.filter(
      (d) => d.stage.toLowerCase().replace(/\s+/g, "_") === stage
    );
    return {
      stage,
      label: prettyStage(stage),
      value: matched.reduce((s, d) => s + d.value, 0),
    };
  });

  const velocityStages = ["lead", "qualify", "proposal", "negotiation"];
  const velocityRows: VelocityRow[] = velocityStages
    .map((stage) => {
      const matched = dealsInRange.filter(
        (d) => d.stage.toLowerCase().replace(/\s+/g, "_") === stage
      );
      const avgDays =
        matched.length > 0
          ? Math.round(
            matched.reduce((acc, d) => {
              const days = Math.floor(
                (now.getTime() - new Date(d.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
              );
              return acc + days;
            }, 0) / matched.length
          )
          : 0;
      return {
        stage,
        label: prettyStage(stage),
        avgDays,
        count: matched.length,
      };
    })
    .filter((v) => v.count > 0 || v.stage === "lead" || v.stage === "qualify");

  const insightItems = [
    {
      label: "Win Rate",
      value: closedTotal > 0 ? `${Math.round(winRate)}%` : "-",
      support:
        closedTotal > 0
          ? `${won} won, ${lost} lost in range.`
          : "No closed deals in this window yet.",
      tone:
        closedTotal === 0
          ? ("neutral" as const)
          : winRate >= 50
            ? ("ivy" as const)
            : winRate >= 30
              ? ("copper" as const)
              : ("wine" as const),
    },
    {
      label: "Avg Deal Size",
      value:
        dealsInRange.length > 0
          ? formatShortMoney(avgDealValue)
          : "$0",
      support: avgDealDelta
        ? `${avgDealDelta.positive ? "Up" : "Down"} ${avgDealDelta.pct.toFixed(1)}% versus the prior window.`
        : "No prior period to compare against.",
      tone: avgDealDelta
        ? avgDealDelta.positive
          ? ("ivy" as const)
          : ("wine" as const)
        : ("neutral" as const),
    },
    {
      label: "Active Deals",
      value: String(activeDeals.length),
      support: `${dealsInRange.length - activeDeals.length} resolved or paused in range.`,
      tone: "signal" as const,
    },
  ];

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "Range", value: rangeLabel(range) },
    { label: "On Wire", value: String(totalDeals) },
    { label: "Risk Index", value: `${(avgRiskScore * 100).toFixed(0)}%` },
  ];

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
        kicker={`Analytics · ${dateLine}`}
        headline="Read the desk's"
        italicWord="appetite."
        deck="Where revenue is forming, what risk is brewing, and where attention is best spent. Adjust the range below to read the past week, month, quarter, or the whole book."
        meta={masthHeadMeta}
      />

      <section
        aria-label="Analytics controls"
        className="flex flex-wrap items-center"
        style={{
          gap: 14,
          padding: "16px 56px",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <AnalyticsRangeFilter currentRange={range} />
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
          {totalDeals} ON WIRE · {rangeLabel(range)}
        </span>
        <ExportButton className="sentinel-editorial-button inline-flex items-center gap-2 px-3 py-2" />
      </section>

      <SectionRule
        number="01"
        label="KEY METRICS"
        meta={`${totalDeals} DEALS · ${formatShortMoney(totalValue)}`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="RISK DESK"
        meta={`${highDeals.length} HIGH · ${mediumDeals.length} MED · ${lowDeals.length} LOW`}
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        style={{
          gap: 0,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Distribution"
            title="The book's"
            italicWord="risk weather."
            accent="signal"
            meta={
              dealsNeedingAction > 0
                ? `${dealsNeedingAction} URGENT`
                : "ALL CLEAR"
            }
          >
            <RiskDonut
              low={lowDeals.length}
              medium={mediumDeals.length}
              high={highDeals.length}
              lowAction={lowAction}
              mediumAction={mediumAction}
              highAction={highAction}
            />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <DealList
            kicker="Attention list"
            title="Deals demanding"
            italicWord="a second look."
            accent="wine"
            items={attentionRows}
            empty={{
              headline: "All clear",
              body: "No high-risk deals in this range. Take a breath.",
            }}
            footer={
              highDeals.length > 5
                ? { label: "View all at-risk", href: "/risk-overview" }
                : undefined
            }
          />
        </div>
      </section>

      <SectionRule
        number="03"
        label="STANDINGS"
        meta={`${topPerformers.length} TOP · ${atRiskList.length} AT RISK`}
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{
          gap: 0,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <DealList
            kicker="Top of the order"
            title="Healthiest deals"
            italicWord="on the book."
            accent="ivy"
            items={topPerformers}
            empty={{
              headline: "No low-risk deals",
              body: "Once a few deals trend healthy they'll surface here.",
            }}
          />
        </div>
        <div style={{ padding: "32px 32px 36px" }}>
          <DealList
            kicker="The watch list"
            title="Most fragile, ranked"
            italicWord="by risk."
            accent="wine"
            items={atRiskList}
            empty={{
              headline: "No at-risk deals",
              body: "The desk is clear. Keep it that way.",
            }}
            footer={
              highDeals.length > 5
                ? { label: "View all at-risk", href: "/risk-overview" }
                : undefined
            }
          />
        </div>
      </section>

      <SectionRule
        number="04"
        label="VELOCITY & TEMPO"
        meta={`${velocityRows.length} STAGES · ${formatShortMoney(totalValue)} STAGED`}
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-3"
        style={{
          gap: 0,
          paddingBottom: 4,
        }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Stage velocity"
            title="Days in"
            italicWord="each chair."
            accent="copper"
          >
            {velocityRows.length > 0 ? (
              <StageVelocityList rows={velocityRows} />
            ) : (
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                }}
              >
                No active stages in range.
              </p>
            )}
          </Panel>
        </div>

        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Value by stage"
            title="Where the dollars"
            italicWord="are sitting."
            accent="signal"
          >
            <ValueByStageBars
              items={valueByStage}
              formatMoney={formatShortMoney}
            />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Quick insights"
            title="Three numbers"
            italicWord="worth knowing."
            accent="ivy"
          >
            <QuickInsights items={insightItems} />
            <Link
              href="/deals"
              style={{
                display: "inline-block",
                marginTop: 18,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--signal)",
              }}
            >
              Open the book →
            </Link>
          </Panel>
        </div>
      </section>

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}
