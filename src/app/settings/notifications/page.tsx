"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  getMyNotificationSettings,
  updateMyNotificationSettings,
} from "@/app/actions/notifications";
import { toast } from "sonner";

type DigestFrequency = "realtime" | "daily" | "weekly" | "never";

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailOnDealAtRisk, setEmailOnDealAtRisk] = useState(true);
  const [emailOnActionOverdue, setEmailOnActionOverdue] = useState(true);
  const [emailOnStageChange, setEmailOnStageChange] = useState(false);
  const [emailOnTeamActivity, setEmailOnTeamActivity] = useState(true);
  const [emailDigestFrequency, setEmailDigestFrequency] =
    useState<DigestFrequency>("daily");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getMyNotificationSettings();
        if (!mounted) return;
        setEmailOnDealAtRisk(s.emailOnDealAtRisk);
        setEmailOnActionOverdue(s.emailOnActionOverdue);
        setEmailOnStageChange(s.emailOnStageChange);
        setEmailOnTeamActivity(s.emailOnTeamActivity);
        setEmailDigestFrequency(s.emailDigestFrequency);
      } catch (e) {
        console.error("Load notification settings:", e);
        toast.error("Failed to load settings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMyNotificationSettings({
        emailOnDealAtRisk,
        emailOnActionOverdue,
        emailOnStageChange,
        emailOnTeamActivity,
        emailDigestFrequency,
      });
      toast.success("Notification preferences saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 w-full max-w-4xl mx-auto max-sm:px-3 max-sm:pb-6 overflow-x-hidden" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
              Notification preferences
            </h1>
            <p className="text-sm text-white/40">
              Choose when to receive email notifications
            </p>
          </div>
          <Link
            href="/settings"
            className="text-sm text-white/50 hover:text-white min-h-[44px] flex items-center max-sm:shrink-0"
          >
            ← Back to settings
          </Link>
        </div>

        <div
          className="rounded-2xl p-6 max-w-2xl max-sm:p-4 max-sm:max-w-none"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 max-sm:gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    Deal at risk
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Email when a deal becomes high or critical risk
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailOnDealAtRisk}
                  onClick={() => setEmailOnDealAtRisk(!emailOnDealAtRisk)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 max-sm:self-end ${emailOnDealAtRisk ? "bg-[#8b1a1a]" : "bg-white/10"
                    }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailOnDealAtRisk ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 max-sm:gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    Action overdue
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Email when a recommended action is overdue
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailOnActionOverdue}
                  onClick={() => setEmailOnActionOverdue(!emailOnActionOverdue)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 max-sm:self-end ${emailOnActionOverdue ? "bg-[#8b1a1a]" : "bg-white/10"
                    }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailOnActionOverdue ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 max-sm:gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    Stage change
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Email when a deal moves to a new stage
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailOnStageChange}
                  onClick={() => setEmailOnStageChange(!emailOnStageChange)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 max-sm:self-end ${emailOnStageChange ? "bg-[#8b1a1a]" : "bg-white/10"
                    }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailOnStageChange ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 max-sm:gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    Team activity
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Email for team invites and mentions
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={emailOnTeamActivity}
                  onClick={() => setEmailOnTeamActivity(!emailOnTeamActivity)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 max-sm:self-end ${emailOnTeamActivity ? "bg-[#8b1a1a]" : "bg-white/10"
                    }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailOnTeamActivity ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>

              <div>
                <label
                  htmlFor="digest"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email digest frequency
                </label>
                <select
                  id="digest"
                  value={emailDigestFrequency}
                  onChange={(e) =>
                    setEmailDigestFrequency(e.target.value as DigestFrequency)
                  }
                  className="w-full max-w-xs max-sm:max-w-none px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-red-600/50 focus:outline-none"
                >
                  <option value="realtime">Realtime</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] disabled:opacity-50 transition-colors max-sm:w-full max-sm:min-h-[44px]"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
