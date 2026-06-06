"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMySlackIntegrations,
  updateSlackIntegration,
  deleteSlackIntegration,
  testSlackIntegration,
} from "@/app/actions/slack";
import { SlackForm } from "@/components/slack-form";
import { toast } from "sonner";

function maskWebhookUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    if (path.length <= 20) return path;
    return path.slice(0, 10) + "…" + path.slice(-8);
  } catch {
    return "…";
  }
}

const META_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--cream-3)",
};

const GHOST_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "8px 14px",
  border: "1px solid var(--rule-strong)",
  background: "transparent",
  color: "var(--cream-2)",
  cursor: "pointer",
};

const LINK_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "var(--signal)",
  cursor: "pointer",
};

export function SlackIntegrationsPanel({
  defaultExpanded = false,
  onExpandedChange,
  alwaysExpanded = false,
}: {
  defaultExpanded?: boolean;
  onExpandedChange?: (open: boolean) => void;
  alwaysExpanded?: boolean;
}) {
  const [integrations, setIntegrations] = useState<
    Awaited<ReturnType<typeof getMySlackIntegrations>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const setOpen = useCallback(
    (v: boolean) => {
      setExpanded(v);
      onExpandedChange?.(v);
    },
    [onExpandedChange]
  );

  useEffect(() => {
    if (defaultExpanded || alwaysExpanded) setExpanded(true);
  }, [defaultExpanded, alwaysExpanded]);

  async function load() {
    setLoading(true);
    try {
      const list = await getMySlackIntegrations();
      setIntegrations(list);
    } catch {
      toast.error("Failed to load Slack integrations", {
        id: "slack-integrations-load-error",
      });
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const result = await testSlackIntegration(id);
      if (result.success) {
        toast.success("Test message sent to Slack");
      } else {
        toast.error((result as { error?: string }).error ?? "Test failed");
      }
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTestingId(null);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateSlackIntegration(id, { isActive: !isActive });
      toast.success(isActive ? "Integration disabled" : "Integration enabled");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Remove this Slack integration?")) return;
    try {
      await deleteSlackIntegration(id);
      toast.success("Integration removed");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  }

  async function enableSyncSummary(id: string, notifyOn: string[]) {
    if (notifyOn.includes("crm.sync_summary")) return;
    try {
      await updateSlackIntegration(id, {
        notifyOn: [...notifyOn, "crm.sync_summary"],
      });
      toast.success("CRM sync summaries enabled for this webhook");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  if (!expanded && !alwaysExpanded) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "22px 22px",
          border: "1px solid var(--rule)",
          background: "var(--ink-02)",
          color: "var(--cream)",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ ...META_LABEL, marginBottom: 6 }}>
            § - SLACK NOTIFICATIONS
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--cream)",
              letterSpacing: "-0.01em",
              marginBottom: 4,
            }}
          >
            In-channel, in real time.
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 13.5,
              color: "var(--cream-3)",
              lineHeight: 1.5,
            }}
          >
            Deal alerts, stage changes, and optional CRM sync summaries.
          </div>
        </div>
        <span
          style={{
            ...META_LABEL,
            color: "var(--signal)",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Expand
          <span aria-hidden>→</span>
        </span>
      </button>
    );
  }

  return (
    <div id="slack-integrations-panel">
      {!alwaysExpanded && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={LINK_BUTTON}
          >
            Collapse
          </button>
        </div>
      )}

      {showForm && (
        <div
          style={{
            border: "1px solid var(--rule-strong)",
            background: "var(--ink-02)",
            padding: "22px 22px 20px",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              ...META_LABEL,
              color: "var(--signal)",
              marginBottom: 14,
            }}
          >
            § - NEW WEBHOOK
          </div>
          <SlackForm
            onSuccess={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "48px 0",
            textAlign: "center",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--cream-3)",
          }}
        >
          Loading webhooks…
        </div>
      ) : integrations.length === 0 && !showForm ? (
        <div
          style={{
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            padding: "44px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            textAlign: "center",
          }}
        >
          <span
            style={{
              ...META_LABEL,
              color: "var(--copper)",
            }}
          >
            NO WEBHOOKS CONNECTED
          </span>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--cream-2)",
              margin: 0,
              maxWidth: 480,
            }}
          >
            Get notified in-channel when deals are at risk, stages change, or
            after a CRM sync.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "9px 18px",
              border: "1px solid var(--signal)",
              background: "transparent",
              color: "var(--signal)",
              cursor: "pointer",
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Connect Slack
          </button>
        </div>
      ) : integrations.length > 0 ? (
        <div
          style={{
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {integrations.map((i, idx) => (
              <li
                key={i.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "20px 22px",
                  borderTop: idx === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <div style={{ minWidth: 0, flex: "1 1 320px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        color: "var(--cream)",
                        letterSpacing: "-0.005em",
                        margin: 0,
                      }}
                    >
                      {i.channelName || maskWebhookUrl(i.webhookUrl)}
                    </p>
                    <span
                      style={{
                        ...META_LABEL,
                        color: i.isActive ? "var(--ivy)" : "var(--cream-4)",
                        letterSpacing: "0.16em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: i.isActive
                            ? "var(--ivy)"
                            : "var(--cream-4)",
                        }}
                      />
                      {i.isActive ? "Live" : "Paused"}
                    </span>
                  </div>
                  <p
                    style={{
                      ...META_LABEL,
                      color: "var(--cream-3)",
                      marginTop: 10,
                      lineHeight: 1.6,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {i.notifyOn.map((e) => e.replace(/\./g, " · ")).join("   /   ")}
                  </p>
                  {!i.notifyOn.includes("crm.sync_summary") && (
                    <button
                      type="button"
                      onClick={() => enableSyncSummary(i.id, i.notifyOn)}
                      style={{
                        ...LINK_BUTTON,
                        marginTop: 12,
                      }}
                    >
                      + Enable CRM sync summaries
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleActive(i.id, i.isActive)}
                    style={GHOST_BUTTON}
                  >
                    {i.isActive ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTest(i.id)}
                    disabled={testingId === i.id}
                    style={{
                      ...GHOST_BUTTON,
                      opacity: testingId === i.id ? 0.55 : 1,
                      cursor: testingId === i.id ? "wait" : "pointer",
                    }}
                  >
                    {testingId === i.id ? "Sending…" : "Test"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(i.id)}
                    style={{
                      ...GHOST_BUTTON,
                      borderColor: "var(--wine)",
                      color: "var(--wine)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {!showForm && (
              <li
                style={{
                  borderTop: "1px solid var(--rule)",
                  padding: "14px 22px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  style={LINK_BUTTON}
                >
                  + Add another webhook
                </button>
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
