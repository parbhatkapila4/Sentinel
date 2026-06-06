"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createWebhook, updateWebhook } from "@/app/actions/webhooks";
import {
  EditorialButton,
  EditorialInput,
  Field,
  Toggle,
} from "@/components/sentinel/settings/primitives";

const WEBHOOK_EVENTS = [
  { value: "deal.created", label: "Deal · created" },
  { value: "deal.updated", label: "Deal · updated" },
  { value: "deal.stage_changed", label: "Deal · stage changed" },
  { value: "deal.at_risk", label: "Deal · at risk" },
  { value: "deal.closed_won", label: "Deal · closed (won)" },
  { value: "deal.closed_lost", label: "Deal · closed (lost)" },
] as const;

interface WebhookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  edit?: {
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
  };
}

export function WebhookForm({ onSuccess, onCancel, edit }: WebhookFormProps) {
  const [name, setName] = useState(edit?.name ?? "");
  const [url, setUrl] = useState(edit?.url ?? "");
  const [events, setEvents] = useState<Set<string>>(
    new Set(edit?.events ?? [])
  );
  const [isActive, setIsActive] = useState(edit?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  function toggleEvent(value: string) {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    if (events.size === 0) {
      toast.error("Select at least one event");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    setSaving(true);
    try {
      if (edit) {
        await updateWebhook(edit.id, {
          name: name.trim(),
          url: url.trim(),
          events: Array.from(events),
          isActive,
        });
        toast.success("Webhook updated");
      } else {
        await createWebhook({
          name: name.trim(),
          url: url.trim(),
          events: Array.from(events),
        });
        toast.success("Webhook created");
      }
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <Field label="Name" note="REQUIRED">
        <EditorialInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Production · relay"
          disabled={saving}
        />
      </Field>

      <Field label="Endpoint URL" note="REQUIRED">
        <EditorialInput
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-endpoint.com/webhook"
          disabled={saving}
        />
      </Field>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 12,
          }}
        >
          Events <span style={{ color: "var(--signal)" }}>· subscribe</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            border: "1px solid var(--rule)",
          }}
        >
          {WEBHOOK_EVENTS.map((ev) => {
            const active = events.has(ev.value);
            return (
              <label
                key={ev.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRight: "1px solid var(--rule)",
                  borderBottom: "1px solid var(--rule)",
                  cursor: saving ? "not-allowed" : "pointer",
                  background: active ? "rgba(200, 71, 46, 0.05)" : "transparent",
                  transition: "background 140ms ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleEvent(ev.value)}
                  disabled={saving}
                  style={{
                    width: 14,
                    height: 14,
                    accentColor: "var(--signal)",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    color: active ? "var(--cream)" : "var(--cream-2)",
                  }}
                >
                  {ev.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {edit && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid var(--rule)",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 15,
                color: "var(--cream)",
              }}
            >
              {isActive ? (
                <>
                  <em style={{ fontStyle: "italic", color: "var(--ivy)" }}>Live</em>
                  . The wire is open.
                </>
              ) : (
                <>
                  <em style={{ fontStyle: "italic", color: "var(--cream-3)" }}>
                    Paused
                  </em>
                  . No events will be sent.
                </>
              )}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
              }}
            >
              TOGGLE TO {isActive ? "PAUSE" : "RESUME"}
            </span>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} ariaLabel="Active" />
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          paddingTop: 20,
          borderTop: "1px solid var(--rule)",
          flexWrap: "wrap",
        }}
      >
        <EditorialButton type="submit" disabled={saving} variant="primary">
          {saving ? "Saving…" : edit ? "Update webhook" : "Create webhook"}
        </EditorialButton>
        {onCancel && (
          <EditorialButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </EditorialButton>
        )}
      </div>
    </form>
  );
}
