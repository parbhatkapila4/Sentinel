"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  removeTeamMember,
  updateMemberRole,
  leaveTeam,
  deleteTeam,
} from "@/app/actions/teams";
import { TeamMemberCard } from "@/components/team-member-card";
import { TeamInviteForm } from "@/components/team-invite-form";
import { TEAM_ROLES } from "@/lib/config";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

type Member = {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; surname: string | null; email: string };
};

type Invite = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
};

export function TeamDetailClient({
  teamId,
  teamName,
  myRole,
  members,
  invites,
  currentUserId,
}: {
  teamId: string;
  teamName: string;
  myRole: string;
  members: Member[];
  invites: Invite[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isOwner = myRole === TEAM_ROLES.OWNER;
  const isOwnerOrAdmin = isOwner || myRole === TEAM_ROLES.ADMIN;

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      await updateMemberRole(teamId, memberId, newRole);
      toast.success("Role updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeTeamMember(teamId, memberId);
      toast.success("Member removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await leaveTeam(teamId);
      toast.success("You left the team");
      router.push("/settings/team");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to leave team");
    } finally {
      setLeaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTeam(teamId);
      toast.success("Team deleted");
      router.push("/settings/team");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  const cardStyle = {
    background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div className="space-y-8 max-sm:space-y-6">
      <div className="rounded-2xl p-6 max-sm:p-4" style={cardStyle}>
        <h3 className="text-lg font-semibold text-white mb-4 max-sm:mb-3">Members</h3>
        <div className="space-y-3">
          {members.map((m) => (
            <TeamMemberCard
              key={m.id}
              member={m}
              currentUserRole={myRole}
              currentUserId={currentUserId ?? ""}
              onRoleChange={isOwner ? handleRoleChange : undefined}
              onRemove={isOwnerOrAdmin ? handleRemove : undefined}
            />
          ))}
        </div>
      </div>

      {isOwnerOrAdmin && (
        <div className="rounded-2xl p-6 max-sm:p-4" style={cardStyle}>
          <h3 className="text-lg font-semibold text-white mb-4 max-sm:mb-3">Invite members</h3>
          <TeamInviteForm teamId={teamId} onInvited={() => router.refresh()} />
          {invites.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5 max-sm:mt-4 max-sm:pt-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Pending invites
              </p>
              <ul className="space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 max-sm:flex-col max-sm:items-stretch max-sm:gap-2"
                  >
                    <span className="text-sm text-white truncate">{inv.email}</span>
                    <span className="text-xs text-white/40 px-2 py-1 rounded-lg bg-white/5 max-sm:self-start">
                      {ROLE_LABELS[inv.role] ?? inv.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isOwner && (
        <div className="rounded-2xl p-6 max-sm:p-4" style={cardStyle}>
          <h3 className="text-lg font-semibold text-white mb-2">Leave team</h3>
          <p className="text-sm text-white/40 mb-4 max-sm:mb-3">
            You will lose access to this team&apos;s deals.
          </p>
          <button
            type="button"
            onClick={handleLeave}
            disabled={leaving}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50 max-sm:w-full max-sm:min-h-[44px]"
          >
            {leaving ? "Leaving…" : "Leave team"}
          </button>
        </div>
      )}

      {isOwner && (
        <div
          className="rounded-2xl p-6 max-sm:p-4"
          style={{
            background: "linear-gradient(145deg, rgba(239,68,68,0.05) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-2">Danger zone</h3>
          <p className="text-sm text-white/40 mb-4 max-sm:mb-3">
            Permanently delete this team. Team deals will become personal deals.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors max-sm:w-full max-sm:min-h-[44px]"
          >
            Delete team
          </button>
        </div>
      )}

      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            aria-hidden="true"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-sm:left-4 max-sm:right-4 max-sm:translate-x-0 max-sm:-translate-y-1/2 rounded-2xl p-6 max-sm:p-4 bg-[#131313] border border-[#1f1f1f] shadow-xl">
            <h4 className="text-lg font-semibold text-white mb-2">Delete team?</h4>
            <p className="text-sm text-white/50 mb-6">
              &quot;{teamName}&quot; will be permanently deleted. All team deals will
              become personal deals.
            </p>
            <div className="flex gap-3 justify-end max-sm:flex-col-reverse max-sm:gap-2">
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 max-sm:w-full max-sm:min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50 max-sm:w-full max-sm:min-h-[44px]"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
