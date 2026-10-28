import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { NewTeamView } from "@/components/sentinel/daylight/teams/NewTeamView";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  noStore();
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/settings/team/new");
  }

  const shellContext = await buildShellContextForPage();

  return (
    <DaylightShell
      title="New team"
      dateLabel={format(new Date(), "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <NewTeamView />
    </DaylightShell>
  );
}
