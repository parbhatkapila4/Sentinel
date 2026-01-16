import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { format, subDays, isAfter, differenceInDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { ReportActions } from "@/components/report-actions";
import { formatRevenue, formatValueInMillions } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  noStore();
  const deals = await getAllDeals();

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);
  const ninetyDaysAgo = subDays(now, 90);

  const recentDeals = deals.filter((d) =>
    isAfter(new Date(d.createdAt), sevenDaysAgo)
  );
  const recentDealsValue = recentDeals.reduce((sum, d) => sum + d.value, 0);

  const thirtyDayDeals = deals.filter((d) =>
    isAfter(new Date(d.createdAt), thirtyDaysAgo)
  );
  const thirtyDayValue = thirtyDayDeals.reduce((sum, d) => sum + d.value, 0);

  const highRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const mediumRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  );
  const lowRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  );

  const highRiskValue = highRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const mediumRiskValue = mediumRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const lowRiskValue = lowRiskDeals.reduce((sum, d) => sum + d.value, 0);

  const avgRiskScore =
    totalDeals > 0
      ? deals.reduce((sum, d) => sum + d.riskScore, 0) / totalDeals
      : 0;

  const stageDistribution = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const valueByStage = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + deal.value;
    return acc;
  }, {} as Record<string, number>);

  const avgValueByStage: Record<string, number> = {};
  Object.keys(stageDistribution).forEach((stage) => {
    const count = stageDistribution[stage];
    const value = valueByStage[stage] || 0;
    avgValueByStage[stage] = count > 0 ? value / count : 0;
  });

  const reportDate = format(now, "MMMM d, yyyy");
  const reportTime = format(now, "h:mm a");

  const activeDeals = deals.filter(
    (d) => d.status === "active" || d.status === "Active"
  );
  const atRiskDeals = deals.filter((d) => d.status === "at_risk");

  const dealsWithActions = deals.filter((d) => d.recommendedAction !== null);
  const overdueDeals = deals.filter((d) => d.isActionOverdue);

  const avgDealAge =
    totalDeals > 0
      ? deals.reduce((sum, deal) => {
          const age = differenceInDays(now, new Date(deal.createdAt));
          return sum + age;
        }, 0) / totalDeals
      : 0;

  const avgDaysSinceActivity =
    totalDeals > 0
      ? deals.reduce((sum, deal) => {
          const days = differenceInDays(now, new Date(deal.lastActivityAt));
          return sum + days;
        }, 0) / totalDeals
      : 0;

  const topDeals = [...deals].sort((a, b) => b.value - a.value).slice(0, 5);
  const topDealsValue = topDeals.reduce((sum, d) => sum + d.value, 0);
  const topDealsPercentage =
    totalValue > 0 ? (topDealsValue / totalValue) * 100 : 0;

  const stageOrder: Record<string, number> = {
    discover: 1,
    qualify: 2,
    proposal: 3,
    negotiation: 4,
    closed: 5,
  };

  const sortedStages = Object.keys(stageDistribution).sort((a, b) => {
    const orderA = stageOrder[a.toLowerCase()] ?? 99;
    const orderB = stageOrder[b.toLowerCase()] ?? 99;
    return orderA - orderB;
  });

  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < sortedStages.length - 1; i++) {
    const currentStage = sortedStages[i];
    const nextStage = sortedStages[i + 1];
    const currentCount = stageDistribution[currentStage] || 0;
    const nextCount = stageDistribution[nextStage] || 0;
    const totalAfterCurrent = deals.filter(
      (d) =>
        (stageOrder[d.stage.toLowerCase()] ?? 99) >=
        (stageOrder[currentStage.toLowerCase()] ?? 99)
    ).length;
    conversionRates[currentStage] =
      totalAfterCurrent > 0 ? (nextCount / totalAfterCurrent) * 100 : 0;
  }

  return (
    <DashboardLayout>
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Reports</h1>
            <p className="text-sm text-[#8a8a8a]">
              Comprehensive pipeline and performance analytics
            </p>
          </div>
          <ReportActions />
        </div>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-16 text-center shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-[#151515] border border-[#1f1f1f]">
              <svg
                className="w-10 h-10 text-[#8a8a8a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No data to report
            </h3>
            <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
              Create deals to generate comprehensive reports and analytics.
            </p>
            <Link
              href="/deals/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all bg-[#d51024] hover:bg-[#b80e1f]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Deal
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#1f1f1f] bg-gradient-to-br from-[#151515] via-[#111111] to-[#0f0f0f] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Pipeline Summary Report
                  </h2>
                  <p className="text-sm text-[#8a8a8a] mt-1">
                    Generated on {reportDate} at {reportTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#8a8a8a]">Report Period</p>
                  <p className="text-base font-semibold text-white">All Time</p>
                  <p className="text-xs text-[#7d7d7d] mt-1">
                    {totalDeals} deals analyzed
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <PipelineValueCard totalValue={totalValue} />

              <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#8b5cf6] border border-[#1f1f1f]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                      Total Deals
                    </p>
                    <p className="text-[11px] text-[#5f5f5f]">In pipeline</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {totalDeals}
                </p>
                <p className="text-xs text-[#8b5cf6]">
                  {recentDeals.length} new this week
                </p>
              </div>

              <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#22c55e] border border-[#1f1f1f]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                      Avg Deal Size
                    </p>
                    <p className="text-[11px] text-[#5f5f5f]">Per deal</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatRevenue(avgDealValue)}
                </p>
                <p className="text-xs text-[#22c55e]">Across all stages</p>
              </div>

              <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#f97316] border border-[#1f1f1f]">
                    <svg
                      className="w-5 h-5"
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
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                      At Risk
                    </p>
                    <p className="text-[11px] text-[#5f5f5f]">
                      Requires attention
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {atRiskDeals.length}
                </p>
                <p className="text-xs text-[#f97316]">
                  {formatRevenue(highRiskValue)} at risk
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8a8a8a]">Last 7 Days</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {recentDeals.length}
                      </p>
                      <p className="text-xs text-[#7d7d7d]">
                        {formatRevenue(recentDealsValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8a8a8a]">Last 30 Days</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {thirtyDayDeals.length}
                      </p>
                      <p className="text-xs text-[#7d7d7d]">
                        {formatRevenue(thirtyDayValue)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#1f1f1f]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8a8a8a]">
                        Avg Deal Age
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {avgDealAge.toFixed(0)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-[#8a8a8a]">
                        Avg Days Since Activity
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {avgDaysSinceActivity.toFixed(0)} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Risk Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-white">
                        Low Risk
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-400">
                        {lowRiskDeals.length}
                      </span>
                      <p className="text-xs text-[#7d7d7d]">
                        {formatRevenue(lowRiskValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium text-white">
                        Medium Risk
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-amber-400">
                        {mediumRiskDeals.length}
                      </span>
                      <p className="text-xs text-[#7d7d7d]">
                        {formatRevenue(mediumRiskValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-white">
                        High Risk
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-red-400">
                        {highRiskDeals.length}
                      </span>
                      <p className="text-xs text-[#7d7d7d]">
                        {formatRevenue(highRiskValue)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#1f1f1f]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8a8a8a]">
                        Avg Risk Score
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {(avgRiskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Action Items
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#8a8a8a]">
                        Deals Needing Action
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {dealsWithActions.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#8a8a8a]">
                        Overdue Actions
                      </span>
                      <span className="text-sm font-semibold text-[#f97316]">
                        {overdueDeals.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#8a8a8a]">
                        Active Deals
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {activeDeals.length}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#1f1f1f]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8a8a8a]">
                        Top 5 Deals Value
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {formatRevenue(topDealsValue)}
                      </span>
                    </div>
                    <p className="text-xs text-[#7d7d7d] mt-1">
                      {topDealsPercentage.toFixed(1)}% of total pipeline
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Pipeline by Stage
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8a8a8a]">
                    {sortedStages.length} stages
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Deals
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Avg Value
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        % of Total
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Conversion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStages.map((stage) => {
                      const count = stageDistribution[stage] || 0;
                      const value = valueByStage[stage] || 0;
                      const avgValue = avgValueByStage[stage] || 0;
                      const percentage =
                        totalValue > 0 ? (value / totalValue) * 100 : 0;
                      const conversion = conversionRates[stage] || 0;
                      return (
                        <tr
                          key={stage}
                          className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-white capitalize">
                              {stage}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-white text-right">
                            {count}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                            {formatRevenue(value)}
                          </td>
                          <td className="py-3 px-4 text-sm text-white/60 text-right">
                            {formatRevenue(avgValue)}
                          </td>
                          <td className="py-3 px-4 text-sm text-white/60 text-right">
                            {percentage.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-sm text-white/60 text-right">
                            {conversion > 0 ? `${conversion.toFixed(0)}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#1a1a1a]">
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        Total
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                        {totalDeals}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                        {formatRevenue(totalValue)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                        {formatRevenue(avgDealValue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60 text-right">
                        100%
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60 text-right">
                        —
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Deal Details
                </h3>
                <span className="text-sm text-[#8a8a8a]">
                  {deals.length} total deals
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Deal Name
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Value
                      </th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                        Next Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => {
                      const riskLevel = formatRiskLevel(deal.riskScore);
                      return (
                        <tr
                          key={deal.id}
                          className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/deals/${deal.id}`}
                              className="text-sm font-medium text-white hover:text-[#8b5cf6] transition-colors"
                            >
                              {deal.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60 capitalize">
                            {deal.stage}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-white text-right">
                            {formatRevenue(deal.value)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                riskLevel === "High"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : riskLevel === "Medium"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {deal.status === "at_risk" ? (
                              <span className="text-red-400">At Risk</span>
                            ) : (
                              <span className="text-emerald-400">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {deal.recommendedAction?.label || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
