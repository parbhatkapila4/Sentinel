"use client";

import { useState, useEffect } from "react";
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

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-4xl mx-auto max-sm:px-3 max-sm:pb-6 overflow-x-hidden">
          <header className="mb-8">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Settings</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Notification <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>preferences</span>
            </h1>
            <p className="mt-3 text-base text-white/60">
              Choose when to receive email notifications
            </p>
          </header>

          <div className={`${CARD_CLASS} max-w-2xl max-sm:max-w-none`}>
            {loading ? (
              <p className="text-white/50">Loading…</p>
            ) : (
              <div className="space-y-6">
                {[
                  { state: emailOnDealAtRisk, set: setEmailOnDealAtRisk, label: "Deal at risk", desc: "Email when a deal becomes high or critical risk" },
                  { state: emailOnActionOverdue, set: setEmailOnActionOverdue, label: "Action overdue", desc: "Email when a recommended action is overdue" },
                  { state: emailOnStageChange, set: setEmailOnStageChange, label: "Stage change", desc: "Email when a deal moves to a new stage" },
                  { state: emailOnTeamActivity, set: setEmailOnTeamActivity, label: "Team activity", desc: "Email for team invites and mentions" },
                ].map(({ state, set, label, desc }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-white/6 last:border-0 max-sm:gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={state}
                      onClick={() => set(!state)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 max-sm:self-end ${state ? "bg-[#0f766e]" : "bg-white/10"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${state ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                ))}

                <div className="pt-2">
                  <label htmlFor="digest" className="block text-xs font-medium text-white/50 mb-2">
                    Email digest frequency
                  </label>
                  <select
                    id="digest"
                    value={emailDigestFrequency}
                    onChange={(e) => setEmailDigestFrequency(e.target.value as DigestFrequency)}
                    className="w-full max-w-xs max-sm:max-w-none px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/8 focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 outline-none transition-colors"
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
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 disabled:opacity-50 transition-colors max-sm:w-full max-sm:min-h-[44px]"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
