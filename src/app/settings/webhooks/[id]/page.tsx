"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  getWebhookById,
  updateWebhook,
  regenerateWebhookSecret,
  testWebhook,
  deleteWebhook,
} from "@/app/actions/webhooks";
import { WebhookForm } from "@/components/webhook-form";
import { toast } from "sonner";

export default function WebhookDetailPage() {
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

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const w = await getWebhookById(id);
      setWebhook(w);
      if (!w) router.push("/settings/webhooks");
    } catch (e) {
      toast.error("Failed to load webhook");
      setWebhook(null);
      router.push("/settings/webhooks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleTest() {
    if (!id) return;
    setTesting(true);
    try {
      const result = await testWebhook(id);
      if (result.success) {
        toast.success("Test delivery sent");
      } else {
        toast.error(result.error ?? "Test failed");
      }
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function handleRegenerateSecret() {
    if (!id || !confirm("Regenerate secret? Existing signatures will no longer verify."))
      return;
    setRegenerating(true);
    try {
      const newSecret = await regenerateWebhookSecret(id);
      toast.success("Secret regenerated");
      setShowSecret(true);
      load();
      return newSecret;
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
      <DashboardLayout>
        <div
          className="p-6 min-h-full max-sm:p-4"
          style={{ background: "#0a0a0f" }}
        >
          <div className="text-white/50">Loading…</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <Link
              href="/settings/webhooks"
              className="text-sm text-white/50 hover:text-white mb-2 inline-flex items-center min-h-[44px]"
            >
              ← Back to webhooks
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1 max-sm:text-xl break-words">{webhook.name}</h1>
            <p className="text-sm text-white/40 break-all">
              {webhook.url} · {webhook.events.length} event
              {webhook.events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] disabled:opacity-50 transition-colors max-sm:min-h-[44px]"
            >
              {testing ? "Sending…" : "Test"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors max-sm:min-h-[44px]"
            >
              Delete
            </button>
          </div>
        </div>

        {editing ? (
          <div
            className="rounded-2xl p-6 mb-6 max-sm:p-4 max-sm:mb-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Edit webhook
            </h2>
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
          <div
            className="rounded-2xl p-6 mb-6 max-sm:p-4 max-sm:mb-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:items-stretch max-sm:gap-2">
              <h2 className="text-lg font-semibold text-white">
                Configuration
              </h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors max-sm:min-h-[44px] max-sm:flex max-sm:items-center"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/40">URL</dt>
                <dd className="text-white font-mono break-all">{webhook.url}</dd>
              </div>
              <div>
                <dt className="text-white/40">Events</dt>
                <dd className="text-white/80">
                  {webhook.events.map((e) => e.replace(/\./g, " · ")).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-white/40">Status</dt>
                <dd>
                  <span
                    className={
                      webhook.isActive
                        ? "text-emerald-400"
                        : "text-white/50"
                    }
                  >
                    {webhook.isActive ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-white/40 mb-1">Secret</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <code className="text-white/70 font-mono text-xs bg-white/5 px-2 py-1 rounded">
                    {showSecret
                      ? webhook.secret
                      : "••••••••••••••••••••••••••••••••"}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showSecret && !confirm("Reveal secret? It will be visible on screen.")) return;
                      setShowSecret(!showSecret);
                    }}
                    className="text-xs font-medium text-white/50 hover:text-white transition-colors"
                  >
                    {showSecret ? "Hide" : "Reveal"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateSecret}
                    disabled={regenerating}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors"
                  >
                    {regenerating ? "Regenerating…" : "Regenerate"}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5 max-sm:px-4">
            Recent deliveries
          </h2>
          {webhook.deliveries.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/50 text-sm max-sm:px-4 max-sm:py-8">
              No deliveries yet. Trigger a test or change a deal to send events.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {webhook.deliveries.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 hover:bg-white/[0.02] transition-colors max-sm:px-4 max-sm:gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {d.event.replace(/\./g, " · ")}
                    </p>
                    <p className="text-xs text-white/40">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleString("en-US")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.statusCode != null && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${d.success
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {d.statusCode}
                      </span>
                    )}
                    {!d.success && d.response && (
                      <span
                        className="text-xs text-white/40 truncate max-w-[200px]"
                        title={d.response}
                      >
                        {d.response.slice(0, 60)}…
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
