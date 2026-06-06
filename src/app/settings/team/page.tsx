import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth";
import { getMyTeams } from "@/app/actions/teams";
import { TEAM_ROLES } from "@/lib/config";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

const ROLE_TONE: Record<string, "ivy" | "copper" | "wine" | "cream"> = {
  [TEAM_ROLES.OWNER]: "copper",
  [TEAM_ROLES.ADMIN]: "ivy",
  [TEAM_ROLES.MEMBER]: "cream",
  [TEAM_ROLES.VIEWER]: "cream",
};

const TONE_STYLES: Record<"ivy" | "copper" | "wine" | "cream", { color: string; border: string; bg: string }> = {
  ivy: { color: "var(--ivy)", border: "var(--ivy)", bg: "rgba(116, 125, 79, 0.08)" },
  copper: { color: "var(--copper)", border: "var(--copper)", bg: "rgba(198, 143, 78, 0.08)" },
  wine: { color: "var(--wine)", border: "var(--wine)", bg: "rgba(119, 47, 47, 0.08)" },
  cream: { color: "var(--cream-2)", border: "var(--rule-strong)", bg: "transparent" },
};

function teamInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "·";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

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
          position: "relative",
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 0,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 60, lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § 05
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>TEAMS · ROSTER</strong>
            <br />
            {teams.length} {teams.length === 1 ? "desk" : "desks"}
            <br />
            HANDS ON DECK
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Settings · Teams
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--cream)",
              margin: 0,
            }}
          >
            The{" "}
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              roster.
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.45,
              color: "var(--cream-2)",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Where the desks are kept. Invite collaborators, assign roles, and decide who sees which deal.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Link
            href="/settings/team/new"
            className="sentinel-editorial-btn sentinel-editorial-btn--primary"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "11px 22px",
              background: "var(--signal)",
              color: "var(--cream)",
              border: "1px solid var(--signal)",
              textDecoration: "none",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            + New team
          </Link>
          <span style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.14em", color: "var(--cream-3)", textTransform: "uppercase" }}>
            Call a meeting
          </span>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          padding: "0 32px",
          borderBottom: "1px solid var(--rule)",
          alignItems: "center",
        }}
      >
        <div style={{ padding: "16px 24px 16px 0", borderRight: "1px solid var(--rule)", fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
          § 05 - ROSTER
        </div>
        <div style={{ padding: "16px 24px", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--cream-2)" }}>
          Every team you belong to, in order of tenure.
        </div>
        <div style={{ padding: "16px 0", fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-3)" }}>
          {teams.length} on the book
        </div>
      </div>

      <section style={{ padding: "48px 32px 80px", maxWidth: 1400, margin: "0 auto" }}>
        {teams.length === 0 ? (
          <div
            style={{
              padding: "64px 40px",
              textAlign: "center",
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.24em", color: "var(--cream-3)", textTransform: "uppercase", marginBottom: 14 }}>
              § - empty
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 34,
                fontStyle: "italic",
                color: "var(--cream)",
                margin: "0 0 14px",
                letterSpacing: "-0.02em",
              }}
            >
              No team on the book, yet.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-2)",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Call the first colleague. A desk is only a desk when someone else is reading the same book.
            </p>
            <Link
              href="/settings/team/new"
              className="sentinel-editorial-btn sentinel-editorial-btn--primary"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "11px 22px",
                background: "var(--signal)",
                color: "var(--cream)",
                border: "1px solid var(--signal)",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Create the first team
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 0,
              border: "1px solid var(--rule)",
              borderBottom: "none",
            }}
          >
            {teams.map((t) => {
              const toneKey = ROLE_TONE[t.myRole] ?? "cream";
              const tone = TONE_STYLES[toneKey];
              return (
                <Link
                  key={t.id}
                  href={`/settings/team/${t.id}`}
                  className="sentinel-team-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    padding: "28px 24px",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                    color: "inherit",
                    textDecoration: "none",
                    background: "transparent",
                    transition: "background 160ms ease",
                    minHeight: 180,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div
                      aria-hidden
                      style={{
                        width: 48,
                        height: 48,
                        border: "1px solid var(--rule-strong)",
                        background: "var(--ink-02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 22,
                        color: "var(--cream)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {teamInitials(t.name)}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        color: tone.color,
                        border: `1px solid ${tone.border}`,
                        background: tone.bg,
                      }}
                    >
                      {ROLE_LABELS[t.myRole] ?? t.myRole}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 24,
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        color: "var(--cream)",
                        margin: 0,
                        lineHeight: 1.1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--cream-3)",
                        margin: 0,
                      }}
                    >
                      {t.memberCount} {t.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--signal)",
                    }}
                  >
                    Open desk →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SentinelShell>
  );
}
