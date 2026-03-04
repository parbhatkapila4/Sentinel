"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
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

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<
    Awaited<ReturnType<typeof getMySlackIntegrations>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await getMySlackIntegrations();
      setIntegrations(list);
    } catch (e) {
      toast.error("Failed to load integrations");
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
    if (!confirm("Remove this Slack integration?")) return;
    try {
      await deleteSlackIntegration(id);
      toast.success("Integration removed");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
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
              <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>Integrations</span>
            </h1>
            <p className="mt-3 text-base text-white/60">
              Connect Slack and other services for team notifications
            </p>
          </header>

          {showForm && (
            <div className={`${CARD_CLASS} mb-6`}>
              <div className="border-l-2 border-[#0f766e] pl-3 mb-4">
                <h2 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Add Slack integration</h2>
                <p className="text-sm text-white/50 mt-1">
                  Create an Incoming Webhook in your Slack workspace: Slack App → Incoming Webhooks → Add to Workspace → choose channel → copy webhook URL.
                </p>
              </div>
              <SlackForm onSuccess={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
            </div>
          )}

          <div className={CARD_CLASS}>
            <div className="border-l-2 border-white/20 pl-3 pb-4 mb-4 border-b border-white/6">
              <h2 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Slack</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-white/50 max-sm:p-6">Loading…</div>
            ) : integrations.length === 0 ? (
              <div className="p-12 text-center max-sm:p-6">
                <p className="text-white/50 font-medium mb-2">No Slack integrations yet</p>
                <p className="text-sm text-white/40 mb-4">
                  Connect Slack to receive deal alerts (at risk, closed won, stage changes) in your channels.
                </p>
                {!showForm && (
                  <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors max-sm:min-h-[44px]">
                    Connect Slack
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {integrations.map((i) => (
                  <div key={i.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 py-4 first:pt-0 hover:bg-white/3 transition-colors max-sm:px-0 max-sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white truncate">{i.channelName || maskWebhookUrl(i.webhookUrl)}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium ${i.isActive ? "bg-green-700/20 text-green-400" : "bg-white/10 text-white/50"}`}>
                          {i.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 mt-0.5 break-words">{i.notifyOn.map((e) => e.replace(/\./g, " · ")).join(", ")}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 max-sm:w-full">
                      <button type="button" onClick={() => handleToggleActive(i.id, i.isActive)} className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors max-sm:min-h-[44px]">
                        {i.isActive ? "Disable" : "Enable"}
                      </button>
                      <button type="button" onClick={() => handleTest(i.id)} disabled={testingId === i.id} className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 max-sm:min-h-[44px]">
                        {testingId === i.id ? "Sending…" : "Test"}
                      </button>
                      <button type="button" onClick={() => handleDelete(i.id)} className="px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-700/10 transition-colors max-sm:min-h-[44px]">
                        Remove
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
