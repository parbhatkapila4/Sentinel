import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { getTeamById, getTeamInvites } from "@/app/actions/teams";
import { getAuthenticatedUserId } from "@/lib/auth";
import { TEAM_ROLES } from "@/lib/config";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";
import { TeamDetailClient } from "./team-detail-client";

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

  if (team.myRole === TEAM_ROLES.OWNER || team.myRole === TEAM_ROLES.ADMIN) {
    try {
      invites = await getTeamInvites(teamId);
    } catch {
      invites = [];
    }
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
      <section
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) minmax(220px, 260px)",
          gap: 48,
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 60, lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § 05
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>TEAM · DESK</strong>
            <br />
            {team.members.length} ON THE BOOK
            <br />
            {(ROLE_LABELS[team.myRole] ?? team.myRole).toUpperCase()} SEAT
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <Link
            href="/settings/team"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to roster
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 54,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "var(--cream)",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              {team.name}
            </em>
            .
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.45,
              color: "var(--cream-2)",
              margin: 0,
            }}
          >
            {ROLE_LABELS[team.myRole] ?? team.myRole} - {team.members.length}{" "}
            {team.members.length === 1 ? "colleague" : "colleagues"} on the desk.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            SEAT
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "6px 12px",
              color: "var(--cream)",
              border: "1px solid var(--signal)",
              background: "rgba(200, 71, 46, 0.06)",
            }}
          >
            {ROLE_LABELS[team.myRole] ?? team.myRole}
          </span>
        </div>
      </section>

      <section style={{ padding: "48px 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <TeamDetailClient
          teamId={team.id}
          teamName={team.name}
          myRole={team.myRole}
          members={team.members}
          invites={invites}
          currentUserId={currentUserId}
        />
      </section>
    </SentinelShell>
  );
}
