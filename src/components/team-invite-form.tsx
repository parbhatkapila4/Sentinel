"use client";

import { useState } from "react";
import { inviteTeamMember } from "@/app/actions/teams";
import { TEAM_ROLES } from "@/lib/config";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: TEAM_ROLES.ADMIN, label: "Admin" },
  { value: TEAM_ROLES.MEMBER, label: "Member" },
  { value: TEAM_ROLES.VIEWER, label: "Viewer" },
];

export function TeamInviteForm({
  teamId,
  onInvited,
}: {
  teamId: string;
  onInvited?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(TEAM_ROLES.MEMBER);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Please enter an email address");
      return;
    }
    setPending(true);
    try {
      await inviteTeamMember(teamId, trimmed, role);
      toast.success(`Invite sent to ${trimmed}`);
      setEmail("");
      setRole(TEAM_ROLES.MEMBER);
      onInvited?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send invite";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-4">
      <div className="flex-1 min-w-[200px] max-sm:min-w-0">
        <label
          htmlFor="invite-email"
          className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5"
        >
          Email
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>
      <div className="w-36 max-sm:w-full">
        <label
          htmlFor="invite-role"
          className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5"
        >
          Role
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#131313]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-3 rounded-xl text-sm font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:min-h-[44px]"
      >
        {pending ? "Sending…" : "Send Invite"}
      </button>
    </form>
  );
}
