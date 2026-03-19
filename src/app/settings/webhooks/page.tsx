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
      toast.error(e instanceof Error ? e.message : "Failed to load webhooks");
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

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto max-sm:pb-6 overflow-x-hidden">
          <header className="mb-8">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Settings</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>Webhooks</span>
            </h1>
            <p className="mt-3 text-base text-white/60">
              Configure endpoints to receive deal events
            </p>
          </header>

          {showForm && (
            <div className={`${CARD_CLASS} mb-6`}>
              <div className="border-l-2 border-[#0f766e] pl-3 mb-4">
                <h2 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">New webhook</h2>
              </div>
              <WebhookForm
                onSuccess={() => { setShowForm(false); load(); }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          <div className={CARD_CLASS}>
            {loading ? (
              <div className="p-8 text-center text-white/50 max-sm:p-6">Loading…</div>
            ) : webhooks.length === 0 ? (
              <div className="p-12 text-center max-sm:p-6">
                <p className="text-white/50 font-medium mb-2">No webhooks yet</p>
                <p className="text-sm text-white/40 mb-4">
                  Add a webhook to receive deal events (e.g. webhook.site for testing).
                </p>
                {!showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors max-sm:min-h-[44px]"
                  >
                    Add webhook
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {webhooks.map((w) => (
                  <div
                    key={w.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 py-4 first:pt-0 hover:bg-white/3 transition-colors max-sm:px-0 max-sm:gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white truncate">{w.name}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium ${w.isActive ? "bg-green-700/20 text-green-400" : "bg-white/10 text-white/50"}`}>
                          {w.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 mt-0.5 truncate">
                        {maskUrl(w.url)} · {w.events.length} event{w.events.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{w._count.deliveries} delivery{w._count.deliveries !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 max-sm:w-full">
                      <Link href={`/settings/webhooks/${w.id}`} className="px-3 py-2 rounded-lg text-sm font-medium text-teal-400 hover:text-teal-300 hover:bg-[#0f766e]/10 transition-colors max-sm:min-h-[44px] max-sm:flex max-sm:items-center">
                        Edit
                      </Link>
                      <button type="button" onClick={() => handleTest(w.id)} disabled={testingId === w.id} className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 max-sm:min-h-[44px]">
                        {testingId === w.id ? "Sending…" : "Test"}
                      </button>
                      <button type="button" onClick={() => handleDelete(w.id)} className="px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-700/10 transition-colors max-sm:min-h-[44px]">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
