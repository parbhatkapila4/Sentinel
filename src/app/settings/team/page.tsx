import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getMyTeams } from "@/app/actions/teams";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { TeamsListView } from "@/components/sentinel/daylight/teams/TeamsListView";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  noStore();

  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/settings/team");
  }

  let teams: Awaited<ReturnType<typeof getMyTeams>> = [];
  try {
    teams = await getMyTeams();
  } catch {
    teams = [];
  }

  const shellContext = await buildShellContextForPage();

  return (
    <DaylightShell
      title="Teams"
      dateLabel={format(new Date(), "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <TeamsListView
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          memberCount: t.memberCount,
          myRole: t.myRole,
          createdAt: t.createdAt,
        }))}
      />
    </DaylightShell>
  );
}
