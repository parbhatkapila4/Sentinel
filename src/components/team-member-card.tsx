"use client";

import { useState } from "react";
import { TEAM_ROLES } from "@/lib/config";

type Member = {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    surname: string | null;
    email: string;
  };
};

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

function initials(name: string | null, surname: string | null): string {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  if (n && s) return `${n[0]}${s[0]}`.toUpperCase();
  if (n) return n.slice(0, 2).toUpperCase();
  return "?";
}

export function TeamMemberCard({
  member,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  currentUserRole: string;
  currentUserId: string;
  onRoleChange?: (memberId: string, newRole: string) => void;
  onRemove?: (memberId: string) => void;
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [removing, setRemoving] = useState(false);

  const canChangeRole =
    (currentUserRole === TEAM_ROLES.OWNER) &&
    member.role !== TEAM_ROLES.OWNER &&
    onRoleChange;

  const canRemove =
    (currentUserRole === TEAM_ROLES.OWNER ||
      currentUserRole === TEAM_ROLES.ADMIN) &&
    member.role !== TEAM_ROLES.OWNER &&
    onRemove;

  const editableRoles = [TEAM_ROLES.ADMIN, TEAM_ROLES.MEMBER, TEAM_ROLES.VIEWER];

  const displayName = [member.user.name, member.user.surname]
    .filter(Boolean)
    .join(" ") || member.user.email || "Unknown";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors max-sm:flex-col max-sm:items-stretch max-sm:gap-3">
      <div className="flex items-center gap-4 max-sm:min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b1a1a] to-[#6b0f0f] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials(member.user.name, member.user.surname)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-white/40 truncate">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-end">
        <div className="relative">
          {canChangeRole ? (
            <>
              <button
                type="button"
                onClick={() => setShowRoleMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors max-sm:min-h-[44px]"
              >
                {ROLE_LABELS[member.role] || member.role}
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden="true"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 py-1 rounded-xl bg-[#131313] border border-[#1f1f1f] shadow-xl z-20 min-w-[120px]">
                    {editableRoles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          onRoleChange?.(member.id, r);
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60">
              {ROLE_LABELS[member.role] || member.role}
            </span>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            disabled={removing || member.userId === currentUserId}
            onClick={async () => {
              if (!onRemove) return;
              setRemoving(true);
              try {
                await onRemove(member.id);
              } finally {
                setRemoving(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:min-h-[44px]"
          >
            {removing ? "…" : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}
