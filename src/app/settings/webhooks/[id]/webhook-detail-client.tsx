"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import {
  deleteWebhook,
  getWebhookById,
  regenerateWebhookSecret,
  testWebhook,
} from "@/app/actions/webhooks";
import { WebhookForm } from "@/components/webhook-form";
import { EditorialButton } from "@/components/sentinel/settings/primitives";

export function WebhookDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [webhook, setWebhook] = useState<
    Awaited<ReturnType<typeof getWebhookById>> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const w = await getWebhookById(id);
      setWebhook(w);
      if (!w) router.push("/settings/webhooks");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load webhook");
      setWebhook(null);
      router.push("/settings/webhooks");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTest() {
    if (!id) return;
    setTesting(true);
    try {
      const result = await testWebhook(id);
      if (result.success) toast.success("Test delivery sent");
      else toast.error(result.error ?? "Test failed");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function handleRegenerateSecret() {
    if (
      !id ||
      !confirm("Regenerate secret? Existing signatures will no longer verify.")
    )
      return;
    setRegenerating(true);
    try {
      await regenerateWebhookSecret(id);
      toast.success("Secret regenerated");
      setShowSecret(true);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this webhook? This cannot be undone.")) return;
    try {
      await deleteWebhook(id);
      toast.success("Webhook deleted");
      router.push("/settings/webhooks");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (loading || !webhook) {
    return (
      <section
        style={{
          padding: "80px 32px",
          textAlign: "center",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 20,
          color: "var(--cream-3)",
        }}
      >
        Reading the wire…
      </section>
    );
  }

  return (
    <>
      <section
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) minmax(220px, 300px)",
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
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>WIRE · DETAIL</strong>
            <br />
            {webhook.events.length} EVENT{webhook.events.length === 1 ? "" : "S"}
            <br />
            {webhook.isActive ? "LIVE" : "PAUSED"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, minWidth: 0 }}>
          <Link
            href="/settings/webhooks"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to wires
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "var(--cream)",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              {webhook.name}
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--cream-3)",
              margin: 0,
              wordBreak: "break-all",
            }}
          >
            {webhook.url}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <EditorialButton type="button" onClick={handleTest} disabled={testing}>
              {testing ? "Sending…" : "Test"}
            </EditorialButton>
            <EditorialButton type="button" variant="danger" onClick={handleDelete}>
              Delete
            </EditorialButton>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 32px 80px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              paddingBottom: 20,
              borderBottom: "1px solid var(--rule)",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  marginBottom: 8,
                }}
              >
                § 04.W.01 - CONFIGURATION
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 30,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--cream)",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                The{" "}
                <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                  wire
                </em>{" "}
                itself.
              </h2>
            </div>
            {!editing && (
              <EditorialButton type="button" onClick={() => setEditing(true)}>
                Edit
              </EditorialButton>
            )}
          </div>

          {editing ? (
            <div
              style={{
                border: "1px solid var(--rule)",
                background: "var(--ink-02)",
                padding: "28px 26px",
              }}
            >
              <WebhookForm
                edit={{
                  id: webhook.id,
                  name: webhook.name,
                  url: webhook.url,
                  events: webhook.events,
                  isActive: webhook.isActive,
                }}
                onSuccess={() => {
                  setEditing(false);
                  load();
                }}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <dl
              style={{
                border: "1px solid var(--rule)",
                borderBottom: "none",
                margin: 0,
              }}
            >
              <DetailRow label="URL">
                <code
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 13,
                    color: "var(--cream)",
                    wordBreak: "break-all",
                  }}
                >
                  {webhook.url}
                </code>
              </DetailRow>
              <DetailRow label="Events">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {webhook.events.map((e) => (
                    <span
                      key={e}
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        border: "1px solid var(--rule-strong)",
                        color: "var(--cream-2)",
                      }}
                    >
                      {e.replace(/\./g, " · ")}
                    </span>
                  ))}
                </div>
              </DetailRow>
              <DetailRow label="Status">
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: webhook.isActive ? "var(--ivy)" : "var(--cream-3)",
                  }}
                >
                  {webhook.isActive ? "LIVE" : "PAUSED"}
                </span>
              </DetailRow>
              <DetailRow label="Secret">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <code
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 12,
                      color: "var(--cream-2)",
                      background: "var(--ink-02)",
                      border: "1px solid var(--rule)",
                      padding: "4px 10px",
                      wordBreak: "break-all",
                    }}
                  >
                    {showSecret ? webhook.secret : "•".repeat(32)}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !showSecret &&
                        !confirm("Reveal secret? It will be visible on screen.")
                      )
                        return;
                      setShowSecret(!showSecret);
                    }}
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showSecret ? "Hide" : "Reveal"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateSecret}
                    disabled={regenerating}
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--copper)",
                      background: "transparent",
                      border: "none",
                      cursor: regenerating ? "not-allowed" : "pointer",
                      opacity: regenerating ? 0.55 : 1,
                    }}
                  >
                    {regenerating ? "Regenerating…" : "Regenerate"}
                  </button>
                </div>
              </DetailRow>
            </dl>
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              paddingBottom: 20,
              borderBottom: "1px solid var(--rule)",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  marginBottom: 8,
                }}
              >
                § 04.W.02 - DELIVERIES
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 30,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--cream)",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Recent{" "}
                <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                  dispatches
                </em>
                .
              </h2>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
              }}
            >
              {webhook.deliveries.length} RECENT
            </span>
          </div>

          {webhook.deliveries.length === 0 ? (
            <div
              style={{
                padding: "60px 40px",
                textAlign: "center",
                border: "1px solid var(--rule)",
                background: "var(--ink-02)",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--cream-3)",
              }}
            >
              No dispatches yet. Trigger a test, or change a deal and watch the wire.
            </div>
          ) : (
            <div
              style={{
                border: "1px solid var(--rule)",
                borderBottom: "none",
              }}
            >
              {webhook.deliveries.map((d) => (
                <div
                  key={d.id}
                  className="sentinel-row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 18,
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  {d.statusCode != null ? (
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10.5,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        color: d.success ? "var(--ivy)" : "var(--wine)",
                        border: `1px solid ${d.success ? "var(--ivy)" : "var(--wine)"}`,
                        background: d.success
                          ? "rgba(116, 125, 79, 0.08)"
                          : "rgba(119, 47, 47, 0.08)",
                        minWidth: 60,
                        textAlign: "center",
                      }}
                    >
                      {d.statusCode}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10.5,
                        letterSpacing: "0.14em",
                        color: "var(--cream-3)",
                        minWidth: 60,
                        textAlign: "center",
                      }}
                    >
                      -
                    </span>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 15,
                        color: "var(--cream)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.event.replace(/\./g, " · ")}
                    </span>
                    {!d.success && d.response && (
                      <span
                        title={d.response}
                        style={{
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 10.5,
                          color: "var(--cream-3)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.response.slice(0, 120)}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10.5,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.createdAt
                      ? formatDistanceToNow(new Date(d.createdAt), {
                        addSuffix: true,
                      })
                      : "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px minmax(0, 1fr)",
        gap: 24,
        padding: "16px 20px",
        borderBottom: "1px solid var(--rule)",
        alignItems: "center",
      }}
    >
      <dt
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0, minWidth: 0 }}>{children}</dd>
    </div>
  );
}
