import Link from "next/link";
import { getMyTeams } from "@/app/actions/teams";
import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export default async function TeamSettingsPage() {
  let teams: Awaited<ReturnType<typeof getMyTeams>> = [];
  try {
    teams = await getMyTeams();
  } catch {
    teams = [];
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="flex items-start justify-between mb-6 max-sm:flex-col max-sm:gap-4 max-sm:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 max-sm:text-xl">Teams</h1>
            <p className="text-sm text-white/40">
              Manage your teams and collaborators
            </p>
          </div>
          <Link
            href="/settings/team/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 max-sm:w-full max-sm:min-h-[44px] max-sm:shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Team
          </Link>
        </div>

        {teams.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center max-sm:p-6"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No teams yet
            </h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Create a team to collaborate on deals and invite members.
            </p>
            <Link
              href="/settings/team/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 transition-colors max-sm:w-full max-sm:min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Team
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1">
            {teams.map((t) => (
              <Link
                key={t.id}
                href={`/settings/team/${t.id}`}
                className="block rounded-2xl p-6 transition-all hover:bg-white/[0.04] border border-white/5 hover:border-white/10"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white text-lg font-bold">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/70">
                    {ROLE_LABELS[t.myRole] ?? t.myRole}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {t.name}
                </h3>
                <p className="text-sm text-white/40">
                  {t.memberCount} member{t.memberCount !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
