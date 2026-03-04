"use client";

import { useState, useEffect } from "react";
import { generateDealSummary } from "@/app/actions/ai";

interface DealSummaryCardProps {
  dealId: string;
}

export function DealSummaryCard({ dealId }: DealSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (summary === null) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const s = await generateDealSummary(dealId);
      setSummary(s);
    } catch (e) {
      console.error("Failed to load deal summary:", e);
      setSummary("Unable to generate summary. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  const cardClass = "rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white border-l-2 border-white/20 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            Summary
          </h2>
        </div>
        <p className="text-sm text-white/50">Generating…</p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white border-l-2 border-white/20 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
          Summary
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{summary ?? "-"}</p>
      </div>
    </div>
  );
}
