import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById, getTeamInvites } from "@/app/actions/teams";
import { getAuthenticatedUserId } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TeamDetailClient } from "./team-detail-client";
import { TEAM_ROLES } from "@/lib/config";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
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
    notFound();
  }

  if (team.myRole === TEAM_ROLES.OWNER || team.myRole === TEAM_ROLES.ADMIN) {
    try {
      invites = await getTeamInvites(teamId);
    } catch {
      invites = [];
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <Link
          href="/settings/team"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 min-h-[44px] items-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to teams
        </Link>

        <div className="flex items-start justify-between mb-8 max-sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1 max-sm:text-xl truncate">{team.name}</h1>
            <p className="text-sm text-white/40">
              {ROLE_LABELS[team.myRole] ?? team.myRole} · {team.members.length} member
              {team.members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <TeamDetailClient
          teamId={team.id}
          teamName={team.name}
          myRole={team.myRole}
          members={team.members}
          invites={invites}
          currentUserId={currentUserId}
        />
      </div>
    </DashboardLayout>
  );
}
