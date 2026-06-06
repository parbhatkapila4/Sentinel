import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { getAuthenticatedUserId } from "@/lib/auth";
import { formatRiskLevel } from "@/lib/dealRisk";

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
  DealsToolbar,
  type DealsFilterType,
  type DealsScopeType,
} from "@/components/sentinel/deals/DealsToolbar";
import { DealsTable } from "@/components/sentinel/deals/DealsTable";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { formatShortMoney } from "@/lib/format-money";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

function applyFilter(
  deals: RawDeal[],
  filter: DealsFilterType,
  searchQuery?: string
) {
  let filtered = deals;

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.stage.toLowerCase().includes(q)
    );
  }

  switch (filter) {
    case "active":
      return filtered.filter((d) => d.status === "active");
    case "at-risk":
      return filtered.filter((d) => formatRiskLevel(d.riskScore) === "High");
    case "closed":
      return filtered.filter(
        (d) =>
          d.status === "saved" ||
          d.status === "lost" ||
          d.status === "closed"
      );
    case "all":
    default:
      return filtered;
  }
}

const STAGE_FLOW_DEF: Array<{ key: string; label: string; matches: string[] }> = [
  { key: "discover", label: "Discover", matches: ["discover", "discovery", "prospect"] },
  { key: "qualify", label: "Qualify", matches: ["qualify", "qualification"] },
  { key: "proposal", label: "Proposal", matches: ["proposal"] },
  { key: "negotiation", label: "Negotiate", matches: ["negotiation", "negotiate"] },
  { key: "closed_won", label: "Won", matches: ["closed_won", "closed won", "won"] },
  { key: "closed_lost", label: "Lost", matches: ["closed_lost", "closed lost", "lost"] },
];

function buildStageFlow(deals: RawDeal[]): StageFlowItem[] {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "_");
  return STAGE_FLOW_DEF.map((def) => {
    const bucket = deals.filter((d) => {
      const s = norm(d.stage);
      return def.matches.some((m) => s === norm(m));
    });
    return {
      stage: def.key,
      label: def.label,
      count: bucket.length,
      value: bucket.reduce((sum, d) => sum + d.value, 0),
    };
  });
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    search?: string;
    team?: string;
    scope?: string;
  }>;
}) {
  noStore();
  const params = await searchParams;
  const filter = (params?.filter || "all") as DealsFilterType;
  const searchQuery = params?.search ?? "";
  const teamId = params?.team ?? null;
  const scope = (params?.scope || "my") as DealsScopeType;

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/deals");
  }

  let dealsRaw: RawDeal[] = [];
  let dataError = false;
  let integrationStatuses: Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null = null;

  try {
    dealsRaw = await getAllDeals(
      scope === "all"
        ? { includeTeamDeals: true }
        : teamId
          ? { teamId }
          : undefined
    );
  } catch {
    dataError = true;
  }

  try {
    integrationStatuses = await getAllIntegrationStatuses();
  } catch {
    integrationStatuses = null;
  }

  const scopeDeals =
    teamId && scope === "my"
      ? dealsRaw.filter(
          (d) => d.assignedToId === userId || d.userId === userId
        )
      : dealsRaw;

  const filteredDeals = applyFilter(scopeDeals, filter, searchQuery);

  const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 } as const;
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const aU = (a.recommendedAction?.urgency ?? "none") as keyof typeof urgencyOrder;
    const bU = (b.recommendedAction?.urgency ?? "none") as keyof typeof urgencyOrder;
    const diff = urgencyOrder[aU] - urgencyOrder[bU];
    if (diff !== 0) return diff;
    return b.riskScore - a.riskScore;
  });

  const totalValue = scopeDeals.reduce((sum, d) => sum + d.value, 0);
  const activeDeals = scopeDeals.filter((d) => d.status === "active");
  const activeValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const closedWon = scopeDeals.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_won" || s === "closed" || d.status === "closed";
  });
  const highRisk = scopeDeals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const highRiskValue = highRisk.reduce((sum, d) => sum + d.value, 0);

  const totalDealsAcrossBook = dealsRaw.length;
  const now = new Date();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = scopeDeals.filter(
    (d) => new Date(d.createdAt).getTime() >= sevenDaysAgo
  ).length;

  const coveragePercent =
    totalDealsAcrossBook > 0
      ? (closedWon.length / totalDealsAcrossBook) * 100
      : 0;

  const isDemoMode =
    dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const hasAnyDeals = dealsRaw.length > 0;

  const deals = mapRawDealsToSentinel(dealsRaw);
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const stageFlow = buildStageFlow(scopeDeals);
  const activeStageFlow = stageFlow.filter(
    (s) => s.stage !== "closed_won" && s.stage !== "closed_lost"
  );
  const totalActiveInFlow = activeStageFlow.reduce(
    (sum, s) => sum + s.value,
    0
  );

  const pctAtRisk =
    scopeDeals.length > 0
      ? (highRisk.length / scopeDeals.length) * 100
      : 0;

  const kpiItems = [
    {
      index: "01",
      label: "Pipeline Weighted",
      value: formatShortMoney(totalValue),
      support: `${scopeDeals.length} DEALS ON BOOK`,
      trendTone: "neutral" as const,
    },
    {
      index: "02",
      label: "Active Volume",
      value: formatShortMoney(activeValue),
      support: `${activeDeals.length} IN MOTION`,
      trendTone: "up" as const,
    },
    {
      index: "03",
      label: "At Risk",
      value: formatShortMoney(highRiskValue),
      support:
        highRisk.length > 0
          ? `${highRisk.length} FLAGGED · ${pctAtRisk.toFixed(0)}%`
          : "NO FLAGS",
      trendTone: highRisk.length > 0 ? ("down" as const) : ("up" as const),
    },
    {
      index: "04",
      label: "New · 7d",
      value: String(newThisWeek),
      support: `${closedWon.length} WON THIS BOOK`,
      trendTone: newThisWeek > 0 ? ("up" as const) : ("neutral" as const),
    },
  ];

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const scopeLabel = scope === "all" ? "TEAM DESK" : "MY DESK";
  const filterLabel =
    filter === "all" ? "ALL DEALS" : filter.replace("-", " ").toUpperCase();

  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "Scope", value: scopeLabel },
    { label: "Filter", value: filterLabel },
    { label: "On Book", value: String(scopeDeals.length) },
  ];

  const italicTail = scope === "all" ? "desk" : "book";

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
        kicker={`Pipeline · ${dateLine}`}
        headline="Every deal on the"
        italicWord={italicTail + "."}
        deck="Read across the book with one eye on risk and the other on what's next. Sort with the filters below; the wire above will keep flagging movement as it happens."
        meta={masthHeadMeta}
      />

      <SectionRule
        number="01"
        label="THE BOOK"
        meta={`${scopeDeals.length} ON BOOK · ${activeDeals.length} ACTIVE · ${highRisk.length} AT RISK`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="STAGE FLOW"
        meta={`${STAGE_FLOW_DEF.length} STAGES · ${formatShortMoney(totalActiveInFlow)} IN MOTION`}
      />
      <StageFlowBand
        stages={stageFlow}
        totalActiveValue={totalActiveInFlow}
      />

      <SectionRule
        number="03"
        label="THE LIST"
        meta={`${sortedDeals.length} SHOWN · ${scopeDeals.length} IN SCOPE`}
      />
      <section
        aria-label="Deals list"
        style={{ padding: "28px 56px 40px" }}
      >
        <DealsToolbar
          currentFilter={filter}
          currentScope={scope}
          currentSearch={searchQuery}
          teamId={teamId}
          totalShown={sortedDeals.length}
          totalInScope={scopeDeals.length}
        />

        <DealsTable
          deals={sortedDeals.map((d) => ({
            id: d.id,
            name: d.name,
            value: d.value,
            stage: d.stage,
            status: d.status,
            riskScore: d.riskScore,
            assignedTo: d.assignedTo ?? null,
            recommendedAction: d.recommendedAction ?? null,
            lastActivityAt: d.lastActivityAt,
            isDemo: d.isDemo,
          }))}
        />
      </section>

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}
