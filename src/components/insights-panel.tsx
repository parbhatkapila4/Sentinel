"use client";

import Link from "next/link";
import {
  identifyDealPatterns,
  detectAnomalies,
  type DealForPrediction,
} from "@/lib/predictions";

interface InsightsPanelProps {
  deals: DealForPrediction[];
}

function toDeal(d: unknown): DealForPrediction {
  const x = d as Record<string, unknown>;
  return {
    id: String(x.id),
    name: String(x.name),
    stage: String(x.stage),
    value: Number(x.value),
    createdAt: x.createdAt instanceof Date ? x.createdAt : new Date(String(x.createdAt)),
    lastActivityAt: x.lastActivityAt instanceof Date ? x.lastActivityAt : new Date(String(x.lastActivityAt ?? x.createdAt)),
    riskScore: Number(x.riskScore ?? 0),
    riskLevel: x.riskLevel != null ? String(x.riskLevel) : undefined,
    status: x.status != null ? String(x.status) : undefined,
  };
}

export function InsightsPanel({ deals }: InsightsPanelProps) {
  const normalized = deals.map(toDeal);
  const { insights, recommendations } = identifyDealPatterns(normalized);
  const { anomalies } = detectAnomalies(normalized);

  return (
    <div className="min-w-0 w-full flex flex-col h-full">
      <h3 className="text-base lg:text-lg font-semibold text-white mb-5 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
        <svg
          className="w-4 h-4 text-[#0ea5e9]/80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
        Insights & recommendations
      </h3>

      {anomalies.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
            Anomaly alerts
          </p>
          <ul className="space-y-2 lg:space-y-3">
            {anomalies.slice(0, 5).map((a, i) => (
              <li
                key={`${a.deal.id}-${i}`}
                className={`flex items-start gap-3 p-4 lg:p-4 rounded-xl text-sm border ${a.severity === "high"
                  ? "bg-red-500/10 border-red-500/20"
                  : a.severity === "medium"
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-white/5 border-white/10"
                  }`}
              >
                <span
                  className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${a.severity === "high" ? "bg-red-400" : a.severity === "medium" ? "bg-amber-400" : "bg-white/40"
                    }`}
                />
                <div>
                  <Link
                    href={`/deals/${a.deal.id}`}
                    className="font-medium text-white hover:underline"
                  >
                    {a.deal.name}
                  </Link>
                  <p className="text-white/60 mt-0.5">{a.reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
            Pattern discoveries
          </p>
          <ul className="space-y-2.5 lg:space-y-3">
            {insights.slice(0, 5).map((ins, i) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span
                  className={
                    ins.impact === "positive"
                      ? "text-emerald-400"
                      : ins.impact === "negative"
                        ? "text-amber-400"
                        : "text-white/40"
                  }
                >
                  •
                </span>
                <span>{ins.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
            Recommendations
          </p>
          <ul className="space-y-2.5 lg:space-y-3">
            {recommendations.slice(0, 4).map((r, i) => (
              <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.length === 0 && recommendations.length === 0 && anomalies.length === 0 && (
        <p className="text-sm text-white/40">
          Add and close more deals to unlock pattern insights and recommendations.
        </p>
      )}
    </div>
  );
}
