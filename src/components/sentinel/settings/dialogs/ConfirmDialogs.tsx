"use client";

import type { CSSProperties } from "react";
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

type Consequence = {
  marker: string;
  title: string;
  detail: string;
};

function DisconnectConsequences({ rows }: { rows: Consequence[] }) {
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 14px",
  };
  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        background: "var(--ink-03)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={row.title}
          style={{
            ...rowStyle,
            borderTop: i === 0 ? "none" : "1px solid var(--rule)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              marginTop: 5,
              flexShrink: 0,
              background: row.marker,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontSize: 13,
                color: "var(--cream)",
                letterSpacing: "-0.005em",
                lineHeight: 1.35,
              }}
            >
              {row.title}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 11.5,
                color: "var(--cream-3)",
                lineHeight: 1.45,
              }}
            >
              {row.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisconnectIntegrationDialog({
  label,
  disconnecting,
  onClose,
  onConfirm,
}: {
  label: string;
  disconnecting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const consequences: Consequence[] = [
    {
      marker: "var(--copper)",
      title: "Live sync stops immediately",
      detail: `Sentinel stops pulling new activity from ${label}.`,
    },
    {
      marker: "var(--ivy)",
      title: "Everything synced so far is kept",
      detail: "Anything already imported into Sentinel stays exactly where it is.",
    },
    {
      marker: "var(--cream-3)",
      title: "Reconnect anytime",
      detail: `You'll re-authorize ${label} to resume syncing — it only takes a moment.`,
    },
  ];

  return (
    <EditorialModal
      onClose={() => !disconnecting && onClose()}
      title={`Disconnect ${label}?`}
      subtitle="This only pauses syncing. Nothing already in Sentinel is deleted."
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          marginBottom: 10,
        }}
      >
        When you disconnect
      </div>
      <DisconnectConsequences rows={consequences} />
      <ModalActions>
        <EditorialButton type="button" onClick={onClose} disabled={disconnecting}>
          Keep connected
        </EditorialButton>
        <EditorialButton
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={disconnecting}
        >
          {disconnecting ? "Disconnecting…" : `Disconnect ${label}`}
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
