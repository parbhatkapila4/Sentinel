import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_ORDER } from "@/lib/config";
import { format } from "date-fns";
import {
  calculatePipelineMetrics,
  calculateDealActivity,
  calculateRiskDistribution,
  getStageDistribution,
  getValueByStage,
} from "@/lib/analytics";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { ReportActions } from "@/components/report-actions";
import { QuickReports } from "@/components/quick-reports";
import { formatRevenue } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  noStore();
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dataError = false;
  try {
    deals = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/reports");
    }
    dataError = true;
  }

  const { totalDeals, totalValue, avgDealValue } =
    calculatePipelineMetrics(deals);
  const {
    recentDeals,
    thirtyDayDeals,
    recentDealsValue,
    thirtyDayValue,
    avgDealAge,
    avgDaysSinceActivity,
  } = calculateDealActivity(deals);
  const riskDist = calculateRiskDistribution(deals);
  const stageDistribution = getStageDistribution(deals);
  const valueByStage = getValueByStage(deals);

  const avgValueByStage: Record<string, number> = {};
  for (const stage of Object.keys(stageDistribution)) {
    const count = stageDistribution[stage] ?? 0;
    const value = valueByStage[stage] ?? 0;
    avgValueByStage[stage] = count > 0 ? value / count : 0;
  }

  const now = new Date();
  const reportDate = format(now, "MMMM d, yyyy");
  const reportTime = format(now, "h:mm a");

  const activeDeals = deals.filter(
    (d) => d.status === "active" || d.status === "Active"
  );
  const atRiskDeals = deals.filter((d) => d.status === "at_risk");
  const dealsWithActions = deals.filter((d) => d.recommendedAction != null);
  const overdueDeals = deals.filter((d) => d.isActionOverdue === true);

  const avgRiskScore =
    totalDeals > 0
      ? deals.reduce((sum, d) => sum + d.riskScore, 0) / totalDeals
      : 0;

  const topDeals = [...deals].sort((a, b) => b.value - a.value).slice(0, 5);
  const topDealsValue = topDeals.reduce((sum, d) => sum + d.value, 0);
  const topDealsPercentage =
    totalValue > 0 ? (topDealsValue / totalValue) * 100 : 0;

  const sortedStages = Object.keys(stageDistribution).sort((a, b) => {
    const orderA = STAGE_ORDER[a.toLowerCase()] ?? 99;
    const orderB = STAGE_ORDER[b.toLowerCase()] ?? 99;
    return orderA - orderB;
  });

  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < sortedStages.length - 1; i++) {
    const currentStage = sortedStages[i];
    const nextStage = sortedStages[i + 1];
    const nextCount = stageDistribution[nextStage] ?? 0;
    const totalAfterCurrent = deals.filter(
      (d) =>
        (STAGE_ORDER[d.stage.toLowerCase()] ?? 99) >=
        (STAGE_ORDER[currentStage.toLowerCase()] ?? 99)
    ).length;
    conversionRates[currentStage] =
      totalAfterCurrent > 0 ? (nextCount / totalAfterCurrent) * 100 : 0;
  }

  const { low: lowRisk, medium: mediumRisk, high: highRisk } = riskDist;

  const wonDeals = deals.filter((d) => d.stage === "closed_won");
  const pipelineStageCounts = activeDeals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const quickReportsSummary = {
    pipeline: {
      activeCount: activeDeals.length,
      totalValue: activeDeals.reduce((s, d) => s + d.value, 0),
      stageCounts: pipelineStageCounts,
    },
    won: {
      count: wonDeals.length,
      totalValue: wonDeals.reduce((s, d) => s + d.value, 0),
    },
    atRisk: {
      count: atRiskDeals.length,
      totalValue: atRiskDeals.reduce((s, d) => s + d.value, 0),
    },
  };

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          {dataError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/10">
              <p className="text-sm font-medium text-amber-200">Data temporarily unavailable</p>
              <p className="text-xs text-amber-200/70 mt-1">Check your connection and try again.</p>
            </div>
          )}
          <header className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Dashboard</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}>Reports</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
                  Comprehensive pipeline and performance analytics.
                </p>
              </div>
              <ReportActions />
            </div>
          </header>

          {deals.length === 0 ? (
            <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
              <div className={`${CARD_CLASS} text-center py-12 sm:py-16`}>
                <p className="text-white/50 text-sm font-medium">No data to report</p>
                <p className="text-white/40 text-xs mt-1.5 max-w-md mx-auto">Create deals to generate comprehensive reports and analytics.</p>
                <Link
                  href="/deals/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors mt-6"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create deal
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
                <div className={`${CARD_CLASS}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="border-l-2 border-[#0f766e] pl-3">
                      <h2 className="text-xl font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Pipeline summary report</h2>
                      <p className="text-sm text-white/50 mt-1">Generated on {reportDate} at {reportTime}</p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-xs font-medium text-white/50">Report period</p>
                      <p className="text-base font-semibold text-white">All time</p>
                      <p className="text-xs text-white/40 mt-1">{totalDeals} deals analyzed</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Key metrics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                  <PipelineValueCard totalValue={totalValue} className="border-white/8! bg-[#080808]! hover:border-white/10! shadow-none! card-elevated" />

                  <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-white/70">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white/50 truncate">Total deals</p>
                        <p className="text-[11px] text-white/40 truncate">In pipeline</p>
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{totalDeals}</p>
                    <p className="text-xs text-teal-400/80">{recentDeals.length} new this week</p>
                  </div>

                  <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-700/10 text-green-400 border border-green-700/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white/50 truncate">Avg deal size</p>
                        <p className="text-[11px] text-white/40 truncate">Per deal</p>
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{formatRevenue(avgDealValue)}</p>
                    <p className="text-xs text-white/40">Across all stages</p>
                  </div>

                  <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-700/10 text-red-400 border border-red-700/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white/50 truncate">At risk</p>
                        <p className="text-[11px] text-white/40 truncate">Requires attention</p>
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{atRiskDeals.length}</p>
                    <p className="text-xs text-red-400/80">{formatRevenue(highRisk.value)} at risk</p>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Activity & risk</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-white/20 pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Recent activity</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/50">Last 7 days</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{recentDeals.length}</p>
                          <p className="text-xs text-white/50">{formatRevenue(recentDealsValue)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/50">Last 30 days</span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{thirtyDayDeals.length}</p>
                          <p className="text-xs text-white/50">{formatRevenue(thirtyDayValue)}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">Avg deal age</span>
                          <span className="text-sm font-semibold text-white">{avgDealAge.toFixed(0)} days</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-white/50">Avg days since activity</span>
                          <span className="text-sm font-semibold text-white">{avgDaysSinceActivity.toFixed(0)} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-[#0f766e] pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Risk distribution</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-700/20 border border-green-700/30">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-700 shrink-0" />
                          <span className="text-sm font-medium text-white">Low risk</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-green-400">{lowRisk.count}</span>
                          <p className="text-xs text-white/50">{formatRevenue(lowRisk.value)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-700/20 border border-amber-700/30">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-700 shrink-0" />
                          <span className="text-sm font-medium text-white">Medium risk</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-amber-400">{mediumRisk.count}</span>
                          <p className="text-xs text-white/50">{formatRevenue(mediumRisk.value)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-700/20 border border-red-700/30">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-700 shrink-0" />
                          <span className="text-sm font-medium text-white">High risk</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-red-400">{highRisk.count}</span>
                          <p className="text-xs text-white/50">{formatRevenue(highRisk.value)}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">Avg risk score</span>
                          <span className="text-sm font-semibold text-white">{(avgRiskScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.12s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Summary</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-white/20 pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Action items</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white/50">Deals needing action</span>
                          <span className="text-sm font-semibold text-white">{dealsWithActions.length}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white/50">Overdue actions</span>
                          <span className="text-sm font-semibold text-amber-400">{overdueDeals.length}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white/50">Active deals</span>
                          <span className="text-sm font-semibold text-white">{activeDeals.length}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">Top 5 deals value</span>
                          <span className="text-sm font-semibold text-white">{formatRevenue(topDealsValue)}</span>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{topDealsPercentage.toFixed(1)}% of total pipeline</p>
                      </div>
                    </div>
                  </div>

                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-[#0f766e] pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Performance summary</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                        <p className="text-xs font-medium text-white/50 mb-2">This week</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-white/50 mb-1">Deals created</p>
                            <p className="text-lg font-bold text-white">
                              {deals.filter((d) => {
                                const created = new Date(d.createdAt);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return created >= weekAgo;
                              }).length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-1">Value added</p>
                            <p className="text-lg font-bold text-green-400">
                              {formatRevenue(
                                deals.filter((d) => {
                                  const created = new Date(d.createdAt);
                                  const weekAgo = new Date();
                                  weekAgo.setDate(weekAgo.getDate() - 7);
                                  return created >= weekAgo;
                                }).reduce((acc, d) => acc + d.value, 0)
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-1">Closed won</p>
                            <p className="text-lg font-bold text-teal-400">
                              {deals.filter((d) => {
                                const created = new Date(d.createdAt);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return d.stage === "closed_won" && created >= weekAgo;
                              }).length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                        <p className="text-xs font-medium text-white/50 mb-3">Conversion funnel</p>
                        <div className="space-y-2">
                          {[
                            { from: "lead", to: "qualified", label: "Lead → Qualified" },
                            { from: "qualified", to: "proposal", label: "Qualified → Proposal" },
                            { from: "proposal", to: "negotiation", label: "Proposal → Negotiation" },
                            { from: "negotiation", to: "closed_won", label: "Negotiation → Won" },
                          ].map(({ from, to, label }) => {
                            const fromCount = deals.filter((d) => d.stage === from || d.stage === to || d.stage === "closed_won" || d.stage === "closed_lost").length;
                            const toCount = deals.filter((d) => d.stage === to || d.stage === "closed_won").length;
                            const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
                            return (
                              <div key={from} className="flex items-center justify-between">
                                <span className="text-xs text-white/60">{label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0f766e] rounded-full" style={{ width: `${rate}%` }} />
                                  </div>
                                  <span className="text-xs font-medium text-white w-8 text-right">{rate}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-700/10 border border-amber-700/20">
                        <p className="text-xs font-medium text-amber-400/90 mb-1">Highest value deal</p>
                        {deals.length > 0 ? (
                          <>
                            <p className="text-sm font-medium text-white truncate">
                              {deals.reduce((max, d) => d.value > max.value ? d : max, deals[0]).name}
                            </p>
                            <p className="text-lg font-bold text-amber-400">
                              {formatRevenue(deals.reduce((max, d) => d.value > max.value ? d : max, deals[0]).value)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-white/50">No deals yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Pipeline</p>
                <div className={CARD_CLASS}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="border-l-2 border-[#0f766e] pl-3">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Pipeline by stage</h3>
                      <span className="text-xs text-white/50 mt-0.5">{sortedStages.length} stages</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/6">
                          <th className="text-left py-3 px-4 text-xs font-medium text-white/50">Stage</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-white/50">Deals</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-white/50">Total value</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-white/50">Avg value</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-white/50">% of total</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-white/50">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStages.map((stage) => {
                          const count = stageDistribution[stage] || 0;
                          const value = valueByStage[stage] || 0;
                          const avgValue = avgValueByStage[stage] || 0;
                          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                          const conversion = conversionRates[stage] || 0;
                          return (
                            <tr key={stage} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-white capitalize">{stage}</span>
                              </td>
                              <td className="py-3 px-4 text-sm text-white text-right">{count}</td>
                              <td className="py-3 px-4 text-sm font-semibold text-white text-right">{formatRevenue(value)}</td>
                              <td className="py-3 px-4 text-sm text-white/60 text-right">{formatRevenue(avgValue)}</td>
                              <td className="py-3 px-4 text-sm text-white/60 text-right">{percentage.toFixed(1)}%</td>
                              <td className="py-3 px-4 text-sm text-white/60 text-right">{conversion > 0 ? `${conversion.toFixed(0)}%` : "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/6">
                          <td className="py-3 px-4 text-sm font-semibold text-white">Total</td>
                          <td className="py-3 px-4 text-sm font-semibold text-white text-right">{totalDeals}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-white text-right">{formatRevenue(totalValue)}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-white text-right">{formatRevenue(avgDealValue)}</td>
                          <td className="py-3 px-4 text-sm text-white/60 text-right">100%</td>
                          <td className="py-3 px-4 text-sm text-white/60 text-right">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Charts & quick reports</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-white/20 pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Activity by day</h3>
                    </div>
                    <div className="space-y-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                        const dayNumber = index === 6 ? 0 : index + 1;
                        const dayDeals = deals.filter((d) => new Date(d.createdAt).getDay() === dayNumber).length;
                        const maxDeals = Math.max(...[0, 1, 2, 3, 4, 5, 6].map((i) => deals.filter((d) => new Date(d.createdAt).getDay() === (i === 6 ? 0 : i + 1)).length), 1);
                        const intensity = maxDeals > 0 ? dayDeals / maxDeals : 0;
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <span className="text-xs text-white/60 w-8">{day}</span>
                            <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden">
                              <div className="h-full bg-[#0f766e] rounded transition-all" style={{ width: `${intensity * 100}%`, opacity: 0.4 + intensity * 0.6 }} />
                            </div>
                            <span className="text-xs font-medium text-white w-6 text-right">{dayDeals}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-white/20 pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Deal age distribution</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "< 7 days", min: 0, max: 7 },
                        { label: "7-14 days", min: 7, max: 14 },
                        { label: "14-30 days", min: 14, max: 30 },
                        { label: "30-60 days", min: 30, max: 60 },
                        { label: "60+ days", min: 60, max: Infinity },
                      ].map(({ label, min, max }) => {
                        const count = deals.filter((d) => {
                          const age = Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                          return age >= min && age < max;
                        }).length;
                        const percentage = deals.length > 0 ? (count / deals.length) * 100 : 0;
                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/60">{label}</span>
                              <span className="text-xs font-medium text-white">{count} deals</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${max <= 14 ? "bg-green-700" : max <= 30 ? "bg-amber-700" : max <= 60 ? "bg-amber-600" : "bg-red-700"}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={CARD_CLASS}>
                    <div className="border-l-2 border-[#0f766e] pl-3 mb-4">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Quick reports</h3>
                    </div>
                    <QuickReports summary={quickReportsSummary} />
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Deal list</p>
                <div className={CARD_CLASS}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="border-l-2 border-white/20 pl-3">
                      <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Deal details</h3>
                      <span className="text-xs text-white/50 mt-0.5">{deals.length} total deals</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/6">
                          <th className="text-left px-6 py-4 text-xs font-medium text-white/50">Deal name</th>
                          <th className="text-left px-6 py-4 text-xs font-medium text-white/50">Stage</th>
                          <th className="text-right px-6 py-4 text-xs font-medium text-white/50">Value</th>
                          <th className="text-center px-6 py-4 text-xs font-medium text-white/50">Risk</th>
                          <th className="text-left px-6 py-4 text-xs font-medium text-white/50">Status</th>
                          <th className="text-left px-6 py-4 text-xs font-medium text-white/50">Next action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((deal) => {
                          const riskLevel = formatRiskLevel(deal.riskScore);
                          return (
                            <tr key={deal.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                              <td className="px-6 py-4">
                                <Link href={`/deals/${deal.id}`} className="text-sm font-medium text-white hover:text-teal-400 transition-colors">
                                  {deal.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/60 capitalize">{deal.stage}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-white text-right">{formatRevenue(deal.value)}</td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium ${deal.status === "closed"
                                    ? "bg-white/10 text-white/70 border border-white/20"
                                    : riskLevel === "High"
                                      ? "bg-red-700/20 text-red-400 border border-red-700/30"
                                      : riskLevel === "Medium"
                                        ? "bg-amber-700/20 text-amber-400 border border-amber-700/30"
                                        : "bg-green-700/20 text-green-400 border border-green-700/30"
                                    }`}
                                >
                                  {deal.status === "closed" ? "Closed" : riskLevel}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {deal.status === "closed" ? (
                                  <span className="text-white/60">Closed</span>
                                ) : deal.status === "at_risk" ? (
                                  <span className="text-red-400">At risk</span>
                                ) : (
                                  <span className="text-green-400">Active</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-white/60">{deal.recommendedAction?.label || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
