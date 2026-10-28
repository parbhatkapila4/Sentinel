"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { deleteWebhook, getMyWebhooks, testWebhook } from "@/app/actions/webhooks";
import {
  CellHead,
  DataErrorBanner,
  PageHero,
  Pill,
  PlusIcon,
  ellipsisStyle,
  metaTextStyle,
  primaryButtonStyle,
  tableRowStyle,
} from "../blocks";
import { ConfirmDialog } from "../ConfirmDialog";
import { TrashIcon } from "../controls";
import { ActionButton } from "../settings/parts";
import { Monogram, tableHeadStyle } from "../ui";
import { WebhookForm } from "./WebhookForm";
import { countLabel, listChip, webhookHost, type WebhookListItem } from "./model";
import { COPY, SectionHead, SmallLink, WEBHOOK_LIST_COLUMNS } from "./parts";

const FORM_ID = "new-webhook";
const NAME_INPUT_ID = "wh-name";

interface PendingDelete {
  webhook: WebhookListItem;
  trigger: HTMLElement;
}

export function WebhooksView({
  initialWebhooks,
  loadError = false,
}: {
  initialWebhooks: WebhookListItem[];
  loadError?: boolean;
}) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [failed, setFailed] = useState(loadError);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setWebhooks(await getMyWebhooks());
      setFailed(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load webhooks");
    }
  }, []);

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const result = await testWebhook(id);
      if (result.success) toast.success("Test delivery sent");
      else toast.error(result.error ?? "Test failed");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTestingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    const { id } = pendingDelete.webhook;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteWebhook(id);
      setWebhooks((list) => list.filter((w) => w.id !== id));
      setPendingDelete(null);
      toast.success("Webhook deleted");
      await reload();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const jumpToForm = (e: React.MouseEvent) => {
    const form = document.getElementById(FORM_ID);
    if (!form) return;
    e.preventDefault();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById(NAME_INPUT_ID)?.focus({ preventScroll: true });
  };

  const count = webhooks.length;
  const host = pendingDelete?.trigger.closest(".sentinel-daylight") ?? null;

  return (
    <>
      {failed && (
        <DataErrorBanner>
          Webhooks could not be loaded just now. Reload the page in a moment.
        </DataErrorBanner>
      )}
      <PageHero
        label="Webhooks"
        back={{ href: "/settings", label: "Settings" }}
        chip={{ label: failed ? "Webhooks unavailable" : listChip(count), tone: "neutral" }}
        headline="Outbound"
        emphasis="webhooks."
        clause="deal events, sent to your own tools."
        deck={COPY.heroDeck}
        actions={
          count > 0 ? (
            <a
              href={`#${FORM_ID}`}
              onClick={jumpToForm}
              className="dl-btn-primary"
              style={{ ...primaryButtonStyle, paddingLeft: 12 }}
            >
              <PlusIcon />
              New webhook
            </a>
          ) : undefined
        }
      />

      {count === 0 ? (
        <section
          aria-label="Your webhooks"
          className="dl-empty"
          style={{ borderBottom: "1px solid var(--dl-divider)" }}
        >
          {failed ? (
            <>
              <h2>
                Webhooks <em>did not load.</em>
              </h2>
              <p>Nothing has been lost. Reload the page in a moment to see them again.</p>
            </>
          ) : (
            <>
              <h2>
                The line is <em>quiet.</em>
              </h2>
              <p>Add a webhook below to send deal events to another system as they happen.</p>
            </>
          )}
        </section>
      ) : (
        <section aria-label="Your webhooks" className="dl-st-sec">
          <CellHead title="Your webhooks" sub="Newest first" />
          <div role="table" aria-label="Your webhooks" className="dl-table" style={WEBHOOK_LIST_COLUMNS}>
            <div role="row" className="dl-table-grid" style={tableHeadStyle}>
              <span role="columnheader">Webhook</span>
              <span role="columnheader" className="dl-c-wide">Status</span>
              <span role="columnheader" className="dl-c-wide">Events</span>
              <span role="columnheader" className="dl-c-wide">Deliveries</span>
              <span role="columnheader" className="dl-c-wide" aria-label="Actions" />
            </div>
            <div role="rowgroup">
              {webhooks.map((w, i) => (
                <WebhookRow
                  key={w.id}
                  webhook={w}
                  last={i === webhooks.length - 1}
                  testing={testingId === w.id}
                  deleting={deleting && pendingDelete?.webhook.id === w.id}
                  onTest={() => handleTest(w.id)}
                  onDelete={(trigger) => {
                    setDeleteError(null);
                    setPendingDelete({ webhook: w, trigger });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id={FORM_ID} aria-labelledby={`${FORM_ID}-title`} className="dl-st-sec dl-grow">
        <SectionHead
          id={`${FORM_ID}-title`}
          title="Add a webhook"
          sub={COPY.formSub}
        />
        <WebhookForm idPrefix="wh" onSaved={reload} />
      </section>

      {pendingDelete && host && (
        <ConfirmDialog
          host={host}
          kicker="Delete webhook"
          title={pendingDelete.webhook.name}
          body="Sentinel stops sending events to this URL and its delivery history goes with it. This cannot be undone."
          confirmLabel="Delete webhook"
          busyLabel="Deleting"
          busy={deleting}
          error={deleteError}
          returnFocus={pendingDelete.trigger}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (!deleting) setPendingDelete(null);
          }}
        />
      )}
    </>
  );
}

function WebhookRow({
  webhook,
  last,
  testing,
  deleting,
  onTest,
  onDelete,
}: {
  webhook: WebhookListItem;
  last: boolean;
  testing: boolean;
  deleting: boolean;
  onTest: () => void;
  onDelete: (trigger: HTMLElement) => void;
}) {
  const href = `/settings/webhooks/${webhook.id}`;
  const deliveries = webhook._count.deliveries;
  const status = webhook.isActive ? "Live" : "Paused";

  return (
    <div
      role="row"
      className="dl-row dl-table-grid"
      style={{ ...tableRowStyle, ...(last ? { borderBottom: 0 } : null) }}
    >
      <div role="cell" style={{ minWidth: 0 }}>
        <Link
          href={href}
          className="dl-link"
          style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0, minHeight: 0 }}
        >
          <Monogram name={webhook.name} />
          <span style={{ display: "block", minWidth: 0 }}>
            <b
              style={{
                ...ellipsisStyle,
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {webhook.name}
            </b>
            <small
              style={{
                ...ellipsisStyle,
                display: "block",
                fontSize: 12.5,
                color: "var(--dl-muted)",
              }}
            >
              {webhookHost(webhook.url)}
              <span className="dl-narrow-only">
                {" "}
                · {status} · {countLabel(deliveries, "delivery", "deliveries")}
              </span>
            </small>
          </span>
        </Link>
      </div>
      <span role="cell" className="dl-c-wide">
        <Pill tone={webhook.isActive ? "good" : "neutral"}>{status}</Pill>
      </span>
      <span role="cell" className="dl-c-wide" style={metaTextStyle}>
        {countLabel(webhook.events.length, "event", "events")}
      </span>
      <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, fontVariantNumeric: "tabular-nums" }}>
        {deliveries.toLocaleString("en-US")}
      </span>
      <span
        role="cell"
        style={{ display: "flex", alignItems: "center", gap: 6, justifySelf: "end" }}
      >
        <span title={webhook.isActive ? undefined : "Resume it first"} style={{ display: "inline-flex" }}>
          <ActionButton
            onClick={onTest}
            busy={testing}
            disabled={!webhook.isActive}
            label={
              webhook.isActive
                ? `Send test to ${webhook.name}`
                : `Send test to ${webhook.name}. Resume it first`
            }
          >
            {testing ? "Sending" : "Send test"}
          </ActionButton>
        </span>
        <SmallLink href={href}>Open</SmallLink>
        <button
          type="button"
          className="dl-quiet-btn"
          aria-label={`Delete ${webhook.name}`}
          disabled={deleting}
          onClick={(e) => onDelete(e.currentTarget)}
        >
          <TrashIcon />
        </button>
      </span>
    </div>
  );
}
