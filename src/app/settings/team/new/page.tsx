"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTeam } from "@/app/actions/teams";
import { DashboardLayout } from "@/components/dashboard-layout";
import { toast } from "sonner";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a team name");
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", trimmed);
        const team = await createTeam(formData);
        toast.success("Team created");
        router.push(`/settings/team/${team.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create team";
        toast.error(msg);
      }
    });
  }

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto max-sm:pb-6 overflow-x-hidden">
          <header className="mb-8">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Settings</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Create a <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>team</span>
            </h1>
            <p className="mt-3 text-base text-white/60">
              Invite members and collaborate on deals.
            </p>
          </header>

          <form onSubmit={handleSubmit} className={`${CARD_CLASS} max-w-xl`}>
            <div className="border-l-2 border-[#0f766e] pl-3 mb-6">
              <h2 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">New team</h2>
            </div>
            <label className="block text-xs font-medium text-white/50 mb-2">
              Team name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Team"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors mb-6"
            />
            <div className="flex items-center gap-3 max-sm:flex-col max-sm:gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full max-sm:min-h-[44px]"
              >
                {isPending ? "Creating…" : "Create team"}
              </button>
              <Link
                href="/settings/team"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 border border-white/8 transition-colors max-sm:w-full max-sm:min-h-[44px] max-sm:flex max-sm:items-center max-sm:justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
