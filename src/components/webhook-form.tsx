"use client";

import { useState } from "react";
import { createWebhook, updateWebhook } from "@/app/actions/webhooks";
import { toast } from "sonner";

const WEBHOOK_EVENTS = [
  { value: "deal.created", label: "Deal created" },
  { value: "deal.updated", label: "Deal updated" },
  { value: "deal.stage_changed", label: "Deal stage changed" },
  { value: "deal.at_risk", label: "Deal at risk" },
  { value: "deal.closed_won", label: "Deal closed won" },
  { value: "deal.closed_lost", label: "Deal closed lost" },
] as const;

interface WebhookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  edit?: {
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
  };
}

export function WebhookForm({
  onSuccess,
  onCancel,
  edit,
}: WebhookFormProps) {
  const [name, setName] = useState(edit?.name ?? "");
  const [url, setUrl] = useState(edit?.url ?? "");
  const [events, setEvents] = useState<Set<string>>(
    new Set(edit?.events ?? [])
  );
  const [isActive, setIsActive] = useState(edit?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  function toggleEvent(value: string) {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    if (events.size === 0) {
      toast.error("Select at least one event");
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    setSaving(true);
    try {
      if (edit) {
        await updateWebhook(edit.id, {
          name: name.trim(),
          url: url.trim(),
          events: Array.from(events),
          isActive,
        });
        toast.success("Webhook updated");
      } else {
        await createWebhook({
          name: name.trim(),
          url: url.trim(),
          events: Array.from(events),
        });
        toast.success("Webhook created");
      }
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
        <label className="block text-sm font-medium text-white mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Production webhook"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-endpoint.com/webhook"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Events
        </label>
        <div className="flex flex-wrap gap-3">
          {WEBHOOK_EVENTS.map((ev) => (
            <label
              key={ev.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={events.has(ev.value)}
                onChange={() => toggleEvent(ev.value)}
                className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
              />
              <span className="text-sm text-white/80">{ev.label}</span>
            </label>
          ))}
        </div>
      </div>
      {edit && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="webhook-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
          />
          <label htmlFor="webhook-active" className="text-sm text-white/80">
            Active
          </label>
        </div>
      )}
      <div className="flex gap-3 max-sm:flex-col max-sm:gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 transition-colors max-sm:min-h-[44px]"
        >
          {saving ? "Saving…" : edit ? "Update" : "Create"}
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
