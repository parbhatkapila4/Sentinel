"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  deleteWebhook,
  getWebhookById,
  regenerateWebhookSecret,
  revealWebhookSecret,
  testWebhook,
} from "@/app/actions/webhooks";
import {
  CellHead,
  EmptyNote,
  PageHero,
  Pill,
  dangerButtonStyle,
  metaTextStyle,
  secondaryButtonStyle,
  smallButtonStyle,
  tableRowStyle,
} from "../blocks";
import { ConfirmDialog } from "../ConfirmDialog";
import { ActionButton, Row } from "../settings/parts";
import { tableHeadStyle } from "../ui";
import { eventLabel } from "./events";
import { WebhookForm } from "./WebhookForm";
import {
  deliveryLabel,
  deliveryResponse,
  deliveryWhen,
  detailClause,
  type WebhookDelivery,
  type WebhookDetail,
} from "./model";
import { COPY, CodePill, DELIVERY_COLUMNS, MASKED_SECRET, SectionHead } from "./parts";

type Confirming = { kind: "delete" | "regenerate"; trigger: HTMLElement };

export function WebhookDetailView({
  initialWebhook,
  nowMs: initialNowMs,
}: {
  initialWebhook: WebhookDetail;
  nowMs: number;
}) {
  const router = useRouter();
  const [webhook, setWebhook] = useState(initialWebhook);
  const [nowMs, setNowMs] = useState(initialNowMs);
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [confirming, setConfirming] = useState<Confirming | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const id = webhook.id;

  const reload = useCallback(async () => {
    try {
      const fresh = await getWebhookById(id);
      if (!fresh) {
        router.push("/settings/webhooks");
        return;
      }
      setWebhook(fresh);
      setNowMs(Date.now());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load webhook");
    }
  }, [id, router]);

  async function handleTest() {
    setTesting(true);
    try {
      const result = await testWebhook(id);
      if (result.success) toast.success("Test delivery sent");
      else toast.error(result.error ?? "Test failed");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function toggleSecret() {
    if (secret !== null) {
      setSecret(null);
      return;
    }
    setRevealing(true);
    try {
      const value = await revealWebhookSecret(id);
      if (value) setSecret(value);
      else toast.error("Couldn't load the secret");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load the secret");
    } finally {
      setRevealing(false);
    }
  }

  async function confirmAction() {
    if (!confirming || busy) return;
    setBusy(true);
    setConfirmError(null);
    try {
      if (confirming.kind === "delete") {
        await deleteWebhook(id);
        toast.success("Webhook deleted");
        setConfirming(null);
        router.push("/settings/webhooks");
        return;
      }
      const fresh = await regenerateWebhookSecret(id);
      setSecret(fresh);
      setConfirming(null);
      toast.success("Secret regenerated");
    } catch (e) {
      setConfirmError(
        e instanceof Error
          ? e.message
          : confirming.kind === "delete"
            ? "Failed to delete"
            : "Failed to regenerate"
      );
    } finally {
      setBusy(false);
    }
  }

  const ask = (kind: Confirming["kind"]) => (e: React.MouseEvent<HTMLElement>) => {
    setConfirmError(null);
    setConfirming({ kind, trigger: e.currentTarget });
  };

  const host = confirming?.trigger.closest(".sentinel-daylight") ?? null;
  const live = webhook.isActive;
  const deleting = busy && confirming?.kind === "delete";

  return (
    <>
      <PageHero
        label="Webhook"
        back={{ href: "/settings/webhooks", label: "Webhooks" }}
        chip={live ? { label: "Live", tone: "good" } : { label: "Paused", tone: "neutral" }}
        headline={webhook.name}
        clause={detailClause(webhook)}
        deck={
          <span
            style={{
              fontFamily: "var(--dl-font-mono)",
              fontSize: 13,
              overflowWrap: "anywhere",
            }}
          >
            {webhook.url}
          </span>
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleTest}
              disabled={!live || testing}
              aria-busy={testing || undefined}
              title={live ? undefined : "Resume it first"}
              className="dl-btn-secondary"
              style={secondaryButtonStyle}
            >
              {testing ? "Sending" : "Send test"}
            </button>
            <button
              type="button"
              onClick={ask("delete")}
              disabled={deleting}
              className="dl-btn-secondary"
              style={dangerButtonStyle}
            >
              Delete
            </button>
          </>
        }
      />

      <section aria-labelledby="wh-config-title" className="dl-st-sec">
        <SectionHead
          id="wh-config-title"
          title="Configuration"
          sub={COPY.configSub}
          right={
            editing ? undefined : (
              <ActionButton onClick={() => setEditing(true)}>Edit</ActionButton>
            )
          }
        />
        {editing ? (
          <WebhookForm
            idPrefix="wh-edit"
            edit={{
              id: webhook.id,
              name: webhook.name,
              url: webhook.url,
              events: webhook.events,
              isActive: webhook.isActive,
            }}
            onSaved={async () => {
              setEditing(false);
              await reload();
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <Row label="Endpoint URL">
              <span className="dl-code" style={{ flex: "1 1 auto" }} title={webhook.url}>
                {webhook.url}
              </span>
            </Row>
            <Row label="Events" sub={COPY.eventsNote}>
              {webhook.events.map((e) => (
                <Pill key={e}>{eventLabel(e)}</Pill>
              ))}
            </Row>
            <Row label="Status" sub={COPY.statusNote}>
              <Pill tone={live ? "good" : "neutral"}>{live ? "Live" : "Paused"}</Pill>
            </Row>
            <Row label="Signing secret" sub={COPY.secretNote}>
              <span
                className="dl-code"
                style={
                  secret === null
                    ? { flex: "1 1 220px" }
                    : {
                        flex: "1 1 220px",
                        height: "auto",
                        minHeight: 36,
                        padding: "8px 11px",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        userSelect: "all",
                      }
                }
                aria-label={secret === null ? "Signing secret, hidden" : "Signing secret"}
              >
                {secret ?? MASKED_SECRET}
              </span>
              <ActionButton onClick={toggleSecret} busy={revealing}>
                {secret === null ? (revealing ? "Revealing" : "Reveal") : "Hide"}
              </ActionButton>
              <button
                type="button"
                onClick={ask("regenerate")}
                className="dl-btn-secondary"
                style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
              >
                Regenerate
              </button>
            </Row>
          </>
        )}
      </section>

      <section aria-label="Recent deliveries" className="dl-st-sec dl-grow">
        <CellHead title="Recent deliveries" sub="Latest 20" />
        {webhook.deliveries.length === 0 ? (
          <div style={{ padding: "0 var(--dl-gutter) 18px" }}>
            <EmptyNote>
              No deliveries yet. Send a test, or change a deal it listens for.
            </EmptyNote>
          </div>
        ) : (
          <div role="table" aria-label="Recent deliveries" className="dl-table" style={DELIVERY_COLUMNS}>
            <div role="row" className="dl-table-grid" style={tableHeadStyle}>
              <span role="columnheader">Status</span>
              <span role="columnheader">Event</span>
              <span role="columnheader" className="dl-c-wide">Response</span>
              <span role="columnheader" style={{ justifySelf: "end" }}>When</span>
            </div>
            <div role="rowgroup">
              {webhook.deliveries.map((d, i) => (
                <DeliveryRow
                  key={d.id}
                  delivery={d}
                  nowMs={nowMs}
                  last={i === webhook.deliveries.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {confirming && host && (
        <ConfirmDialog
          host={host}
          kicker={confirming.kind === "delete" ? "Delete webhook" : "Regenerate secret"}
          title={webhook.name}
          body={
            confirming.kind === "delete"
              ? "Sentinel stops sending events to this URL and its delivery history goes with it. This cannot be undone."
              : "Requests signed with the current secret will stop verifying. Update your endpoint with the new secret straight after."
          }
          confirmLabel={confirming.kind === "delete" ? "Delete webhook" : "Regenerate secret"}
          busyLabel={confirming.kind === "delete" ? "Deleting" : "Regenerating"}
          busy={busy}
          error={confirmError}
          returnFocus={confirming.trigger}
          onConfirm={confirmAction}
          onCancel={() => {
            if (!busy) setConfirming(null);
          }}
        />
      )}
    </>
  );
}

function DeliveryRow({
  delivery: d,
  nowMs,
  last,
}: {
  delivery: WebhookDelivery;
  nowMs: number;
  last: boolean;
}) {
  const response = deliveryResponse(d);
  return (
    <div
      role="row"
      className="dl-table-grid"
      style={{ ...tableRowStyle, ...(last ? { borderBottom: 0 } : null) }}
    >
      <span role="cell">
        <CodePill tone={d.success ? "good" : "alert"}>{d.statusCode ?? "Failed"}</CodePill>
      </span>
      <span role="cell" style={{ ...metaTextStyle, minWidth: 0, overflowWrap: "anywhere" }}>
        {deliveryLabel(d)}
      </span>
      <span
        role="cell"
        className="dl-c-wide"
        title={response}
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--dl-muted)",
        }}
      >
        {response}
      </span>
      <span role="cell" style={{ ...metaTextStyle, justifySelf: "end", whiteSpace: "nowrap" }}>
        {deliveryWhen(d.createdAt, nowMs)}
      </span>
    </div>
  );
}
