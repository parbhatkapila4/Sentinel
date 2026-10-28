import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { NewDealView } from "@/components/sentinel/daylight/new-deal/NewDealView";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/deals/new");
  }

  const now = new Date();
  const shellContext = await buildShellContextForPage();

  return (
    <DaylightShell
      title="New deal"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <NewDealView />
    </DaylightShell>
  );
}
