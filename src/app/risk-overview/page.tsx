import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  getAllDeals,
  getFounderRiskOverview,
  getFounderActionQueue,
} from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { DashboardLayout } from "@/components/dashboard-layout";
import { formatRevenue, formatValueInMillions } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RiskOverviewPage() {
  noStore();
  const deals = await getAllDeals();
  const riskOverview = await getFounderRiskOverview();
  const actionQueue = await getFounderActionQueue();

  const highRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const mediumRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  );
  const lowRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  );

  const avgRiskScore =
    deals.length > 0
      ? deals.reduce((sum, d) => sum + d.riskScore, 0) / deals.length
      : 0;

  const highRiskValue = highRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const mediumRiskValue = mediumRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const lowRiskValue = lowRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const valueAtRiskPercentage =
    totalValue > 0 ? (highRiskValue / totalValue) * 100 : 0;

  const highRiskWithAge = highRiskDeals
    .map((deal) => ({
      deal,
      riskAge: deal.riskAgeInDays || 0,
    }))
    .sort((a, b) => b.riskAge - a.riskAge);
  const avgRiskAge =
    highRiskWithAge.length > 0
      ? highRiskWithAge.reduce((sum, d) => sum + d.riskAge, 0) /
        highRiskWithAge.length
      : 0;

  const stageRiskDistribution: Record<
    string,
    { high: number; medium: number; low: number; total: number }
  > = {};
  deals.forEach((deal) => {
    if (!stageRiskDistribution[deal.stage]) {
      stageRiskDistribution[deal.stage] = {
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      };
    }
    const riskLevel = formatRiskLevel(deal.riskScore);
    stageRiskDistribution[deal.stage][
      riskLevel.toLowerCase() as "high" | "medium" | "low"
    ]++;
    stageRiskDistribution[deal.stage].total++;
  });

  const riskReasonsCount: Record<string, number> = {};
  highRiskDeals.forEach((deal) => {
    if (deal.primaryRiskReason) {
      riskReasonsCount[deal.primaryRiskReason] =
        (riskReasonsCount[deal.primaryRiskReason] || 0) + 1;
    }
  });

  const overdueDeals = deals.filter((d) => d.isActionOverdue);
  const overdueValue = overdueDeals.reduce((sum, d) => sum + d.value, 0);
  const avgOverdueDays =
    overdueDeals.length > 0
      ? overdueDeals.reduce((sum, d) => sum + (d.actionOverdueByDays || 0), 0) /
        overdueDeals.length
      : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEscalations = highRiskDeals.filter((deal) => {
    if (!deal.riskStartedAt) return false;
    return new Date(deal.riskStartedAt) >= sevenDaysAgo;
  }).length;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Risk Overview
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              Comprehensive risk analysis and management across your pipeline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#2a0f12] bg-gradient-to-br from-[#1f0b0d] via-[#181013] to-[#0e0d0d] p-5 shadow-[0_25px_80px_rgba(239,68,68,0.25)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d1115] text-[#f87171] border border-[#3a1418] max-sm:h-8 max-sm:w-8 flex-shrink-0">
                <svg
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.08em] text-[#fca5a5] max-sm:text-[10px] max-sm:truncate">
                  High Risk Deals
                </p>
                <p className="text-[11px] text-[#9f6168] max-sm:text-[10px] max-sm:truncate">Requires attention</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 max-sm:text-2xl max-sm:truncate">
              {riskOverview.atRiskDealsCount}
            </p>
            <p className="text-xs text-[#fca5a5] max-sm:text-[10px] max-sm:truncate">
              {formatRevenue(highRiskValue)} at risk
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#f97316] border border-[#1f1f1f] max-sm:h-8 max-sm:w-8 flex-shrink-0">
                <svg
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  Overdue Actions
                </p>
                <p className="text-[11px] text-[#5f5f5f] max-sm:text-[10px] max-sm:truncate">Past due date</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 max-sm:text-2xl max-sm:truncate">
              {riskOverview.overdueDealsCount}
            </p>
            <p className="text-xs text-[#f97316] max-sm:text-[10px] max-sm:truncate">
              Avg {avgOverdueDays.toFixed(0)} days overdue
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#8b5cf6] border border-[#1f1f1f] max-sm:h-8 max-sm:w-8 flex-shrink-0">
                <svg
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  High Urgency
                </p>
                <p className="text-[11px] text-[#5f5f5f] max-sm:text-[10px] max-sm:truncate">Immediate action</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 max-sm:text-2xl max-sm:truncate">
              {riskOverview.highUrgencyDealsCount}
            </p>
            <p className="text-xs text-[#8b5cf6] max-sm:text-[10px] max-sm:truncate">
              {recentEscalations} escalated this week
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#22c55e] border border-[#1f1f1f] max-sm:h-8 max-sm:w-8 flex-shrink-0">
                <svg
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  Avg Risk Score
                </p>
                <p className="text-[11px] text-[#5f5f5f] max-sm:text-[10px] max-sm:truncate">Pipeline health</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 max-sm:text-2xl max-sm:truncate">
              {(avgRiskScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-[#22c55e] max-sm:text-[10px] max-sm:truncate">
              {avgRiskScore < 0.4
                ? "Healthy"
                : avgRiskScore < 0.6
                ? "Moderate"
                : "Critical"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-6 max-sm:text-base max-sm:mb-4">
              Risk Distribution
            </h3>
            {deals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 max-sm:text-sm">No deals to analyze</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6 max-sm:mb-4">
                  <div className="relative w-48 h-48 max-sm:w-32 max-sm:h-32">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                      />
                      {deals.length > 0 && (
                        <>
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="12"
                            strokeDasharray={`${
                              (lowRiskDeals.length / deals.length) * 251.2
                            } 251.2`}
                            strokeLinecap="round"
                          />
                          {mediumRiskDeals.length > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="12"
                              strokeDasharray={`${
                                (mediumRiskDeals.length / deals.length) * 251.2
                              } 251.2`}
                              strokeDashoffset={
                                -((lowRiskDeals.length / deals.length) * 251.2)
                              }
                              strokeLinecap="round"
                            />
                          )}
                          {highRiskDeals.length > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="12"
                              strokeDasharray={`${
                                (highRiskDeals.length / deals.length) * 251.2
                              } 251.2`}
                              strokeDashoffset={
                                -(
                                  ((lowRiskDeals.length +
                                    mediumRiskDeals.length) /
                                    deals.length) *
                                  251.2
                                )
                              }
                              strokeLinecap="round"
                            />
                          )}
                        </>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white max-sm:text-2xl">
                        {deals.length}
                      </span>
                      <span className="text-xs text-white/40 max-sm:text-[10px]">Total Deals</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 max-sm:gap-2">
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-sm:p-2">
                    <p className="text-2xl font-bold text-emerald-400 max-sm:text-xl">
                      {lowRiskDeals.length}
                    </p>
                    <p className="text-xs text-white/40 max-sm:text-[10px] max-sm:truncate">Low Risk</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 max-sm:p-2">
                    <p className="text-2xl font-bold text-amber-400 max-sm:text-xl">
                      {mediumRiskDeals.length}
                    </p>
                    <p className="text-xs text-white/40 max-sm:text-[10px] max-sm:truncate">Medium</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 max-sm:p-2">
                    <p className="text-2xl font-bold text-red-400 max-sm:text-xl">
                      {highRiskDeals.length}
                    </p>
                    <p className="text-xs text-white/40 max-sm:text-[10px] max-sm:truncate">High</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-6 max-sm:text-base max-sm:mb-4">
              Value at Risk
            </h3>
            <div className="space-y-4 max-sm:space-y-3">
              <div className="max-sm:min-w-0 max-sm:overflow-hidden">
                <div className="flex items-center justify-between mb-2 max-sm:gap-2 max-sm:mb-1.5">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">
                    High Risk Value
                  </span>
                  <span className="text-lg font-bold text-red-400 max-sm:text-base max-sm:shrink-0">
                    {formatRevenue(highRiskValue)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[#151515] overflow-hidden max-sm:h-2">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                    style={{
                      width: `${valueAtRiskPercentage}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[#7d7d7d] mt-1 max-sm:text-[10px] max-sm:truncate">
                  {valueAtRiskPercentage.toFixed(1)}% of total pipeline
                </p>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-3 max-sm:pt-3 max-sm:space-y-2">
                <div className="flex items-center justify-between max-sm:gap-2 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">Medium Risk</span>
                  <span className="text-sm font-semibold text-white max-sm:text-xs max-sm:shrink-0">
                    {formatRevenue(mediumRiskValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between max-sm:gap-2 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">Low Risk</span>
                  <span className="text-sm font-semibold text-white max-sm:text-xs max-sm:shrink-0">
                    {formatRevenue(lowRiskValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f] max-sm:pt-1.5 max-sm:gap-2 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">Total Pipeline</span>
                  <span className="text-sm font-semibold text-white max-sm:text-xs max-sm:shrink-0">
                    {formatRevenue(totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-6 max-sm:text-base max-sm:mb-4">
              Risk Insights
            </h3>
            <div className="space-y-4 max-sm:space-y-3">
              <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">Avg Risk Age</span>
                  <span className="text-sm font-semibold text-white max-sm:text-xs max-sm:shrink-0">
                    {avgRiskAge.toFixed(0)} days
                  </span>
                </div>
                <p className="text-xs text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  Average time deals have been at risk
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">Overdue Value</span>
                  <span className="text-sm font-semibold text-[#f97316] max-sm:text-xs max-sm:shrink-0">
                    {formatRevenue(overdueValue)}
                  </span>
                </div>
                <p className="text-xs text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  Value in deals with overdue actions
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                  <span className="text-sm text-[#8a8a8a] max-sm:text-xs max-sm:truncate max-sm:min-w-0">
                    Recent Escalations
                  </span>
                  <span className="text-sm font-semibold text-[#8b5cf6] max-sm:text-xs max-sm:shrink-0">
                    {recentEscalations}
                  </span>
                </div>
                <p className="text-xs text-[#7d7d7d] max-sm:text-[10px] max-sm:truncate">
                  Deals that became at-risk this week
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="rounded-2xl border border-[#2a0f12] bg-gradient-to-br from-[#1f0b0d] via-[#181013] to-[#0e0d0d] p-6 shadow-[0_18px_60px_rgba(239,68,68,0.25)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 max-sm:text-base max-sm:mb-3 max-sm:truncate">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Most Critical Deals
            </h3>

            {riskOverview.top3MostCriticalDeals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">No critical deals!</p>
                <p className="text-white/25 text-xs mt-1">
                  Your pipeline is healthy
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskOverview.top3MostCriticalDeals.map((deal, index) => {
                  const dealData = deals.find((d) => d.id === deal.id);
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-red-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-400">
                            #{index + 1}
                          </span>
                          <p className="text-sm font-medium text-white">
                            {deal.name}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                          {deal.riskLevel}
                        </span>
                      </div>
                      {dealData && (
                        <p className="text-xs text-white/60 mb-1">
                          {formatRevenue(dealData.value)}
                        </p>
                      )}
                      <p className="text-xs text-red-400/70 mb-1">
                        {deal.primaryRiskReason}
                      </p>
                      {deal.recommendedAction && (
                        <p className="text-xs text-white/40 mt-1">
                          → {deal.recommendedAction.label}
                        </p>
                      )}
                      {deal.actionOverdueByDays !== null &&
                        deal.actionOverdueByDays > 0 && (
                          <p className="text-xs text-[#f97316] mt-1">
                            {deal.actionOverdueByDays} days overdue
                          </p>
                        )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4 max-sm:text-base max-sm:mb-3 max-sm:truncate">
              Top Risk Reasons
            </h3>
            {Object.keys(riskReasonsCount).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">
                  No risk reasons identified
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(riskReasonsCount)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([reason, count]) => {
                    const percentage =
                      highRiskDeals.length > 0
                        ? (count / highRiskDeals.length) * 100
                        : 0;
                    return (
                      <div
                        key={reason}
                        className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white">{reason}</span>
                          <span className="text-sm font-semibold text-red-400">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#7d7d7d] mt-1">
                          {percentage.toFixed(0)}% of high-risk deals
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-6 max-sm:text-base max-sm:mb-4 max-sm:truncate">
            Risk by Stage
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Object.entries(stageRiskDistribution)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([stage, distribution]) => {
                const highPercentage =
                  distribution.total > 0
                    ? (distribution.high / distribution.total) * 100
                    : 0;
                return (
                  <div
                    key={stage}
                    className="p-4 rounded-xl bg-[#151515] border border-[#1f1f1f]"
                  >
                    <h4 className="text-sm font-semibold text-white mb-3 capitalize">
                      {stage}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500/50" />
                          <span className="text-xs text-[#8a8a8a]">High</span>
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {distribution.high}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                          <span className="text-xs text-[#8a8a8a]">Med</span>
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {distribution.medium}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                          <span className="text-xs text-[#8a8a8a]">Low</span>
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {distribution.low}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#1f1f1f]">
                        <div className="h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                            style={{ width: `${highPercentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#7d7d7d] mt-1">
                          {highPercentage.toFixed(0)}% high risk
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="rounded-2xl border border-[#2a0f12] bg-gradient-to-br from-[#1f0b0d] via-[#181013] to-[#0e0d0d] shadow-[0_18px_60px_rgba(239,68,68,0.25)] max-sm:w-full max-sm:min-w-0 max-sm:overflow-hidden">
            <div className="p-5 border-b border-red-500/20 max-sm:p-4">
              <h3 className="text-base font-semibold text-red-400 flex items-center gap-2 max-sm:text-sm max-sm:truncate">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                Urgent
              </h3>
              <p className="text-xs text-[#9f6168] mt-1">
                {actionQueue.urgent.length} deals need immediate attention
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {actionQueue.urgent.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-4">
                  No urgent deals
                </p>
              ) : (
                actionQueue.urgent.map((deal) => {
                  const dealData = deals.find((d) => d.id === deal.id);
                  const formatted = dealData
                    ? formatValueInMillions(dealData.value)
                    : { value: "0", suffix: "" };
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-red-500/20"
                    >
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {deal.name}
                      </p>
                      <p className="text-xs text-white/60 mb-1">
                        ${formatted.value}
                        {formatted.suffix}
                      </p>
                      <p className="text-xs text-red-400/70">
                        {deal.recommendedAction?.label}
                      </p>
                      {deal.actionOverdueByDays !== null &&
                        deal.actionOverdueByDays > 0 && (
                          <p className="text-[10px] text-[#f97316] mt-1">
                            {deal.actionOverdueByDays} days overdue
                          </p>
                        )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.35)] max-sm:w-full max-sm:min-w-0 max-sm:overflow-hidden">
            <div className="p-5 border-b border-[#1f1f1f] max-sm:p-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2 max-sm:text-sm max-sm:truncate">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                Important
              </h3>
              <p className="text-xs text-[#7d7d7d] mt-1">
                {actionQueue.important.length} deals to monitor
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {actionQueue.important.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-4">
                  No important deals
                </p>
              ) : (
                actionQueue.important.map((deal) => {
                  const dealData = deals.find((d) => d.id === deal.id);
                  const formatted = dealData
                    ? formatValueInMillions(dealData.value)
                    : { value: "0", suffix: "" };
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-3 rounded-xl bg-[#151515] hover:bg-[#1a1a1a] transition-colors border border-[#1f1f1f]"
                    >
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {deal.name}
                      </p>
                      <p className="text-xs text-white/60 mb-1">
                        ${formatted.value}
                        {formatted.suffix}
                      </p>
                      <p className="text-xs text-white/40">
                        {deal.recommendedAction?.label}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.35)] max-sm:w-full max-sm:min-w-0 max-sm:overflow-hidden">
            <div className="p-5 border-b border-[#1f1f1f] max-sm:p-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2 max-sm:text-sm max-sm:truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                On Track
              </h3>
              <p className="text-xs text-[#7d7d7d] mt-1">
                {actionQueue.safe.length} deals progressing well
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {actionQueue.safe.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-4">
                  No safe deals
                </p>
              ) : (
                actionQueue.safe.map((deal) => {
                  const dealData = deals.find((d) => d.id === deal.id);
                  const formatted = dealData
                    ? formatValueInMillions(dealData.value)
                    : { value: "0", suffix: "" };
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-3 rounded-xl bg-[#151515] hover:bg-[#1a1a1a] transition-colors border border-[#1f1f1f]"
                    >
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {deal.name}
                      </p>
                      <p className="text-xs text-white/60 mb-1">
                        ${formatted.value}
                        {formatted.suffix}
                      </p>
                      <p className="text-xs text-white/40">{deal.stage}</p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
