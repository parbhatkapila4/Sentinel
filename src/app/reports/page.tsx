import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { toBookDeal } from "@/components/sentinel/daylight/book";
import { ReportsView } from "@/components/sentinel/daylight/reports/ReportsView";
import { deriveReports } from "@/components/sentinel/daylight/reports/derive";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

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

  const nowMs = now.getTime();
  const reports = deriveReports(dealsRaw.map(toBookDeal), nowMs);

  return (
    <DaylightShell
      title="Reports"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <ReportsView dataError={dataError} nowMs={nowMs} {...reports} />
    </DaylightShell>
  );
}
