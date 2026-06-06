import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { SettingsClient } from "@/components/sentinel/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/settings");
  }

  let dealsRaw: Awaited<ReturnType<typeof getAllDeals>> = [];
  try {
    dealsRaw = await getAllDeals();
  } catch {
    dealsRaw = [];
  }

  let integrationStatuses: Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null = null;
  try {
    integrationStatuses = await getAllIntegrationStatuses();
  } catch {
    integrationStatuses = null;
  }

  const hasAnyDeals = dealsRaw.length > 0;
  const isDemoMode =
    dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const deals = mapRawDealsToSentinel(dealsRaw);

  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent: 0,
    hasAnyDeals,
    isDemoMode,
    now: new Date(),
  });

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      <Suspense fallback={null}>
        <SettingsClient />
      </Suspense>
    </SentinelShell>
  );
}
