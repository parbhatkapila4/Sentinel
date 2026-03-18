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

const CARD_CLASS =
  "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

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
      toast.error("Failed to load Slack integrations");
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
      <div className={CARD_CLASS}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between text-left gap-4"
        >
          <div>
            <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Slack notifications
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Deal alerts, stage changes, and optional CRM sync summaries
            </p>
          </div>
          <span className="text-[#0f766e] text-sm font-medium shrink-0">
            Expand →
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${CARD_CLASS} space-y-4`} id="slack-integrations-panel">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="border-l-2 border-[#0f766e] pl-3">
          <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            Slack
          </h3>
          <p className="text-sm text-white/50 mt-1">
            Incoming webhooks for at-risk deals, wins, stage changes, and HubSpot
            / Salesforce sync summaries.
          </p>
        </div>
        {!alwaysExpanded && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-white/50 hover:text-white"
          >
            Collapse
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
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
        <div className="p-8 text-center text-white/50">Loading…</div>
      ) : integrations.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/6">
          <p className="text-white/50 font-medium mb-2">
            No Slack webhooks yet
          </p>
          <p className="text-sm text-white/40 mb-4">
            Get notified in-channel when deals are at risk, stages change, or
            after a CRM sync.
          </p>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors"
            >
              Connect Slack
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-white/6 rounded-xl border border-white/6 overflow-hidden">
          {integrations.map((i) => (
            <div
              key={i.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 bg-white/[0.02]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white truncate">
                    {i.channelName || maskWebhookUrl(i.webhookUrl)}
                  </p>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium ${i.isActive
                        ? "bg-green-700/20 text-green-400"
                        : "bg-white/10 text-white/50"
                      }`}
                  >
                    {i.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-white/50 mt-0.5 break-words">
                  {i.notifyOn.map((e) => e.replace(/\./g, " · ")).join(", ")}
                </p>
                {!i.notifyOn.includes("crm.sync_summary") && (
                  <button
                    type="button"
                    onClick={() => enableSyncSummary(i.id, i.notifyOn)}
                    className="mt-2 text-xs text-[#0f766e] hover:underline"
                  >
                    + Enable CRM sync summaries
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(i.id, i.isActive)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
                >
                  {i.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => handleTest(i.id)}
                  disabled={testingId === i.id}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-50"
                >
                  {testingId === i.id ? "Sending…" : "Test"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(i.id)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-700/10"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!showForm && (
            <div className="px-4 py-3 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm text-[#0f766e] hover:underline"
              >
                + Add another webhook
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
