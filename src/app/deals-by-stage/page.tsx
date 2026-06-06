import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import {
  format,
  formatDistanceToNow,
  differenceInDays,
} from "date-fns";
import Link from "next/link";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_UI_CONFIG } from "@/lib/config";
import { formatValueInMillions } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { Colophon } from "@/components/sentinel/Colophon";

import { DealsMasthead } from "@/components/sentinel/deals/DealsMasthead";
import { DealsKPIs } from "@/components/sentinel/deals/DealsKPIs";
import {
  StageFlowBand,
  type StageFlowItem,
} from "@/components/sentinel/deals/StageFlowBand";
import {
  StageBoard,
  type StageBoardColumn,
  type StageBoardDeal,
} from "@/components/sentinel/stages/StageBoard";
import {
  StageVelocityList,
  type VelocityRow,
} from "@/components/sentinel/analytics/StageVelocityList";
import { Panel } from "@/components/sentinel/analytics/Panel";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { formatShortMoney } from "@/lib/format-money";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

function formatTightMoney(n: number) {
  const f = formatValueInMillions(n);
  return `$${f.value}${f.suffix}`;
}

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

export default async function DealsByStagePage() {
  noStore();
  const now = new Date();

  let dealsRaw: RawDeal[] = [];
  let dataError = false;
  try {
    dealsRaw = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/deals-by-stage");
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

  const stageGroups = dealsRaw.reduce<Record<string, RawDeal[]>>((acc, d) => {
    const key = d.stage;
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  type StageUi = (typeof STAGE_UI_CONFIG)[keyof typeof STAGE_UI_CONFIG];
  const stageConfig = STAGE_UI_CONFIG as Record<string, StageUi>;
  const stageOrder = (s: string) =>
    stageConfig[s.toLowerCase()]?.order ?? 99;

  const sortedStages = Object.keys(stageGroups).sort(
    (a, b) => stageOrder(a) - stageOrder(b)
  );

  const totalDeals = dealsRaw.length;
  const totalValue = dealsRaw.reduce((sum, d) => sum + d.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const highRiskDeals = dealsRaw.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const valueAtRisk = highRiskDeals.reduce((sum, d) => sum + d.value, 0);

  const stageMetrics = sortedStages.map((stage) => {
    const ds = stageGroups[stage];
    const value = ds.reduce((s, d) => s + d.value, 0);
    const avgValue = ds.length > 0 ? value / ds.length : 0;
    const high = ds.filter((d) => formatRiskLevel(d.riskScore) === "High").length;
    const med = ds.filter((d) => formatRiskLevel(d.riskScore) === "Medium").length;
    const low = ds.filter((d) => formatRiskLevel(d.riskScore) === "Low").length;

    const avgDaysActivity =
      ds.length > 0
        ? ds.reduce(
          (s, d) =>
            s + differenceInDays(now, new Date(d.lastActivityAt)),
          0
        ) / ds.length
        : 0;
    const avgDaysAge =
      ds.length > 0
        ? ds.reduce(
          (s, d) =>
            s + differenceInDays(now, new Date(d.createdAt)),
          0
        ) / ds.length
        : 0;

    return {
      stage,
      count: ds.length,
      value,
      avgValue,
      high,
      med,
      low,
      avgDaysActivity,
      avgDaysAge,
    };
  });

  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < sortedStages.length - 1; i++) {
    const current = sortedStages[i];
    const next = sortedStages[i + 1];
    const nextCount = stageGroups[next]?.length ?? 0;
    const remainingFromCurrent = dealsRaw.filter(
      (d) => stageOrder(d.stage) >= stageOrder(current)
    ).length;
    conversionRates[current] =
      remainingFromCurrent > 0 ? (nextCount / remainingFromCurrent) * 100 : 0;
  }

  const isDemoMode =
    dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const hasAnyDeals = dealsRaw.length > 0;
  const closedWonAll = dealsRaw.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_won";
  }).length;
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
      label: "On Wire",
      value: String(totalDeals),
      support: `${sortedStages.length} ACTIVE STAGES`,
      trendTone: "neutral" as const,
    },
    {
      index: "02",
      label: "Total Pipeline",
      value: formatShortMoney(totalValue),
      support: `${formatShortMoney(avgDealValue)} AVG DEAL`,
      trendTone: "neutral" as const,
    },
    {
      index: "03",
      label: "At Risk",
      value: String(highRiskDeals.length),
      support:
        highRiskDeals.length > 0
          ? `${formatShortMoney(valueAtRisk)} EXPOSED`
          : "DESK CLEAR",
      trendTone:
        highRiskDeals.length > 0 ? ("down" as const) : ("up" as const),
    },
    {
      index: "04",
      label: "Avg Deal",
      value: formatShortMoney(avgDealValue),
      support: "ACROSS ALL STAGES",
      trendTone: "neutral" as const,
    },
  ];

  const flowItems: StageFlowItem[] = sortedStages.map((stage) => {
    const m = stageMetrics.find((x) => x.stage === stage);
    return {
      stage,
      label: prettyStage(stage),
      count: m?.count ?? 0,
      value: m?.value ?? 0,
    };
  });

  const boardColumns: StageBoardColumn[] = sortedStages.map((stage) => {
    const m = stageMetrics.find((x) => x.stage === stage)!;
    const ds: StageBoardDeal[] = [...stageGroups[stage]]
      .sort((a, b) => b.value - a.value)
      .map((d) => ({
        id: d.id,
        name: d.name,
        value: d.value,
        valueDisplay: formatTightMoney(d.value),
        riskLabel: formatRiskLevel(d.riskScore) as "Low" | "Medium" | "High",
        activityNote: formatDistanceToNow(new Date(d.lastActivityAt), {
          addSuffix: true,
        }).toUpperCase(),
        recommendedAction: d.recommendedAction?.label ?? null,
      }));

    return {
      stage,
      label: prettyStage(stage),
      count: m.count,
      value: m.value,
      valueDisplay: formatShortMoney(m.value),
      avgDealDisplay: formatShortMoney(m.avgValue),
      avgDays: m.avgDaysActivity,
      highRisk: m.high,
      mediumRisk: m.med,
      lowRisk: m.low,
      conversionPct: conversionRates[stage],
      deals: ds,
    };
  });

  const velocityRows: VelocityRow[] = stageMetrics
    .filter((m) => m.count > 0)
    .map((m) => ({
      stage: m.stage,
      label: prettyStage(m.stage),
      avgDays: Math.round(m.avgDaysAge),
      count: m.count,
    }));

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "Stages", value: String(sortedStages.length) },
    { label: "On Wire", value: String(totalDeals) },
    { label: "At Risk", value: String(highRiskDeals.length) },
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
        kicker={`Pipeline Board · ${dateLine}`}
        headline="Read the desk by"
        italicWord="stage."
        deck="Every deal, sorted into its column. Stage value, average tempo, risk weather, and the next action - all on one wire so you can see where the book is moving and where it's stuck."
        meta={masthHeadMeta}
      />

      <section
        aria-label="Stage board controls"
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
          Each column sorted descending - by deal value
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
          {totalDeals} ON WIRE · {sortedStages.length} STAGES
        </span>
        <Link
          href="/deals/new"
          className="sentinel-editorial-button inline-flex items-center"
          style={{ gap: 6, padding: "8px 14px" }}
        >
          + New Deal
        </Link>
      </section>

      <SectionRule
        number="01"
        label="HEADLINE METRICS"
        meta={`${totalDeals} DEALS · ${formatShortMoney(totalValue)}`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="PIPELINE DISTRIBUTION"
        meta={`${sortedStages.length} STAGES · ${formatShortMoney(totalValue)}`}
      />
      <StageFlowBand stages={flowItems} totalActiveValue={totalValue} />

      <SectionRule
        number="03"
        label="THE BOARD"
        meta={`${totalDeals} ON WIRE · ${sortedStages.length} COLUMNS`}
      />
      {totalDeals === 0 ? (
        <BoardEmptyState />
      ) : (
        <StageBoard columns={boardColumns} />
      )}

      {totalDeals > 0 && velocityRows.length > 0 && (
        <>
          <SectionRule
            number="04"
            label="STAGE TEMPO"
            meta={`AVG TIME-TO-AGE · BY STAGE`}
          />
          <section
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            style={{ gap: 0, paddingBottom: 4 }}
          >
            <div
              style={{
                padding: "32px 32px 36px",
                borderRight: "1px solid var(--rule)",
              }}
            >
              <Panel
                kicker="Time on stage"
                title="Days on the"
                italicWord="clock."
                accent="copper"
                meta={`${velocityRows.length} STAGES`}
              >
                <StageVelocityList rows={velocityRows} />
              </Panel>
            </div>
            <div style={{ padding: "32px 32px 36px" }}>
              <Panel
                kicker="Conversion ladder"
                title="What advances,"
                italicWord="and what doesn't."
                accent="signal"
              >
                <ConversionList
                  rows={sortedStages
                    .filter((s) => conversionRates[s] !== undefined)
                    .map((s) => ({
                      stage: s,
                      label: prettyStage(s),
                      next:
                        prettyStage(
                          sortedStages[sortedStages.indexOf(s) + 1] ?? ""
                        ) || "-",
                      pct: conversionRates[s] ?? 0,
                    }))}
                />
              </Panel>
            </div>
          </section>
        </>
      )}

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}

function BoardEmptyState() {
  return (
    <section
      style={{
        padding: "80px 56px",
        textAlign: "center",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--signal)",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Board Empty
      </p>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 36,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          maxWidth: 520,
          margin: "0 auto 12px",
        }}
      >
        No deals on the{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          wire yet.
        </em>
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--cream-2)",
          maxWidth: 460,
          margin: "0 auto 18px",
        }}
      >
        Add a deal or connect your CRM and the board will start populating each
        stage column.
      </p>
      <Link
        href="/deals/new"
        style={{
          display: "inline-block",
          padding: "9px 16px",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream)",
          background: "var(--signal)",
          border: "1px solid var(--signal)",
        }}
      >
        → Create the first deal
      </Link>
    </section>
  );
}

interface ConversionRow {
  stage: string;
  label: string;
  next: string;
  pct: number;
}

function ConversionList({ rows }: { rows: ConversionRow[] }) {
  if (rows.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        Need at least two stages with deals to compare.
      </p>
    );
  }

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {rows.map((r, i) => {
        const tone =
          r.pct >= 50 ? "var(--ivy)" : r.pct >= 25 ? "var(--copper)" : "var(--wine)";
        return (
          <li
            key={r.stage}
            className="anim-rise"
            style={{
              animationDelay: `${100 + i * 60}ms`,
              padding: "12px 0",
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
                {r.label} → {r.next}
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: tone,
                  letterSpacing: "-0.01em",
                }}
              >
                {r.pct.toFixed(0)}%
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
                  width: `${Math.max(Math.min(r.pct, 100), r.pct > 0 ? 4 : 0)}%`,
                  background: tone,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
