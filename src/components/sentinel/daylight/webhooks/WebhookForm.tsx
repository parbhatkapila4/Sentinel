"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createWebhook, updateWebhook } from "@/app/actions/webhooks";
import { isHttpsWebhookUrl, WEBHOOK_URL_HTTPS_MESSAGE } from "@/lib/webhook-url";
import { primaryButtonStyle, secondaryButtonStyle } from "../blocks";
import { Required } from "../controls";
import { Row, Switch, rowLabelStyle, rowSubStyle } from "../settings/parts";
import { WEBHOOK_EVENTS } from "./events";
import { COPY } from "./parts";

export interface WebhookFormValues {
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export function validateWebhook(values: Pick<WebhookFormValues, "name" | "url" | "events">): string | null {
  if (!values.name.trim() || !values.url.trim()) return "Name and URL are required";
  if (values.events.length === 0) return "Select at least one event";
  try {
    new URL(values.url.trim());
  } catch {
    return "Enter a valid URL";
  }
  if (!isHttpsWebhookUrl(values.url.trim())) return WEBHOOK_URL_HTTPS_MESSAGE;
  return null;
}

export function WebhookForm({
  idPrefix,
  edit,
  onSaved,
  onCancel,
}: {
  idPrefix: string;
  edit?: WebhookFormValues & { id: string };
  onSaved: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [url, setUrl] = useState(edit?.url ?? "");
  const [events, setEvents] = useState<string[]>(edit?.events ?? []);
  const [isActive, setIsActive] = useState(edit?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const toggleEvent = (value: string) =>
    setEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const problem = validateWebhook({ name, url, events });
    if (problem) {
      toast.error(problem);
      return;
    }
    const ordered = WEBHOOK_EVENTS.map((ev) => ev.value as string).filter((v) =>
      events.includes(v)
    );
    setSaving(true);
    try {
      if (edit) {
        await updateWebhook(edit.id, {
          name: name.trim(),
          url: url.trim(),
          events: ordered,
          isActive,
        });
        toast.success("Webhook updated");
      } else {
        await createWebhook({ name: name.trim(), url: url.trim(), events: ordered });
        toast.success("Webhook created");
        setName("");
        setUrl("");
        setEvents([]);
      }
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={saving || undefined}>
      <Row
        label={
          <>
            Name
            <Required />
          </>
        }
        htmlFor={`${idPrefix}-name`}
        sub={COPY.nameNote}
      >
        <input
          id={`${idPrefix}-name`}
          className="dl-st-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Production relay"
          autoComplete="off"
          required
          disabled={saving}
        />
      </Row>
      <Row
        label={
          <>
            Endpoint URL
            <Required />
          </>
        }
        htmlFor={`${idPrefix}-url`}
        sub={COPY.urlNote}
      >
        <input
          id={`${idPrefix}-url`}
          className="dl-st-field"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-endpoint.com/webhook"
          autoComplete="off"
          spellCheck={false}
          required
          disabled={saving}
        />
      </Row>
      <div className="dl-st-row">
        <div style={{ minWidth: 0 }}>
          <span id={`${idPrefix}-events`} style={rowLabelStyle}>
            Events
          </span>
          <small style={rowSubStyle}>{COPY.eventsPick}</small>
        </div>
        <div className="dl-checks" role="group" aria-labelledby={`${idPrefix}-events`}>
          {WEBHOOK_EVENTS.map((ev) => (
            <label key={ev.value} className="dl-check-row">
              <input
                type="checkbox"
                className="dl-check"
                checked={events.includes(ev.value)}
                onChange={() => toggleEvent(ev.value)}
                disabled={saving}
              />
              {ev.label}
            </label>
          ))}
        </div>
      </div>
      {edit && (
        <Row
          label="Active"
          sub={COPY.activeNote}
          inline
        >
          <Switch
            checked={isActive}
            onChange={setIsActive}
            label="Active"
            disabled={saving}
          />
        </Row>
      )}
      <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
        <button
          type="submit"
          disabled={saving}
          className="dl-btn-primary"
          style={{ ...primaryButtonStyle, opacity: saving ? 0.55 : 1 }}
        >
          {edit ? (saving ? "Saving" : "Save changes") : saving ? "Creating" : "Create webhook"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="dl-btn-secondary"
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
