"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  getMyWebhooks,
  deleteWebhook,
  testWebhook,
} from "@/app/actions/webhooks";
import { WebhookForm } from "@/components/webhook-form";
import { toast } from "sonner";

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host.length <= 12) return host;
    return host.slice(0, 6) + "…" + host.slice(-6);
  } catch {
    return "…";
  }
}

export default function WebhooksSettingsPage() {
  const [webhooks, setWebhooks] = useState<
    Awaited<ReturnType<typeof getMyWebhooks>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await getMyWebhooks();
      setWebhooks(list);
    } catch (e) {
      toast.error("Failed to load webhooks");
      setWebhooks([]);
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
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook? This cannot be undone.")) return;
    try {
      await deleteWebhook(id);
      toast.success("Webhook deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 max-sm:text-xl">Webhooks</h1>
            <p className="text-sm text-white/40">
              Configure endpoints to receive deal events
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-sm:gap-2">
            <Link
              href="/settings"
              className="text-sm text-white/50 hover:text-white min-h-[44px] flex items-center"
            >
              ← Back to settings
            </Link>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors max-sm:min-h-[44px]"
              >
                <span className="text-lg">+</span>
                Add Webhook
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div
            className="rounded-2xl p-6 mb-6 max-sm:p-4 max-sm:mb-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              New webhook
            </h2>
            <WebhookForm
              onSuccess={() => {
                setShowForm(false);
                load();
              }}
              onCancel={() => setShowForm(false)}
            />
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
          {loading ? (
            <div className="p-8 text-center text-white/50 max-sm:p-6">Loading…</div>
          ) : webhooks.length === 0 ? (
            <div className="p-12 text-center max-sm:p-6">
              <p className="text-white/60 mb-2">No webhooks yet</p>
              <p className="text-sm text-white/40 mb-4">
                Add a webhook to receive deal events (e.g. webhook.site for
                testing).
              </p>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors max-sm:min-h-[44px]"
                >
                  Add Webhook
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {webhooks.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors max-sm:px-4 max-sm:gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white truncate">{w.name}</p>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${w.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50"
                          }`}
                      >
                        {w.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mt-0.5 truncate">
                      {maskUrl(w.url)} · {w.events.length} event
                      {w.events.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {w._count.deliveries} delivery
                      {w._count.deliveries !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 max-sm:w-full">
                    <Link
                      href={`/settings/webhooks/${w.id}`}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors max-sm:min-h-[44px] max-sm:flex max-sm:items-center"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTest(w.id)}
                      disabled={testingId === w.id}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 max-sm:min-h-[44px]"
                    >
                      {testingId === w.id ? "Sending…" : "Test"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(w.id)}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors max-sm:min-h-[44px]"
                    >
                      Delete
                    </button>
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
