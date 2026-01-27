"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full max-sm:p-4 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 max-sm:text-xl">Integrations</h1>
            <p className="text-sm text-white/40">
              Connect Slack and other services for team notifications
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-sm:gap-2">
            <Link
              href="/settings"
              className="text-sm text-white/50 hover:text-white min-h-[44px] flex items-center max-sm:order-1"
            >
              ← Back to settings
            </Link>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors max-sm:min-h-[44px] max-sm:order-2"
              >
                <span className="text-lg">+</span>
                Connect Slack
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
              Add Slack integration
            </h2>
            <p className="text-sm text-white/50 mb-4">
              Create an Incoming Webhook in your Slack workspace: Slack App →
              Incoming Webhooks → Add to Workspace → choose channel → copy
              webhook URL.
            </p>
            <SlackForm
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
          <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-white/5 max-sm:px-4">
            Slack
          </h2>
          {loading ? (
            <div className="p-8 text-center text-white/50 max-sm:p-6">Loading…</div>
          ) : integrations.length === 0 ? (
            <div className="p-12 text-center max-sm:p-6">
              <p className="text-white/60 mb-2">No Slack integrations yet</p>
              <p className="text-sm text-white/40 mb-4">
                Connect Slack to receive deal alerts (at risk, closed won, stage
                changes) in your channels.
              </p>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors max-sm:min-h-[44px]"
                >
                  Connect Slack
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {integrations.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors max-sm:px-4 max-sm:gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white truncate">
                        {i.channelName || maskWebhookUrl(i.webhookUrl)}
                      </p>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${i.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50"
                          }`}
                      >
                        {i.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mt-0.5 break-words">
                      {i.notifyOn.map((e) => e.replace(/\./g, " · ")).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 max-sm:w-full max-sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(i.id, i.isActive)}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors max-sm:min-h-[44px]"
                    >
                      {i.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTest(i.id)}
                      disabled={testingId === i.id}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 max-sm:min-h-[44px]"
                    >
                      {testingId === i.id ? "Sending…" : "Test"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(i.id)}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors max-sm:min-h-[44px]"
                    >
                      Remove
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
