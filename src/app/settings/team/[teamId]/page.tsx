import { notFound, redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { format } from "date-fns";

import { getTeamById, getTeamInvites } from "@/app/actions/teams";
import { getAuthenticatedUserId } from "@/lib/auth";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import { TeamDetailView } from "@/components/sentinel/daylight/teams/TeamDetailView";
import {
  heroClause,
  inviteLine,
  isOwnerOrAdmin,
} from "@/components/sentinel/daylight/teams/model";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  noStore();
  const { teamId } = await params;
  let team;
  let invites: Awaited<ReturnType<typeof getTeamInvites>> = [];

  try {
    team = await getTeamById(teamId);
  } catch {
    notFound();
  }

  let currentUserId: string;
  try {
    currentUserId = await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=" + encodeURIComponent("/settings/team/" + teamId));
  }

  if (isOwnerOrAdmin(team.myRole)) {
    try {
      invites = await getTeamInvites(teamId);
    } catch {
      invites = [];
    }
  }

  const shellContext = await buildShellContextForPage();
  const now = new Date();

  return (
    <DaylightShell
      title="Teams"
      dateLabel={format(now, "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <TeamDetailView
        team={{
          id: team.id,
          name: team.name,
          clause: heroClause(team.members.length, team.createdAt, now),
        }}
        myRole={team.myRole}
        currentUserId={currentUserId}
        members={team.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          user: m.user,
        }))}
        invites={invites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          line: inviteLine(new Date(inv.createdAt), new Date(inv.expiresAt), now),
        }))}
      />
    </DaylightShell>
  );
}
