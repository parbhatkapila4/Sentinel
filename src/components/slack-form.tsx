"use client";

import { useState } from "react";
import { createSlackIntegration } from "@/app/actions/slack";
import { toast } from "sonner";

const SLACK_EVENTS = [
  { value: "deal.at_risk", label: "Deal at risk" },
  { value: "deal.closed_won", label: "Deal closed won" },
  { value: "deal.stage_changed", label: "Deal stage changed" },
  {
    value: "crm.sync_summary",
    label: "CRM sync summary",
    caption: "After HubSpot / Salesforce sync",
  },
] as const;

interface SlackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const META_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--cream-3)",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-mono-jb)",
  fontSize: 13,
  letterSpacing: "0.04em",
  padding: "11px 14px",
  background: "var(--ink)",
  border: "1px solid var(--rule-strong)",
  color: "var(--cream)",
  outline: "none",
};

const GHOST_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 16px",
  border: "1px solid var(--rule-strong)",
  background: "transparent",
  color: "var(--cream-2)",
  cursor: "pointer",
};

const PRIMARY_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 18px",
  border: "1px solid var(--signal)",
  background: "var(--signal)",
  color: "var(--ink)",
  cursor: "pointer",
  fontWeight: 600,
};

export function SlackForm({ onSuccess, onCancel }: SlackFormProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [notifyOn, setNotifyOn] = useState<Set<string>>(
    new Set([
      "deal.at_risk",
      "deal.closed_won",
      "deal.stage_changed",
      "crm.sync_summary",
    ])
  );
  const [saving, setSaving] = useState(false);

  function toggleEvent(value: string) {
    setNotifyOn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      toast.error("Webhook URL is required");
      return;
    }
    if (notifyOn.size === 0) {
      toast.error("Select at least one event");
      return;
    }
    try {
      new URL(webhookUrl.trim());
    } catch {
      toast.error("Enter a valid webhook URL");
      return;
    }
    setSaving(true);
    try {
      await createSlackIntegration({
        webhookUrl: webhookUrl.trim(),
        channelName: channelName.trim() || undefined,
        notifyOn: Array.from(notifyOn),
      });
      toast.success("Slack integration added");
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div>
        <label
          htmlFor="slack-webhook"
          style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
        >
          Incoming webhook URL *
        </label>
        <input
          id="slack-webhook"
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/…"
          style={INPUT_STYLE}
        />
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--cream-3)",
            margin: "8px 0 0",
            lineHeight: 1.5,
          }}
        >
          Create an Incoming Webhook in your Slack workspace and paste the URL
          here.
        </p>
      </div>

      <div>
        <label
          htmlFor="slack-channel"
          style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
        >
          Channel name{" "}
          <span style={{ color: "var(--cream-4)", letterSpacing: "0.1em" }}>
            (optional)
          </span>
        </label>
        <input
          id="slack-channel"
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="#deals"
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <div style={{ ...META_LABEL, marginBottom: 10 }}>Notify on</div>
        <div
          style={{
            border: "1px solid var(--rule-strong)",
            background: "var(--ink)",
          }}
        >
          {SLACK_EVENTS.map((ev, i) => {
            const checked = notifyOn.has(ev.value);
            return (
              <label
                key={ev.value}
                htmlFor={`slack-ev-${ev.value}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "12px 16px",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                  cursor: "pointer",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    border: `1px solid ${checked ? "var(--signal)" : "var(--rule-strong)"}`,
                    background: checked ? "var(--signal)" : "transparent",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 120ms ease, border-color 120ms ease",
                  }}
                >
                  {checked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--ink)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <input
                  id={`slack-ev-${ev.value}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleEvent(ev.value)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 15,
                      color: "var(--cream)",
                      lineHeight: 1.35,
                    }}
                  >
                    {ev.label}
                  </div>
                  {"caption" in ev && ev.caption && (
                    <div
                      style={{
                        ...META_LABEL,
                        marginTop: 4,
                        color: "var(--cream-4)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {ev.caption}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          paddingTop: 6,
        }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              ...GHOST_BUTTON,
              opacity: saving ? 0.55 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            ...PRIMARY_BUTTON,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Connecting…" : "Connect webhook"}
        </button>
      </div>
    </form>
  );
}
