"use client";

import { useState } from "react";
import { createSlackIntegration } from "@/app/actions/slack";
import { toast } from "sonner";

const SLACK_EVENTS = [
  { value: "deal.at_risk", label: "Deal at risk" },
  { value: "deal.closed_won", label: "Deal closed won" },
  { value: "deal.stage_changed", label: "Deal stage changed" },
] as const;

interface SlackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SlackForm({ onSuccess, onCancel }: SlackFormProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [notifyOn, setNotifyOn] = useState<Set<string>>(new Set(["deal.at_risk", "deal.closed_won", "deal.stage_changed"]));
  const [saving, setSaving] = useState(false);

  function toggleEvent(value: string) {
    setNotifyOn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      toast.error("Webhook URL is required");
      return;
    }
    if (notifyOn.size === 0) {
      toast.error("Select at least one event");
      return;
    }
    try {
      new URL(webhookUrl.trim());
    } catch {
      toast.error("Enter a valid webhook URL");
      return;
    }
    setSaving(true);
    try {
      await createSlackIntegration({
        webhookUrl: webhookUrl.trim(),
        channelName: channelName.trim() || undefined,
        notifyOn: Array.from(notifyOn),
      });
      toast.success("Slack integration added");
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Slack Incoming Webhook URL
        </label>
        <input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/…"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
        />
        <p className="text-xs text-white/40 mt-1">
          Create an Incoming Webhook in your Slack workspace and paste the URL
          here.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Channel name <span className="text-white/40">(optional)</span>
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="e.g. #deals"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Notify on
        </label>
        <div className="flex flex-wrap gap-3">
          {SLACK_EVENTS.map((ev) => (
            <label
              key={ev.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={notifyOn.has(ev.value)}
                onChange={() => toggleEvent(ev.value)}
                className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
              />
              <span className="text-sm text-white/80">{ev.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 max-sm:flex-col max-sm:gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 transition-colors max-sm:min-h-[44px]"
        >
          {saving ? "Saving…" : "Connect"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors max-sm:min-h-[44px]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
