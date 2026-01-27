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

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-white/10 animate-pulse" />
            AI Deal Summary
          </h2>
        </div>
        <p className="text-sm text-white/40">Generating summary…</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
            />
          </svg>
          AI Deal Summary
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="text-sm font-medium text-white/50 hover:text-white transition-colors disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh Summary"}
        </button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <p className="text-white/80 whitespace-pre-wrap">{summary ?? "—"}</p>
      </div>
    </div>
  );
}
