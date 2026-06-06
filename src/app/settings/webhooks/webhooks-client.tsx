"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteWebhook,
  getMyWebhooks,
  testWebhook,
} from "@/app/actions/webhooks";
import { WebhookForm } from "@/components/webhook-form";
import { EditorialButton } from "@/components/sentinel/settings/primitives";

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host.length <= 24) return host;
    return host.slice(0, 12) + "…" + host.slice(-10);
  } catch {
    return "-";
  }
}

export function WebhooksClient() {
  const [webhooks, setWebhooks] = useState<
    Awaited<ReturnType<typeof getMyWebhooks>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyWebhooks();
      setWebhooks(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load webhooks");
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTest(id: string) {
    setTestingId(id);
    try {
      const result = await testWebhook(id);
      if (result.success) toast.success("Test delivery sent");
      else toast.error(result.error ?? "Test failed");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteWebhook(id);
      toast.success("Webhook deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) minmax(220px, 260px)",
          gap: 48,
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 60, lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § 04.W
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>WEBHOOKS · WIRES</strong>
            <br />
            {webhooks.length} ON THE BOOK
            <br />
            EVENT RELAY
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <Link
            href="/settings"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to settings
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--cream)",
              margin: 0,
            }}
          >
            Outbound{" "}
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              wires.
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.45,
              color: "var(--cream-2)",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Push every deal event to your systems. Subscribe only to what you actually read.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {!showForm && (
            <EditorialButton
              type="button"
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              + New webhook
            </EditorialButton>
          )}
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
            }}
          >
            Lay a new wire
          </span>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          padding: "0 32px",
          borderBottom: "1px solid var(--rule)",
          alignItems: "center",
        }}
      >
        <div style={{ padding: "16px 24px 16px 0", borderRight: "1px solid var(--rule)", fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
          § 04.W - LEDGER
        </div>
        <div style={{ padding: "16px 24px", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--cream-2)" }}>
          Every endpoint you&apos;ve wired, and how they&apos;re doing.
        </div>
        <div style={{ padding: "16px 0", fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-3)" }}>
          {webhooks.length} wire{webhooks.length === 1 ? "" : "s"}
        </div>
      </div>

      <section style={{ padding: "48px 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        {showForm && (
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              padding: "28px 26px",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
                paddingBottom: 14,
                borderBottom: "1px solid var(--rule)",
                marginBottom: 20,
              }}
            >
              § - NEW WIRE
            </div>
            <WebhookForm
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
              padding: "80px 32px",
              textAlign: "center",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--cream-3)",
            }}
          >
            Reading the ledger…
          </div>
        ) : webhooks.length === 0 ? (
          <div
            style={{
              padding: "72px 40px",
              textAlign: "center",
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.24em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              § - QUIET LINE
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 34,
                fontStyle: "italic",
                color: "var(--cream)",
                margin: "0 0 14px",
                letterSpacing: "-0.02em",
              }}
            >
              No webhooks yet. The wire is quiet.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-2)",
                margin: "0 auto 24px",
                maxWidth: 520,
                lineHeight: 1.5,
              }}
            >
              Add a webhook to relay deal events to another system. webhook.site is a good place to test.
            </p>
            {!showForm && (
              <EditorialButton
                type="button"
                variant="primary"
                onClick={() => setShowForm(true)}
              >
                Lay the first wire
              </EditorialButton>
            )}
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--rule)",
              borderBottom: "none",
            }}
          >
            {webhooks.map((w) => (
              <div
                key={w.id}
                className="sentinel-row-hover"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto auto",
                  gap: 24,
                  alignItems: "center",
                  padding: "22px 24px",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 20,
                        color: "var(--cream)",
                        letterSpacing: "-0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {w.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        color: w.isActive ? "var(--ivy)" : "var(--cream-3)",
                        border: `1px solid ${w.isActive ? "var(--ivy)" : "var(--rule-strong)"}`,
                        background: w.isActive ? "rgba(116, 125, 79, 0.08)" : "transparent",
                      }}
                    >
                      {w.isActive ? "LIVE" : "PAUSED"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 11,
                      color: "var(--cream-3)",
                      letterSpacing: "0.04em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {maskUrl(w.url)} · {w.events.length} EVENT{w.events.length === 1 ? "" : "S"} · {w._count.deliveries} DELIVERY{w._count.deliveries === 1 ? "" : "·S"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    href={`/settings/webhooks/${w.id}`}
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "7px 14px",
                      border: "1px solid var(--rule-strong)",
                      color: "var(--cream-2)",
                      textDecoration: "none",
                    }}
                  >
                    Open
                  </Link>
                  <EditorialButton
                    type="button"
                    onClick={() => handleTest(w.id)}
                    disabled={testingId === w.id}
                    compact
                  >
                    {testingId === w.id ? "Sending…" : "Test"}
                  </EditorialButton>
                  <EditorialButton
                    type="button"
                    variant="danger"
                    compact
                    onClick={() => handleDelete(w.id)}
                    disabled={deletingId === w.id}
                  >
                    {deletingId === w.id ? "…" : "Delete"}
                  </EditorialButton>
                </div>
                <Link
                  href={`/settings/webhooks/${w.id}`}
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--signal)",
                    textDecoration: "none",
                    padding: "4px 0",
                  }}
                >
                  →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
