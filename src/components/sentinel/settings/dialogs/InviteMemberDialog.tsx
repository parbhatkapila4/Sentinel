"use client";

import {
  EditorialButton,
  EditorialInput,
  EditorialModal,
  EditorialSelect,
  Field,
  ModalActions,
} from "../primitives";

export function InviteMemberDialog({
  email,
  onEmailChange,
  role,
  onRoleChange,
  sending,
  onClose,
  onSubmit,
}: {
  email: string;
  onEmailChange: (next: string) => void;
  role: string;
  onRoleChange: (next: string) => void;
  sending: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <EditorialModal
      onClose={() => !sending && onClose()}
      title="Invite member."
      subtitle="Send an invitation to join your team."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field label="Email address">
          <EditorialInput
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={sending}
            placeholder="colleague@company.com"
            required
          />
        </Field>
        <Field label="Role">
          <EditorialSelect
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            disabled={sending}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </EditorialSelect>
        </Field>
        <ModalActions>
          <EditorialButton
            type="button"
            onClick={() => !sending && onClose()}
            disabled={sending}
          >
            Cancel
          </EditorialButton>
          <EditorialButton
            type="submit"
            variant="primary"
            disabled={sending || !email.trim()}
          >
            {sending ? "Sending…" : "Send invitation ⏎"}
          </EditorialButton>
        </ModalActions>
      </form>
    </EditorialModal>
  );
}
