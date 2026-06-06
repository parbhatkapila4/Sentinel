"use client";

import {
  EditorialButton,
  EditorialInput,
  EditorialModal,
  Field,
  ModalActions,
  SerifEm,
} from "../primitives";

export function CancelSubscriptionDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Cancel subscription?"
      subtitle="We'll open your email client with a pre-filled cancellation request. We process cancellations within 1 business day."
    >
      <ModalActions>
        <EditorialButton type="button" onClick={onClose}>
          Keep subscription
        </EditorialButton>
        <EditorialButton type="button" variant="danger" onClick={onConfirm}>
          Email cancellation request
        </EditorialButton>
      </ModalActions>
    </EditorialModal>
  );
}

export function RemovePaymentDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Remove payment method?"
      subtitle="This card will be removed from your account. You can add it again anytime."
    >
      <ModalActions>
        <EditorialButton type="button" onClick={onClose}>
          Cancel
        </EditorialButton>
        <EditorialButton type="button" variant="danger" onClick={onConfirm}>
          Remove
        </EditorialButton>
      </ModalActions>
    </EditorialModal>
  );
}

export function DeleteAccountDialog({
  confirmText,
  onConfirmTextChange,
  deleting,
  onClose,
  onConfirm,
}: {
  confirmText: string;
  onConfirmTextChange: (next: string) => void;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <EditorialModal
      onClose={() => !deleting && onClose()}
      title={<span style={{ color: "var(--wine)" }}>Delete account?</span>}
      subtitle={
        <>
          Permanently deletes your account and all data. This{" "}
          <SerifEm>cannot be undone.</SerifEm>
        </>
      }
      tone="wine"
    >
      <Field
        label='Type "DELETE" to confirm'
        foot="Deletion runs as soon as you press the button. There is no grace period."
      >
        <EditorialInput
          type="text"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="DELETE"
          disabled={deleting}
          autoFocus
        />
      </Field>
      <ModalActions>
        <EditorialButton type="button" onClick={onClose} disabled={deleting}>
          Cancel
        </EditorialButton>
        <EditorialButton
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={deleting || confirmText !== "DELETE"}
        >
          {deleting ? "Deleting…" : "Delete account"}
        </EditorialButton>
      </ModalActions>
    </EditorialModal>
  );
}
