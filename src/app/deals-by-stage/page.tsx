import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { toBookDeal } from "@/components/sentinel/daylight/book";
import { ForecastView } from "@/components/sentinel/daylight/forecast/ForecastView";
import { deriveForecast } from "@/components/sentinel/daylight/forecast/derive";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

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

  const forecast = deriveForecast(dealsRaw.map(toBookDeal), now.getTime());

  return (
    <DaylightShell
      title="Forecast"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <ForecastView dataError={dataError} {...forecast} />
    </DaylightShell>
  );
}
