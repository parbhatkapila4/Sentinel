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

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="max-w-xl max-sm:max-w-none">
          <Link
            href="/settings/team"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 min-h-[44px] items-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to teams
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2 max-sm:text-xl">Create a team</h1>
          <p className="text-sm text-white/40 mb-8 max-sm:mb-6">
            Invite members and collaborate on deals.
          </p>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-6 max-sm:p-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Team name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Team"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-red-600/50 transition-colors mb-6"
            />
            <div className="flex items-center gap-3 max-sm:flex-col max-sm:gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full max-sm:min-h-[44px]"
              >
                {isPending ? "Creating…" : "Create team"}
              </button>
              <Link
                href="/settings/team"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors max-sm:w-full max-sm:min-h-[44px] max-sm:flex max-sm:items-center max-sm:justify-center"
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
