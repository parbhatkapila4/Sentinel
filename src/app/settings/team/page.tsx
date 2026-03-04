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

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto max-sm:pb-6 overflow-x-hidden">
          <header className="mb-8">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Settings</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>Teams</span>
            </h1>
            <p className="mt-3 text-base text-white/60">
              Manage your teams and collaborators
            </p>
          </header>

          {teams.length === 0 ? (
            <div className={`${CARD_CLASS} text-center py-12 sm:py-16 max-w-lg mx-auto`}>
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-white/50 font-medium">No teams yet</p>
              <p className="text-white/40 text-sm mt-1.5 max-w-sm mx-auto">
                Create a team to collaborate on deals and invite members.
              </p>
              <Link
                href="/settings/team/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors mt-6 max-sm:w-full max-sm:min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create team
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/settings/team/${t.id}`}
                  className={`${CARD_CLASS} block`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0f766e]/20 flex items-center justify-center text-teal-400 text-lg font-bold shrink-0">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/70">
                      {ROLE_LABELS[t.myRole] ?? t.myRole}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{t.name}</h3>
                  <p className="text-sm text-white/50">
                    {t.memberCount} member{t.memberCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
