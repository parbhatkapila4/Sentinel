"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  removeTeamMember,
  updateMemberRole,
  leaveTeam,
  deleteTeam,
  inviteTeamMember,
} from "@/app/actions/teams";
import { TEAM_ROLES } from "@/lib/config";

import {
  EditorialButton,
  EditorialInput,
  EditorialSelect,
  Field,
} from "@/components/sentinel/settings/primitives";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

const EDITABLE_ROLES = [
  TEAM_ROLES.ADMIN,
  TEAM_ROLES.MEMBER,
  TEAM_ROLES.VIEWER,
];

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

function initials(name: string | null, surname: string | null): string {
  const n = (name || "").trim();
  const s = (surname || "").trim();
  if (n && s) return `${n[0]}${s[0]}`.toUpperCase();
  if (n) return n.slice(0, 2).toUpperCase();
  return "·";
}

function SectionHead({
  folio,
  title,
  deck,
  right,
}: {
  folio: string;
  title: React.ReactNode;
  deck?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 24,
        paddingBottom: 20,
        borderBottom: "1px solid var(--rule)",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          {folio}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--cream)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
        {deck && (
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--cream-2)",
              margin: 0,
            }}
          >
            {deck}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const tone =
    role === TEAM_ROLES.OWNER
      ? { color: "var(--copper)", border: "var(--copper)", bg: "rgba(198, 143, 78, 0.08)" }
      : role === TEAM_ROLES.ADMIN
        ? { color: "var(--ivy)", border: "var(--ivy)", bg: "rgba(116, 125, 79, 0.08)" }
        : { color: "var(--cream-2)", border: "var(--rule-strong)", bg: "transparent" };
  return (
    <span
      style={{
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "4px 10px",
        color: tone.color,
        border: `1px solid ${tone.border}`,
        background: tone.bg,
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function MemberRow({
  member,
  myRole,
  currentUserId,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  myRole: string;
  currentUserId: string;
  onRoleChange: (memberId: string, role: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const canChangeRole =
    myRole === TEAM_ROLES.OWNER && member.role !== TEAM_ROLES.OWNER;
  const canRemove =
    (myRole === TEAM_ROLES.OWNER || myRole === TEAM_ROLES.ADMIN) &&
    member.role !== TEAM_ROLES.OWNER &&
    member.userId !== currentUserId;

  const displayName =
    [member.user.name, member.user.surname].filter(Boolean).join(" ") ||
    member.user.email;

  return (
    <div
      className="sentinel-row-hover"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        alignItems: "center",
        gap: 18,
        padding: "16px 20px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 40,
          height: 40,
          border: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
        }}
      >
        {initials(member.user.name, member.user.surname)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--cream)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
          {member.userId === currentUserId && (
            <span
              style={{
                marginLeft: 10,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "var(--signal)",
              }}
            >
              - YOU
            </span>
          )}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            color: "var(--cream-3)",
            letterSpacing: "0.06em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.user.email}
        </span>
      </div>

      <div style={{ position: "relative" }}>
        {canChangeRole ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={busy}
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "7px 12px",
                border: "1px solid var(--rule-strong)",
                background: "transparent",
                color: "var(--cream-2)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {ROLE_LABELS[member.role] ?? member.role}
              <span style={{ fontSize: 8 }}>▾</span>
            </button>
            {menuOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    zIndex: 20,
                    minWidth: 140,
                    background: "var(--ink)",
                    border: "1px solid var(--rule-strong)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  }}
                >
                  {EDITABLE_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        setBusy(true);
                        try {
                          await onRoleChange(member.id, r);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 11,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: r === member.role ? "var(--signal)" : "var(--cream-2)",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid var(--rule)",
                        cursor: "pointer",
                      }}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>

      {canRemove ? (
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            try {
              await onRemove(member.id);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "7px 12px",
            border: "1px solid var(--wine)",
            background: "transparent",
            color: "var(--wine)",
            cursor: "pointer",
          }}
        >
          {busy ? "…" : "Remove"}
        </button>
      ) : (
        <span style={{ width: 84 }} aria-hidden />
      )}
    </div>
  );
}

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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>(TEAM_ROLES.MEMBER);
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [pending] = useTransition();

  const isOwner = myRole === TEAM_ROLES.OWNER;
  const isOwnerOrAdmin = isOwner || myRole === TEAM_ROLES.ADMIN;
  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const rank: Record<string, number> = {
          [TEAM_ROLES.OWNER]: 0,
          [TEAM_ROLES.ADMIN]: 1,
          [TEAM_ROLES.MEMBER]: 2,
          [TEAM_ROLES.VIEWER]: 3,
        };
        return (rank[a.role] ?? 9) - (rank[b.role] ?? 9);
      }),
    [members]
  );

  async function handleRoleChange(memberId: string, role: string) {
    try {
      await updateMemberRole(teamId, memberId, role);
      toast.success("Role updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeTeamMember(teamId, memberId);
      toast.success("Member removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove member");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Enter an email address");
      return;
    }
    setInviting(true);
    try {
      await inviteTeamMember(teamId, trimmed, inviteRole);
      toast.success(`Invite sent to ${trimmed}`);
      setInviteEmail("");
      setInviteRole(TEAM_ROLES.MEMBER);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await leaveTeam(teamId);
      toast.success("You left the team");
      router.push("/settings/team");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave team");
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete team");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
      <section>
        <SectionHead
          folio="§ 05.01 - MEMBERS"
          title={
            <>
              Who sits at the{" "}
              <em style={{ fontStyle: "italic", color: "var(--signal)" }}>desk</em>.
            </>
          }
          deck="Change seats, promote, or let go. Only owners can make owners."
          right={
            <span style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.14em", color: "var(--cream-3)", textTransform: "uppercase" }}>
              {members.length} ON THE BOOK
            </span>
          }
        />
        <div style={{ border: "1px solid var(--rule)", borderBottom: "none" }}>
          {sortedMembers.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              myRole={myRole}
              currentUserId={currentUserId ?? ""}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </section>

      {isOwnerOrAdmin && (
        <section>
          <SectionHead
            folio="§ 05.02 - INVITE"
            title={
              <>
                Call another{" "}
                <em style={{ fontStyle: "italic", color: "var(--signal)" }}>colleague</em>.
              </>
            }
            deck="Send a letter. They'll see it next time they open the desk."
          />
          <form
            onSubmit={handleInvite}
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              padding: "24px 22px",
              display: "grid",
              gridTemplateColumns: "1fr 200px auto",
              gap: 16,
              alignItems: "end",
            }}
          >
            <Field label="Email" note="REQUIRED">
              <EditorialInput
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                disabled={inviting || pending}
              />
            </Field>
            <Field label="Role">
              <EditorialSelect
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={inviting || pending}
              >
                {EDITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </EditorialSelect>
            </Field>
            <EditorialButton
              type="submit"
              variant="primary"
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending…" : "Send invite"}
            </EditorialButton>
          </form>

          {invites.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--rule)",
                  marginBottom: 0,
                }}
              >
                § - PENDING
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  border: "1px solid var(--rule)",
                  borderTop: "none",
                }}
              >
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      alignItems: "center",
                      gap: 20,
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 15,
                        color: "var(--cream)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inv.email}
                    </span>
                    <RoleBadge role={inv.role} />
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.18em",
                        color: "var(--copper)",
                        textTransform: "uppercase",
                      }}
                    >
                      INVITE PENDING
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {!isOwner && (
        <section>
          <SectionHead
            folio="§ 05.03 - EXIT"
            title="Leave this team."
            deck="You will lose access to every deal on this desk."
          />
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              padding: "24px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-2)",
                margin: 0,
                maxWidth: 520,
              }}
            >
              A polite goodbye. The owner will still keep the desk running; you just won&apos;t be at it anymore.
            </p>
            <EditorialButton
              type="button"
              onClick={handleLeave}
              disabled={leaving}
              variant="danger"
            >
              {leaving ? "Leaving…" : "Leave team"}
            </EditorialButton>
          </div>
        </section>
      )}

      {isOwner && (
        <section>
          <div
            style={{
              border: "1px solid var(--wine)",
              background: "rgba(119, 47, 47, 0.04)",
              padding: "28px 24px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--wine)",
                marginBottom: 10,
              }}
            >
              § † - DANGER ZONE · IRREVERSIBLE
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                fontWeight: 400,
                color: "var(--wine)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Delete <em style={{ fontStyle: "italic" }}>{teamName}</em>.
            </h3>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-2)",
                margin: "12px 0 24px",
                maxWidth: 640,
              }}
            >
              The desk will be closed for good. Its deals return to their owners as personal deals. This cannot be undone.
            </p>
            <EditorialButton
              type="button"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete team
            </EditorialButton>
          </div>
        </section>
      )}

      {showDeleteModal && (
        <>
          <div
            onClick={() => !deleting && setShowDeleteModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(18, 18, 18, 0.72)",
              backdropFilter: "blur(4px)",
              zIndex: 60,
            }}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 70,
              width: "calc(100% - 32px)",
              maxWidth: 520,
              background: "var(--ink)",
              border: "1px solid var(--wine)",
              padding: "32px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--wine)",
                marginBottom: 14,
              }}
            >
              § † - CONFIRM
            </div>
            <h4
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 30,
                fontWeight: 400,
                color: "var(--cream)",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Delete <em style={{ fontStyle: "italic", color: "var(--wine)" }}>{teamName}</em>?
            </h4>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 14,
                color: "var(--cream-2)",
                margin: "0 0 20px",
              }}
            >
              Type <strong style={{ fontFamily: "var(--font-mono-jb)", fontStyle: "normal", color: "var(--wine)" }}>DELETE</strong> to confirm.
            </p>
            <Field label="Confirmation">
              <EditorialInput
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="DELETE"
                autoFocus
                disabled={deleting}
              />
            </Field>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid var(--rule)",
              }}
            >
              <EditorialButton
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </EditorialButton>
              <EditorialButton
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting || deleteConfirmInput !== "DELETE"}
              >
                {deleting ? "Deleting…" : "Delete team"}
              </EditorialButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
