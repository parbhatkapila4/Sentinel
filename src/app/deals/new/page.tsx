import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";
import { NewDealClient } from "./new-deal-client";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/deals/new");
  }

  const shellContext = await buildShellContextForPage();

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      <NewDealClient />
    </SentinelShell>
  );
}
