"use client";

import React, { useState } from "react";
import { formatRevenue } from "@/lib/utils";

type ReportId = "pipeline" | "won" | "at-risk" | null;

export type QuickReportsSummary = {
  pipeline: { activeCount: number; totalValue: number; stageCounts: Record<string, number> };
  won: { count: number; totalValue: number };
  atRisk: { count: number; totalValue: number };
};

const REPORTS: {
  id: ReportId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  borderHover: string;
}[] = [
    {
      id: "pipeline",
      title: "Pipeline Summary",
      subtitle: "All active deals overview",
      borderHover: "hover:border-blue-500/30",
      icon: (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "won",
      title: "Won Deals Report",
      subtitle: "Closed deals this month",
      borderHover: "hover:border-green-500/30",
      icon: (
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "at-risk",
      title: "At-Risk Analysis",
      subtitle: "Deals needing attention",
      borderHover: "hover:border-red-500/30",
      icon: (
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

function formatStageName(stage: string): string {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function QuickReports({ summary }: { summary: QuickReportsSummary }) {
  const [openReport, setOpenReport] = useState<ReportId>(null);
  const report = REPORTS.find((r) => r.id === openReport);

  const renderModalContent = () => {
    if (!report) return null;
    if (report.id === "pipeline") {
      const { activeCount, totalValue, stageCounts } = summary.pipeline;
      const stages = Object.entries(stageCounts).filter(([, c]) => c > 0);
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Active deals</p>
              <p className="text-xl font-semibold text-white">{activeCount}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total value</p>
              <p className="text-xl font-semibold text-white">{formatRevenue(totalValue)}</p>
            </div>
          </div>
          {stages.length > 0 && (
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">By stage</p>
              <ul className="space-y-1">
                {stages.map(([stage, count]) => (
                  <li key={stage} className="text-sm text-white/80 flex justify-between">
                    <span>{formatStageName(stage)}</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    if (report.id === "won") {
      const { count, totalValue } = summary.won;
      return (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Won deals</p>
            <p className="text-xl font-semibold text-white">{count}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Value closed</p>
            <p className="text-xl font-semibold text-white">{formatRevenue(totalValue)}</p>
          </div>
        </div>
      );
    }
    if (report.id === "at-risk") {
      const { count, totalValue } = summary.atRisk;
      return (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Deals at risk</p>
            <p className="text-xl font-semibold text-white">{count}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Value at risk</p>
            <p className="text-xl font-semibold text-white">{formatRevenue(totalValue)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="space-y-3">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setOpenReport(r.id)}
            className={`w-full flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 ${r.borderHover} hover:bg-white/10 transition-all text-left`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.id === "pipeline"
                    ? "bg-blue-500/20"
                    : r.id === "won"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
              >
                {r.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{r.title}</p>
                <p className="text-xs text-white/50">{r.subtitle}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {report && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setOpenReport(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-report-title"
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#131313] shadow-2xl p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.id === "pipeline"
                      ? "bg-blue-500/20"
                      : report.id === "won"
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                >
                  {report.icon}
                </div>
                <h2 id="quick-report-title" className="text-lg font-semibold text-white truncate">
                  {report.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenReport(null)}
                className="shrink-0 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
}
