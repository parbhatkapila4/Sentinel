import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals, getFounderActionQueue } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { toBookDeal } from "@/components/sentinel/daylight/book";
import { AlertsView } from "@/components/sentinel/daylight/alerts/AlertsView";
import { deriveAlerts } from "@/components/sentinel/daylight/alerts/derive";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

export default async function RiskOverviewPage() {
  noStore();
  const now = new Date();

  let dealsRaw: RawDeal[] = [];
  let actionQueue: Awaited<ReturnType<typeof getFounderActionQueue>> = {
    urgent: [],
    important: [],
    safe: [],
  };
  let dataError = false;

  try {
    [dealsRaw, actionQueue] = await Promise.all([
      getAllDeals(),
      getFounderActionQueue(),
    ]);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/risk-overview");
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

  const alerts = deriveAlerts(
    dealsRaw.map(toBookDeal),
    {
      urgent: actionQueue.urgent.map((d) => d.id),
      important: actionQueue.important.map((d) => d.id),
      safe: actionQueue.safe.map((d) => d.id),
    },
    now.getTime()
  );

  return (
    <DaylightShell
      title="Alerts"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <AlertsView dataError={dataError} {...alerts} />
    </DaylightShell>
  );
}
