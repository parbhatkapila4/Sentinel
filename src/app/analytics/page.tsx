import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { AnalyticsView } from "@/components/sentinel/daylight/analytics/AnalyticsView";
import { deriveAnalytics } from "@/components/sentinel/daylight/analytics/derive";
import { parseRange } from "@/components/sentinel/daylight/analytics/model";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const range = parseRange(params?.range);

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

  const analytics = deriveAnalytics(
    allDealsRaw.map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      status: d.status,
      value: d.value,
      riskScore: d.riskScore,
      createdAt: new Date(d.createdAt).getTime(),
      urgency: d.recommendedAction?.urgency ?? null,
      action: d.recommendedAction?.label ?? null,
      location: d.location ?? null,
    })),
    range,
    now.getTime()
  );

  return (
    <DaylightShell
      title="Analytics"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <AnalyticsView
        range={range}
        dataError={dataError}
        hasAnyDeals={hasAnyDeals}
        {...analytics}
      />
    </DaylightShell>
  );
}
