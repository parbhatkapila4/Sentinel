"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteTeam,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  transferTeamOwnership,
  updateMemberRole,
} from "@/app/actions/teams";
import { TEAM_ROLES } from "@/lib/config";

import {
  DividerRow,
  HeroLink,
  PageHero,
  Pill,
  dangerButtonStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  smallButtonStyle,
} from "../blocks";
import { ConfirmDialog } from "../ConfirmDialog";
import { SelectField } from "../controls";
import { Menu, menuItemStyle, usePopover } from "../Popover";
import { Row } from "../settings/parts";
import {
  ASSIGNABLE_ROLES,
  emailInitial,
  heroDeck,
  isOwner,
  isOwnerOrAdmin,
  membersSub,
  personInitials,
  personName,
  roleLabel,
  seatChip,
  sortByRole,
} from "./model";
import { MoreVerticalIcon, Person, TeamSection, moreButtonStyle } from "./parts";

export interface TeamMemberRow {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; surname: string | null; email: string };
}

export interface PendingInviteRow {
  id: string;
  email: string;
  role: string;
  line: string;
}

export interface TeamDetailViewProps {
  team: { id: string; name: string; clause: string };
  myRole: string;
  currentUserId: string;
  members: TeamMemberRow[];
  invites: PendingInviteRow[];
}

type DialogTarget =
  | { kind: "remove"; member: TeamMemberRow }
  | { kind: "owner"; member: TeamMemberRow }
  | { kind: "leave" }
  | { kind: "delete" };

type OpenDialog = DialogTarget & {
  host: Element;
  trigger: HTMLElement;
  key: number;
};

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function MemberRow({
  member,
  me,
  canChangeRole,
  canRemove,
  role,
  roleBusy,
  onRole,
  onAsk,
}: {
  member: TeamMemberRow;
  me: boolean;
  canChangeRole: boolean;
  canRemove: boolean;
  role: string;
  roleBusy: boolean;
  onRole: (member: TeamMemberRow, role: string) => void;
  onAsk: (target: DialogTarget, trigger: HTMLElement) => void;
}) {
  const name = personName(member.user);
  const { open, anchor, triggerRef, panelRef, toggle, close } = usePopover({
    side: "auto",
    align: "end",
    gap: 6,
  });

  const ask = (target: DialogTarget) => {
    const trigger = triggerRef.current;
    close();
    if (trigger) onAsk(target, trigger);
  };

  return (
    <div className="dl-mb-row">
      <Person
        initials={personInitials(member.user)}
        name={name}
        detail={member.user.email}
        me={me}
      />
      <div className="dl-mb-ctl">
        {canChangeRole ? (
          <SelectField
            aria-label={`Role for ${name}`}
            value={role}
            disabled={roleBusy}
            onChange={(e) => onRole(member, e.target.value)}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </SelectField>
        ) : (
          <Pill>{roleLabel(member.role)}</Pill>
        )}
        {(canChangeRole || canRemove) && (
          <>
            <button
              ref={triggerRef}
              type="button"
              onClick={toggle}
              aria-label={`More for ${name}`}
              aria-haspopup="menu"
              aria-expanded={open}
              className="dl-icon-btn"
              style={moreButtonStyle}
            >
              <MoreVerticalIcon />
            </button>
            <Menu
              anchor={anchor}
              panelRef={panelRef}
              onClose={close}
              label={`More for ${name}`}
              width={190}
            >
              {canChangeRole && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => ask({ kind: "owner", member })}
                  className="dl-menu-item"
                  style={menuItemStyle}
                >
                  Make owner
                </button>
              )}
              {canRemove && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => ask({ kind: "remove", member })}
                  className="dl-menu-item"
                  style={{ ...menuItemStyle, color: "var(--dl-signal-d)" }}
                >
                  Remove from team
                </button>
              )}
            </Menu>
          </>
        )}
      </div>
    </div>
  );
}

export function TeamDetailView({
  team,
  myRole,
  currentUserId,
  members,
  invites,
}: TeamDetailViewProps) {
  const router = useRouter();
  const owner = isOwner(myRole);
  const canInvite = isOwnerOrAdmin(myRole);
  const sorted = useMemo(() => sortByRole(members), [members]);

  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>(TEAM_ROLES.MEMBER);
  const [inviting, setInviting] = useState(false);
  const [linkPanel, setLinkPanel] = useState<{ email: string; url: string } | null>(null);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const openings = useRef(0);

  useEffect(() => {
    setRoleDrafts({});
  }, [members]);

  function ask(target: DialogTarget, trigger: HTMLElement) {
    const host = trigger.closest(".sentinel-daylight");
    if (!host) return;
    setDialogError(null);
    openings.current += 1;
    setDialog({ ...target, host, trigger, key: openings.current });
  }

  function closeDialog() {
    if (dialogBusy) return;
    setDialog(null);
    setDialogError(null);
  }

  async function changeRole(member: TeamMemberRow, role: string) {
    setRoleDrafts((d) => ({ ...d, [member.id]: role }));
    setRoleBusyId(member.id);
    try {
      await updateMemberRole(team.id, member.id, role);
      toast.success("Role updated");
      router.refresh();
    } catch (e) {
      setRoleDrafts((d) => {
        const next = { ...d };
        delete next[member.id];
        return next;
      });
      toast.error(errorText(e, "Failed to update role"));
    } finally {
      setRoleBusyId(null);
    }
  }

  async function confirmDialog() {
    if (!dialog) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      if (dialog.kind === "remove") {
        await removeTeamMember(team.id, dialog.member.id);
        toast.success("Member removed");
        router.refresh();
      } else if (dialog.kind === "owner") {
        await transferTeamOwnership(team.id, dialog.member.userId);
        toast.success(`${personName(dialog.member.user)} is now the owner`);
        router.refresh();
      } else if (dialog.kind === "leave") {
        await leaveTeam(team.id);
        toast.success("You left the team");
        router.push("/settings/team");
        router.refresh();
      } else {
        await deleteTeam(team.id);
        toast.success("Team deleted");
        router.push("/settings/team");
        router.refresh();
      }
      setDialog(null);
    } catch (e) {
      const fallback =
        dialog.kind === "remove"
          ? "Failed to remove member"
          : dialog.kind === "owner"
            ? "Failed to transfer ownership"
            : dialog.kind === "leave"
              ? "Failed to leave team"
              : "Failed to delete team";
      setDialogError(errorText(e, fallback));
    } finally {
      setDialogBusy(false);
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
      const invite = await inviteTeamMember(team.id, trimmed, inviteRole);
      if (invite.emailSent) {
        setLinkPanel(null);
        toast.success(`Invitation email sent to ${trimmed}`);
      } else {
        setLinkPanel({ email: trimmed, url: invite.inviteUrl });
        toast.message(`Invite created for ${trimmed}. Copy the link below to share it.`);
      }
      setInviteEmail("");
      setInviteRole(TEAM_ROLES.MEMBER);
      router.refresh();
    } catch (err) {
      toast.error(errorText(err, "Failed to create invite"));
    } finally {
      setInviting(false);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy it yourself.");
    }
  }

  const dialogProps = dialog ? describeDialog(dialog, team.name) : null;

  return (
    <>
      <PageHero
        label="Team"
        back={{ href: "/settings/team", label: "Teams" }}
        chip={{ label: seatChip(myRole), tone: "neutral" }}
        headline={team.name}
        clause={team.clause}
        deck={heroDeck(myRole)}
        actions={
          canInvite ? (
            <HeroLink href="#invite" tone="secondary">
              Invite people
            </HeroLink>
          ) : undefined
        }
      />

      <TeamSection id="team-members" title="Members" sub={membersSub(myRole, members.length)}>
        {sorted.map((m) => {
          const me = m.userId === currentUserId;
          return (
            <MemberRow
              key={m.id}
              member={m}
              me={me}
              canChangeRole={owner && m.role !== TEAM_ROLES.OWNER}
              canRemove={canInvite && m.role !== TEAM_ROLES.OWNER && !me}
              role={roleDrafts[m.id] ?? m.role}
              roleBusy={roleBusyId === m.id}
              onRole={changeRole}
              onAsk={ask}
            />
          );
        })}
      </TeamSection>

      {canInvite && (
        <TeamSection
          id="invite"
          title="Invite people"
          sub="They get an email with a link that works for 7 days."
        >
          <form className="dl-inv-grid" aria-label="Invite someone" onSubmit={handleInvite}>
            <label>
              <b className="dl-label">Email</b>
              <input
                type="email"
                className="dl-st-field"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoComplete="off"
                required
                disabled={inviting}
              />
            </label>
            <label>
              <b className="dl-label">Role</b>
              <SelectField
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={inviting}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </SelectField>
            </label>
            <button
              type="submit"
              className="dl-btn-primary"
              style={primaryButtonStyle}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending" : "Send invite"}
            </button>
          </form>

          {linkPanel && (
            <div className="dl-notice" role="status">
              <div>
                <b>The email could not be sent</b>
                <small>
                  The invite for {linkPanel.email} exists. Share this link with them
                  yourself; it works for 7 days.
                </small>
              </div>
              <span className="dl-code" style={{ flex: "1 1 320px" }}>
                {linkPanel.url}
              </span>
              <button
                type="button"
                onClick={() => copyLink(linkPanel.url)}
                className="dl-btn-secondary"
                style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
              >
                Copy link
              </button>
              <button type="button" onClick={() => setLinkPanel(null)} className="dl-btn-text">
                Dismiss
              </button>
            </div>
          )}

          {invites.length > 0 && (
            <>
              <div style={{ borderTop: "1px solid var(--dl-row)" }}>
                <DividerRow>
                  <span>Pending</span>
                  <span style={{ marginLeft: "auto" }}>{invites.length}</span>
                </DividerRow>
              </div>
              {invites.map((inv, i) => (
                <div
                  key={inv.id}
                  className="dl-mb-row"
                  style={i === 0 ? { borderTop: 0 } : undefined}
                >
                  <Person initials={emailInitial(inv.email)} name={inv.email} detail={inv.line} />
                  <div className="dl-mb-ctl">
                    <Pill>{roleLabel(inv.role)}</Pill>
                    <Pill tone="warn">Pending</Pill>
                  </div>
                </div>
              ))}
            </>
          )}
        </TeamSection>
      )}

      {owner ? (
        <TeamSection
          id="team-delete"
          title="Delete team"
          sub="Only the owner can do this."
          danger
          grow
        >
          <Row
            inline
            label={`Delete ${team.name}`}
            sub="Its deals go back to their owners as personal deals. Members and pending invites are removed. This cannot be undone."
          >
            <button
              type="button"
              onClick={(e) => ask({ kind: "delete" }, e.currentTarget)}
              className="dl-btn-secondary"
              style={{ ...dangerButtonStyle, ...smallButtonStyle }}
            >
              Delete team
            </button>
          </Row>
        </TeamSection>
      ) : (
        <TeamSection
          id="team-leave"
          title="Leave team"
          sub="The owner keeps the team running without you."
          grow
        >
          <Row
            inline
            label={`Leave ${team.name}`}
            sub="You lose access to this team's deals. To come back, someone has to invite you again."
          >
            <button
              type="button"
              onClick={(e) => ask({ kind: "leave" }, e.currentTarget)}
              className="dl-btn-secondary"
              style={{ ...dangerButtonStyle, ...smallButtonStyle }}
            >
              Leave team
            </button>
          </Row>
        </TeamSection>
      )}

      {dialog && dialogProps && (
        <ConfirmDialog
          key={dialog.key}
          host={dialog.host}
          returnFocus={dialog.trigger}
          busy={dialogBusy}
          error={dialogError}
          onConfirm={confirmDialog}
          onCancel={closeDialog}
          {...dialogProps}
        />
      )}
    </>
  );
}

function describeDialog(dialog: OpenDialog, teamName: string) {
  switch (dialog.kind) {
    case "remove": {
      const name = personName(dialog.member.user);
      return {
        kicker: "Remove member",
        title: `Remove ${name}?`,
        body: "They lose access to this team's deals right away. To come back, someone has to invite them again.",
        confirmLabel: "Remove from team",
        busyLabel: "Removing",
      };
    }
    case "owner": {
      const name = personName(dialog.member.user);
      return {
        kicker: "Make owner",
        title: `Make ${name} the owner?`,
        body: "You become an admin. After this, only they can change roles, hand the team on or delete it.",
        confirmLabel: "Make owner",
        busyLabel: "Saving",
      };
    }
    case "leave":
      return {
        kicker: "Leave team",
        title: `Leave ${teamName}?`,
        body: "You lose access to this team's deals. To come back, someone has to invite you again.",
        confirmLabel: "Leave team",
        busyLabel: "Leaving",
      };
    case "delete":
      return {
        kicker: "Delete team",
        title: `Delete ${teamName}?`,
        body: "Its deals go back to their owners as personal deals. Members and pending invites are removed. This cannot be undone.",
        confirmLabel: "Delete team",
        busyLabel: "Deleting",
        requireText: "DELETE",
      };
  }
}
