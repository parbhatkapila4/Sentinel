import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { getAuthenticatedUserId } from "@/lib/auth";
import { formatRiskLevel } from "@/lib/dealRisk";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { DealsView } from "@/components/sentinel/daylight/deals/DealsView";
import {
  DEALS_FILTERS,
  stageSegments,
  type DealRow,
  type DealsFilter,
  type DealsScope,
  type StageBucket,
  type StageCell,
} from "@/components/sentinel/daylight/deals/model";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

function applyFilter(
  deals: RawDeal[],
  filter: DealsFilter,
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

const STAGE_FLOW_DEF: Array<{
  key: string;
  label: string;
  bucket: StageBucket;
  matches: string[];
}> = [
  { key: "discover", label: "Discover", bucket: "open", matches: ["discover", "discovery", "prospect"] },
  { key: "qualify", label: "Qualify", bucket: "open", matches: ["qualify", "qualification"] },
  { key: "proposal", label: "Proposal", bucket: "open", matches: ["proposal"] },
  { key: "negotiation", label: "Negotiate", bucket: "open", matches: ["negotiation", "negotiate"] },
  { key: "closed_won", label: "Won", bucket: "won", matches: ["closed_won", "closed won", "won"] },
  { key: "closed_lost", label: "Lost", bucket: "lost", matches: ["closed_lost", "closed lost", "lost"] },
];

function buildStageFlow(deals: RawDeal[]): StageCell[] {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "_");
  return STAGE_FLOW_DEF.map((def) => {
    const bucket = deals.filter((d) => {
      const s = norm(d.stage);
      return def.matches.some((m) => s === norm(m));
    });
    return {
      stage: def.key,
      label: def.label,
      bucket: def.bucket,
      count: bucket.length,
      value: bucket.reduce((sum, d) => sum + d.value, 0),
      segments: stageSegments(bucket, def.bucket),
    };
  });
}

function toRow(d: RawDeal): DealRow {
  return {
    id: d.id,
    name: d.name,
    value: d.value,
    stage: d.stage,
    status: d.status,
    riskScore: d.riskScore,
    riskReason: d.primaryRiskReason ?? null,
    location: d.location ?? null,
    owner: d.assignedTo
      ? [d.assignedTo.name, d.assignedTo.surname].filter(Boolean).join(" ") ||
        null
      : null,
    action: d.recommendedAction?.label ?? null,
    actionDueAt: d.actionDueAt ? new Date(d.actionDueAt).getTime() : null,
    overdueDays: d.isActionOverdue ? d.actionOverdueByDays : null,
    lastActivityAt: new Date(d.lastActivityAt).getTime(),
    isDemo: d.isDemo,
  };
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
  const filter: DealsFilter = DEALS_FILTERS.find((f) => f === params?.filter) ?? "all";
  const searchQuery = params?.search ?? "";
  const teamId = params?.team ?? null;
  const scope: DealsScope = params?.scope === "all" ? "all" : "my";

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
  const totalActiveInFlow = stageFlow
    .filter((s) => s.bucket === "open")
    .reduce((sum, s) => sum + s.value, 0);
  const stageValue = (bucket: StageBucket) =>
    stageFlow
      .filter((s) => s.bucket === bucket)
      .reduce((sum, s) => sum + s.value, 0);

  const counts = Object.fromEntries(
    DEALS_FILTERS.map((f) => [f, applyFilter(scopeDeals, f, searchQuery).length])
  ) as Record<DealsFilter, number>;

  return (
    <DaylightShell
      title="Deals"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <DealsView
        scope={scope}
        filter={filter}
        search={searchQuery}
        teamId={teamId}
        dataError={dataError}
        totals={{
          dealCount: scopeDeals.length,
          totalValue,
          wonValue: stageValue("won"),
          lostValue: stageValue("lost"),
          activeValue,
          activeCount: activeDeals.length,
          atRiskValue: highRiskValue,
          atRiskCount: highRisk.length,
          newThisWeek,
          wonCount: closedWon.length,
        }}
        stages={stageFlow}
        inMotionValue={totalActiveInFlow}
        counts={counts}
        deals={sortedDeals.map(toRow)}
        nowMs={now.getTime()}
      />
    </DaylightShell>
  );
}
