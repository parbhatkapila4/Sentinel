import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { SettingsClient } from "@/components/sentinel/settings/SettingsClient";
import { SettingsBodySkeleton } from "@/components/sentinel/daylight/settings/SettingsSkeleton";
import { SectionNav } from "@/components/sentinel/daylight/settings/SectionNav";

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

  const now = new Date();
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent: 0,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  return (
    <DaylightShell
      title="Settings"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
      pageNav={<SectionNav placement="sidebar" />}
    >
      <Suspense fallback={<SettingsBodySkeleton />}>
        <SettingsClient />
      </Suspense>
    </DaylightShell>
  );
}
