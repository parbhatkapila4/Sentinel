import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import Link from "next/link";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatValueInMillions } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { Colophon } from "@/components/sentinel/Colophon";

import { DealsMasthead } from "@/components/sentinel/deals/DealsMasthead";
import { DealsKPIs } from "@/components/sentinel/deals/DealsKPIs";
import { Panel } from "@/components/sentinel/analytics/Panel";
import {
  ValueByStageBars,
  type ValueByStageItem,
} from "@/components/sentinel/analytics/ValueByStageBars";
import {
  Leaderboard,
  type LeaderboardRow,
} from "@/components/sentinel/top-deals/Leaderboard";
import {
  ConcentrationMeter,
  RankedList,
  KeyValueList,
  RiskTicker,
  type RankedItem,
  type KeyValueRow,
} from "@/components/sentinel/top-deals/ConcentrationMeter";

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

export default async function TopDealsPage() {
  noStore();
  const now = new Date();

  let dealsRaw: RawDeal[] = [];
  let dataError = false;
  try {
    dealsRaw = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/top-deals");
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

  const ranked = [...dealsRaw].sort((a, b) => b.value - a.value);
  const totalValue = dealsRaw.reduce((sum, d) => sum + d.value, 0);
  const topDealValue = ranked[0]?.value ?? 0;

  const top10 = ranked.slice(0, 10);
  const top10Value = top10.reduce((sum, d) => sum + d.value, 0);
  const top10Pct = totalValue > 0 ? (top10Value / totalValue) * 100 : 0;

  const top3 = ranked.slice(0, 3);
  const top3Value = top3.reduce((sum, d) => sum + d.value, 0);
  const top3Pct = totalValue > 0 ? (top3Value / totalValue) * 100 : 0;

  const top20Count = Math.max(Math.ceil(dealsRaw.length * 0.2), 0);
  const top20 = ranked.slice(0, top20Count);
  const top20Value = top20.reduce((sum, d) => sum + d.value, 0);
  const top20Pct = totalValue > 0 ? (top20Value / totalValue) * 100 : 0;

  const top10HighRisk = top10.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  ).length;
  const top10MediumRisk = top10.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  ).length;
  const top10LowRisk = top10.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  ).length;
  const top10RiskValue = top10
    .filter((d) => formatRiskLevel(d.riskScore) === "High")
    .reduce((sum, d) => sum + d.value, 0);

  const top10WithActions = top10.filter(
    (d) => d.recommendedAction !== null
  ).length;

  const restOfDeals = ranked.slice(10);
  const restAvg =
    restOfDeals.length > 0
      ? restOfDeals.reduce((s, d) => s + d.value, 0) / restOfDeals.length
      : 0;
  const top10Avg = top10.length > 0 ? top10Value / top10.length : 0;
  const headroomMultiplier = restAvg > 0 ? top10Avg / restAvg : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTopDeals = ranked.filter(
    (d) => new Date(d.createdAt) >= thirtyDaysAgo
  ).length;

  const oldestTop10 = top10
    .map((d) => ({
      d,
      age: differenceInDays(now, new Date(d.createdAt)),
    }))
    .sort((a, b) => b.age - a.age)
    .slice(0, 4);

  const top10StageDistribution = top10.reduce<Record<string, number>>(
    (acc, d) => {
      const k = d.stage.toLowerCase().replace(/\s+/g, "_");
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    {}
  );

  const top10StageItems: ValueByStageItem[] = Object.entries(
    top10StageDistribution
  )
    .sort(([, a], [, b]) => b - a)
    .map(([stage, count]) => ({
      stage,
      label: prettyStage(stage),
      value: count,
    }));

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
      label: "Highest Deal",
      value: formatShortMoney(topDealValue),
      support: ranked[0]?.name
        ? truncateUpper(ranked[0].name, 28)
        : "NO DEALS",
      trendTone: "neutral" as const,
    },
    {
      index: "02",
      label: "Top 10 Value",
      value: formatShortMoney(top10Value),
      support: `${top10Pct.toFixed(1)}% OF BOOK`,
      trendTone: top10Pct >= 60 ? ("down" as const) : ("up" as const),
    },
    {
      index: "03",
      label: "At Risk · Top 10",
      value: String(top10HighRisk),
      support:
        top10HighRisk > 0
          ? `${formatShortMoney(top10RiskValue)} EXPOSED`
          : "NONE FLAGGED",
      trendTone: top10HighRisk > 0 ? ("down" as const) : ("up" as const),
    },
    {
      index: "04",
      label: "Total Pipeline",
      value: formatShortMoney(totalValue),
      support: `${dealsRaw.length} DEALS ON BOOK`,
      trendTone: "neutral" as const,
    },
  ];

  const leaderboardRows: LeaderboardRow[] = ranked.map((d, i) => ({
    id: d.id,
    rank: i + 1,
    name: d.name,
    stage: prettyStage(d.stage).toUpperCase(),
    value: d.value,
    valueDisplay: formatTightMoney(d.value),
    shareOfPipeline: totalValue > 0 ? (d.value / totalValue) * 100 : 0,
    riskLabel: formatRiskLevel(d.riskScore) as "Low" | "Medium" | "High",
    lastActivityNote: formatDistanceToNow(new Date(d.lastActivityAt), {
      addSuffix: true,
    }).toUpperCase(),
    recommendedAction: d.recommendedAction?.label ?? null,
  }));

  const top3Items: RankedItem[] = top3.map((d, i) => ({
    id: d.id,
    rank: i + 1,
    name: d.name,
    trail: formatTightMoney(d.value),
    tone: i === 0 ? "signal" : i === 1 ? "copper" : "ivy",
  }));

  const distRows: KeyValueRow[] = [
    {
      label: "Top 10 Avg",
      value: formatShortMoney(top10Avg),
      tone: "cream",
    },
    {
      label: "Rest Avg",
      value: formatShortMoney(restAvg),
      tone: "cream",
    },
    {
      label: "Headroom",
      value:
        headroomMultiplier > 0
          ? `${headroomMultiplier.toFixed(headroomMultiplier >= 10 ? 0 : 1)}×`
          : "-",
      tone: headroomMultiplier >= 5 ? "ivy" : "signal",
    },
  ];

  const riskRows: KeyValueRow[] = [
    {
      label: "Value at Risk",
      value: formatShortMoney(top10RiskValue),
      tone: top10RiskValue > 0 ? "wine" : "cream",
    },
    {
      label: "Needing Action",
      value: String(top10WithActions),
      tone: top10WithActions > 0 ? "signal" : "ivy",
    },
    {
      label: "Recent · 30d",
      value: String(recentTopDeals),
      tone: "cream",
    },
  ];

  const oldestRows: RankedItem[] = oldestTop10.map(({ d, age }, i) => ({
    id: d.id,
    rank: i + 1,
    name: d.name,
    trail: `${age}D OLD`,
    tone: age >= 90 ? "wine" : age >= 45 ? "copper" : "cream",
  }));

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "Total Deals", value: String(dealsRaw.length) },
    { label: "Top 10 Share", value: `${top10Pct.toFixed(1)}%` },
    { label: "T10 Risk", value: String(top10HighRisk) },
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
        kicker={`Top of the Book · ${dateLine}`}
        headline="The largest deals - by"
        italicWord="value."
        deck="A standings page for your pipeline. The biggest opportunities, ranked, with the concentration figures and risk weather your desk should know before the day gets loud."
        meta={masthHeadMeta}
      />

      <section
        aria-label="Top deals controls"
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
          Sorted descending - by deal value
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
          {ranked.length} ENTRIES · {formatShortMoney(totalValue)} AGGREGATE
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
        meta={`${dealsRaw.length} DEALS · ${formatShortMoney(totalValue)}`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="CONCENTRATION & RISK"
        meta={`TOP 3 = ${top3Pct.toFixed(0)}% · TOP 10 = ${top10Pct.toFixed(0)}%`}
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-3"
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
            kicker="Top 3 concentration"
            title="Three deals,"
            italicWord="one decision."
            accent="signal"
            meta={`${top3Pct.toFixed(1)}%`}
          >
            <div style={{ marginBottom: 24 }}>
              <ConcentrationMeter
                label="Top 3 share"
                value={formatShortMoney(top3Value)}
                percent={top3Pct}
                caption={`${top3Pct.toFixed(1)}% of total pipeline`}
                tone="signal"
              />
            </div>
            <div
              style={{
                paddingTop: 18,
                borderTop: "1px solid var(--rule)",
              }}
            >
              <RankedList items={top3Items} />
            </div>
          </Panel>
        </div>

        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Value distribution"
            title="The 80 / 20"
            italicWord="of your book."
            accent="copper"
            meta={`${top20Count} = ${top20Pct.toFixed(0)}%`}
          >
            <div style={{ marginBottom: 24 }}>
              <ConcentrationMeter
                label={`Top 20% (${top20Count})`}
                value={formatShortMoney(top20Value)}
                percent={top20Pct}
                caption={`${top20Count} deals = ${top20Pct.toFixed(1)}% of value`}
                tone="copper"
              />
            </div>
            <div
              style={{
                paddingTop: 18,
                borderTop: "1px solid var(--rule)",
              }}
            >
              <KeyValueList rows={distRows} />
            </div>
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Top 10 risk profile"
            title="Where exposure"
            italicWord="lives."
            accent={top10HighRisk > 0 ? "wine" : "ivy"}
            meta={
              top10HighRisk > 0
                ? `${top10HighRisk} HIGH`
                : "ALL CLEAR"
            }
          >
            <div style={{ marginBottom: 24 }}>
              <RiskTicker
                high={top10HighRisk}
                medium={top10MediumRisk}
                low={top10LowRisk}
              />
            </div>
            <div
              style={{
                paddingTop: 18,
                borderTop: "1px solid var(--rule)",
              }}
            >
              <KeyValueList rows={riskRows} />
            </div>
          </Panel>
        </div>
      </section>

      <SectionRule
        number="03"
        label="THE STANDINGS"
        meta={`${ranked.length} RANKED · ${formatShortMoney(totalValue)} AGGREGATE`}
      />
      <section
        aria-label="Top deals leaderboard"
        style={{ padding: "28px 56px 40px" }}
      >
        <Leaderboard rows={leaderboardRows} total={totalValue} />
      </section>

      {ranked.length > 0 && (
        <>
          <SectionRule
            number="04"
            label="DESK NOTES"
            meta={`${recentTopDeals} ADDED · 30D`}
          />
          <section
            className="grid grid-cols-1 lg:grid-cols-2"
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
                kicker="Stage distribution"
                title="Top 10 across"
                italicWord="the funnel."
                accent="signal"
              >
                {top10StageItems.length > 0 ? (
                  <ValueByStageBars
                    items={top10StageItems}
                    formatMoney={(n) =>
                      `${n} (${((n / Math.max(top10.length, 1)) * 100).toFixed(0)}%)`
                    }
                  />
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
                    No top deals to chart yet.
                  </p>
                )}
              </Panel>
            </div>

            <div style={{ padding: "32px 32px 36px" }}>
              <Panel
                kicker="Aging - Top 10"
                title="The deals sitting"
                italicWord="longest."
                accent="copper"
              >
                {oldestRows.length > 0 ? (
                  <RankedList items={oldestRows} />
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
                    No top-tier deals yet.
                  </p>
                )}
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
        </>
      )}

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}

function truncateUpper(s: string, max: number): string {
  const u = s.toUpperCase();
  return u.length > max ? `${u.slice(0, max - 1)}…` : u;
}
