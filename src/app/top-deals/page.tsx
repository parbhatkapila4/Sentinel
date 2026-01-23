import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { formatRevenue, formatValueInMillions } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TopDealsPage() {
  noStore();
  const deals = await getAllDeals();

  const topDeals = [...deals].sort((a, b) => b.value - a.value);
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgValue = deals.length > 0 ? totalValue / deals.length : 0;
  const topDealValue = topDeals[0]?.value || 0;

  const top10Deals = topDeals.slice(0, 10);
  const top10Value = top10Deals.reduce((sum, deal) => sum + deal.value, 0);
  const top10Percentage = totalValue > 0 ? (top10Value / totalValue) * 100 : 0;

  const top3Deals = topDeals.slice(0, 3);
  const top3Value = top3Deals.reduce((sum, deal) => sum + deal.value, 0);
  const top3Percentage = totalValue > 0 ? (top3Value / totalValue) * 100 : 0;

  const top20PercentCount = Math.ceil(deals.length * 0.2);
  const top20PercentDeals = topDeals.slice(0, top20PercentCount);
  const top20PercentValue = top20PercentDeals.reduce(
    (sum, deal) => sum + deal.value,
    0
  );
  const top20PercentPercentage =
    totalValue > 0 ? (top20PercentValue / totalValue) * 100 : 0;

  const top10HighRisk = top10Deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  ).length;
  const top10MediumRisk = top10Deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  ).length;
  const top10LowRisk = top10Deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  ).length;
  const top10RiskValue = top10Deals
    .filter((d) => formatRiskLevel(d.riskScore) === "High")
    .reduce((sum, d) => sum + d.value, 0);

  const top10StageDistribution = top10Deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const restOfDeals = topDeals.slice(10);
  const restAvgValue =
    restOfDeals.length > 0
      ? restOfDeals.reduce((sum, d) => sum + d.value, 0) / restOfDeals.length
      : 0;
  const top10AvgValue =
    top10Deals.length > 0
      ? top10Deals.reduce((sum, d) => sum + d.value, 0) / top10Deals.length
      : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTopDeals = topDeals.filter(
    (deal) => new Date(deal.createdAt) >= thirtyDaysAgo
  ).length;

  const now = new Date();
  const oldestTopDeals = top10Deals
    .map((deal) => ({
      deal,
      age: differenceInDays(now, new Date(deal.createdAt)),
    }))
    .sort((a, b) => b.age - a.age)
    .slice(0, 3);

  const topDealsWithActions = top10Deals.filter(
    (d) => d.recommendedAction !== null
  ).length;

  const stageTopValues: Record<string, number> = {};
  deals.forEach((deal) => {
    if (
      !stageTopValues[deal.stage] ||
      deal.value > stageTopValues[deal.stage]
    ) {
      stageTopValues[deal.stage] = deal.value;
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Top Deals</h1>
            <p className="text-sm text-[#8a8a8a]">
              Your highest value opportunities with comprehensive analytics
            </p>
          </div>
          <Link
            href="/deals/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-[#d51024] hover:bg-[#b80e1f]"
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
            New Deal
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#fbbf24] border border-[#1f1f1f]">
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
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                  Highest Deal
                </p>
                <p className="text-[11px] text-[#5f5f5f]">Top opportunity</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {formatRevenue(topDealValue)}
            </p>
            <p className="text-xs text-[#7d7d7d]">
              {topDeals[0]?.name || "No deals"}
            </p>
          </div>

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
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                  Top 10 Value
                </p>
                <p className="text-[11px] text-[#5f5f5f]">Concentration</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {formatRevenue(top10Value)}
            </p>
            <p className="text-xs text-[#8b5cf6]">
              {top10Percentage.toFixed(1)}% of total pipeline
            </p>
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
                <p className="text-[11px] text-[#5f5f5f]">In top 10</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {top10HighRisk}
            </p>
            <p className="text-xs text-[#f97316]">
              {formatRevenue(top10RiskValue)} at risk
            </p>
          </div>

          <PipelineValueCard totalValue={totalValue} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Top 3 Concentration
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8a8a8a]">Value</span>
                  <span className="text-lg font-bold text-white">
                    {formatRevenue(top3Value)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#151515] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full"
                    style={{ width: `${top3Percentage}%` }}
                  />
                </div>
                <p className="text-xs text-[#7d7d7d] mt-1">
                  {top3Percentage.toFixed(1)}% of total pipeline
                </p>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-2">
                {top3Deals.map((deal, index) => {
                  const formatted = formatValueInMillions(deal.value);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#151515]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#fbbf24]">
                          #{index + 1}
                        </span>
                        <span className="text-sm text-white truncate max-w-[150px]">
                          {deal.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        ${formatted.value}
                        {formatted.suffix}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Value Distribution
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8a8a8a]">Top 20%</span>
                  <span className="text-lg font-bold text-white">
                    {formatRevenue(top20PercentValue)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#151515] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-full"
                    style={{ width: `${top20PercentPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-[#7d7d7d] mt-1">
                  {top20PercentCount} deals ={" "}
                  {top20PercentPercentage.toFixed(1)}% of value
                </p>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a8a8a]">Top 10 Avg</span>
                  <span className="text-sm font-semibold text-white">
                    {formatRevenue(top10AvgValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a8a8a]">Rest Avg</span>
                  <span className="text-sm font-semibold text-white">
                    {formatRevenue(restAvgValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                  <span className="text-sm text-[#8a8a8a]">Difference</span>
                  <span className="text-sm font-semibold text-[#22c55e]">
                    {((top10AvgValue / restAvgValue - 1) * 100).toFixed(0)}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Top 10 Risk Profile
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <span className="text-sm text-[#8a8a8a]">High Risk</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {top10HighRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <span className="text-sm text-[#8a8a8a]">Medium Risk</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {top10MediumRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    <span className="text-sm text-[#8a8a8a]">Low Risk</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {top10LowRisk}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8a8a8a]">Value at Risk</span>
                  <span className="text-lg font-bold text-[#f97316]">
                    {formatRevenue(top10RiskValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a8a8a]">
                    Deals Needing Action
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {topDealsWithActions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-5">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Top Deals Ranked by Value
              </h3>
              <p className="text-sm text-[#8a8a8a]">
                {topDeals.length} deals sorted by highest value
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                <span className="text-xs text-[#8a8a8a]">
                  Top {topDeals.length}
                </span>
              </div>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="p-16 text-center">
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
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No deals yet
              </h3>
              <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
                Create your first deal to see your top opportunities ranked by
                value.
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
                Create Your First Deal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topDeals.map((deal, index) => {
                const riskLevel = formatRiskLevel(deal.riskScore);
                const percentOfTotal =
                  totalValue > 0 ? (deal.value / totalValue) * 100 : 0;
                const formatted = formatValueInMillions(deal.value);
                const isTop3 = index < 3;

                return (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className={`group flex items-center gap-6 p-5 rounded-xl border transition-all ${
                      isTop3
                        ? "bg-gradient-to-r from-[#151515] to-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]"
                        : "bg-[#151515] border-[#1f1f1f] hover:bg-[#1a1a1a] hover:border-[#2a2a2a]"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        index === 0
                          ? "bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] text-[#0b0b0b] shadow-lg shadow-[#fbbf24]/20"
                          : index === 1
                          ? "bg-gradient-to-br from-[#e5e7eb] to-[#9ca3af] text-[#0b0b0b] shadow-lg shadow-white/10"
                          : index === 2
                          ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20"
                          : "bg-[#1f1f1f] text-[#7d7d7d] border border-[#2a2a2a]"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-base font-semibold text-white truncate group-hover:text-[#0ea5e9] transition-colors">
                          {deal.name}
                        </p>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            riskLevel === "High"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : riskLevel === "Medium"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#8a8a8a]">
                        <span className="capitalize">{deal.stage}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(deal.lastActivityAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {deal.recommendedAction && (
                          <>
                            <span>•</span>
                            <span className="text-[#f97316]">
                              {deal.recommendedAction.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-white mb-2">
                        ${formatted.value}
                        {formatted.suffix}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 rounded-full bg-[#151515] overflow-hidden border border-[#1f1f1f]">
                          <div
                            className={`h-full rounded-full ${
                              isTop3
                                ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]"
                                : "bg-gradient-to-r from-[#6366f1] to-[#3b82f6]"
                            }`}
                            style={{
                              width: `${Math.min(percentOfTotal, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#7d7d7d] min-w-[40px]">
                          {percentOfTotal.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <svg
                      className="w-5 h-5 text-[#7d7d7d] shrink-0 group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {deals.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Stage Distribution (Top 10)
              </h3>
              <div className="space-y-3">
                {Object.entries(top10StageDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([stage, count]) => {
                    const percentage = (count / top10Deals.length) * 100;
                    return (
                      <div key={stage}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white capitalize">
                            {stage}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#151515] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Pipeline Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                  <span className="text-sm text-[#8a8a8a]">
                    Recent Top Deals (30d)
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {recentTopDeals}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f]">
                  <p className="text-sm text-[#8a8a8a] mb-2">
                    Oldest Top Deals
                  </p>
                  <div className="space-y-2">
                    {oldestTopDeals.map(({ deal, age }, idx) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-white truncate max-w-[200px]">
                          {deal.name}
                        </span>
                        <span className="text-[#7d7d7d]">{age} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
