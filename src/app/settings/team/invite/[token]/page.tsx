"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { acceptInvite } from "@/app/actions/teams";
import { getInviteByToken } from "@/app/actions/teams";
import { DashboardLayout } from "@/components/dashboard-layout";
import { toast } from "sonner";
import { TEAM_ROLES } from "@/lib/config";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [invite, setInvite] = useState<Awaited<ReturnType<typeof getInviteByToken>>>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }
    getInviteByToken(token)
      .then((data) => {
        setInvite(data);
        if (!data) setError("This invite has expired or is invalid.");
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setError(null);
    try {
      const team = await acceptInvite(token);
      toast.success(`You joined ${team.name}`);
      router.push(`/settings/team/${team.id}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept invite";
      setError(msg);
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full flex items-center justify-center max-sm:p-4 max-sm:py-8 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center max-sm:p-4 max-sm:mx-2"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {loading ? (
            <div className="py-12">
              <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse mx-auto mb-4" />
              <p className="text-sm text-white/40">Loading invite…</p>
            </div>
          ) : error || !invite ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid or expired invite</h2>
              <p className="text-sm text-white/40 mb-6">{error ?? "This invite is no longer valid."}</p>
              <Link
                href="/settings/team"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-colors"
              >
                Back to teams
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You&apos;re invited</h2>
              <p className="text-sm text-white/40 mb-2">
                Join <span className="font-semibold text-white">{invite.teamName}</span> as{" "}
                <span className="font-semibold text-white">{ROLE_LABELS[invite.role] ?? invite.role}</span>
              </p>
              <p className="text-xs text-white/30 mb-6">
                Invite sent to {invite.email}
              </p>
              {error && (
                <p className="text-sm text-red-400 mb-4">{error}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-sm:gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full max-sm:min-h-[44px]"
                >
                  {accepting ? "Joining…" : "Accept invite"}
                </button>
                <Link
                  href="/settings/team"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors text-center max-sm:w-full max-sm:min-h-[44px] max-sm:flex max-sm:items-center max-sm:justify-center"
                >
                  Decline
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
