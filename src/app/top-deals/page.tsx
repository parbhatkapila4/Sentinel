import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { formatRevenue, formatValueInMillions } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function TopDealsPage() {
  noStore();
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dataError = false;
  try {
    deals = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/top-deals");
    }
    dataError = true;
  }

  const topDeals = [...deals].sort((a, b) => b.value - a.value);
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
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
      <div className="p-4 lg:p-6 space-y-6 w-full overflow-x-hidden">
        {dataError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-200">Data temporarily unavailable</p>
            <p className="text-xs text-amber-200/70 mt-1">Check your connection and try again.</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">Top Deals</h1>
            <p className="text-sm sm:text-base text-white/60">
              Your highest value opportunities with comprehensive analytics
            </p>
          </div>
          <Link
            href="/deals/new"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full min-w-0 flex flex-col space-y-2 overflow-hidden">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#fbbf24] border border-[#1f1f1f]">
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
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-white/60 truncate uppercase tracking-[0.08em]">
                  Highest Deal
                </p>
                <p className="text-xs text-white/40 truncate">Top opportunity</p>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
              {formatRevenue(topDealValue)}
            </p>
            <p className="text-xs text-white/40 truncate">
              {topDeals[0]?.name || "No deals"}
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full min-w-0 flex flex-col space-y-2 overflow-hidden">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#8b1a1a] border border-[#1f1f1f]">
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
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-white/60 truncate uppercase tracking-[0.08em]">
                  Top 10 Value
                </p>
                <p className="text-xs text-white/40 truncate">Concentration</p>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
              {formatRevenue(top10Value)}
            </p>
            <p className="text-xs text-white/40 truncate">
              {top10Percentage.toFixed(1)}% of total pipeline
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full min-w-0 flex flex-col space-y-2 overflow-hidden">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#f97316] border border-[#1f1f1f]">
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
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-white/60 truncate uppercase tracking-[0.08em]">
                  At Risk
                </p>
                <p className="text-xs text-white/40 truncate">In top 10</p>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
              {top10HighRisk}
            </p>
            <p className="text-xs text-white/40 truncate">
              {formatRevenue(top10RiskValue)} at risk
            </p>
          </div>

          <PipelineValueCard totalValue={totalValue} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 truncate">
              Top 3 Concentration
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 text-sm mb-2">
                  <span className="truncate flex-1 min-w-0 text-white/60">Value</span>
                  <span className="flex-shrink-0 font-medium text-white">
                    {formatRevenue(top3Value)}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full"
                    style={{ width: `${top3Percentage}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 truncate mt-1">
                  {top3Percentage.toFixed(1)}% of total pipeline
                </p>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-3">
                {top3Deals.map((deal, index) => {
                  const formatted = formatValueInMillions(deal.value);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg bg-[#151515]"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-bold text-[#fbbf24] shrink-0">
                          #{index + 1}
                        </span>
                        <span className="text-sm text-white truncate flex-1 min-w-0">
                          {deal.name}
                        </span>
                      </div>
                      <span className="flex-shrink-0 font-medium text-white">
                        ${formatted.value}
                        {formatted.suffix}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 truncate">
              Value Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 text-sm mb-2">
                  <span className="truncate flex-1 min-w-0 text-white/60">Top 20%</span>
                  <span className="flex-shrink-0 font-medium text-white">
                    {formatRevenue(top20PercentValue)}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8b1a1a] to-[#6b0f0f] rounded-full"
                    style={{ width: `${top20PercentPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 truncate mt-1">
                  {top20PercentCount} deals ={" "}
                  {top20PercentPercentage.toFixed(1)}% of value
                </p>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1 min-w-0 text-white/60">Top 10 Avg</span>
                  <span className="flex-shrink-0 font-medium text-white">
                    {formatRevenue(top10AvgValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1 min-w-0 text-white/60">Rest Avg</span>
                  <span className="flex-shrink-0 font-medium text-white">
                    {formatRevenue(restAvgValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm pt-2 border-t border-[#1f1f1f]">
                  <span className="truncate flex-1 min-w-0 text-white/60">Difference</span>
                  <span className="flex-shrink-0 font-medium text-[#22c55e]">
                    {((top10AvgValue / restAvgValue - 1) * 100).toFixed(0)}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 truncate">
              Top 10 Risk Profile
            </h3>
            <div className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 shrink-0" />
                    <span className="truncate flex-1 min-w-0 text-white/60">High Risk</span>
                  </div>
                  <span className="flex-shrink-0 font-medium text-white">
                    {top10HighRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500/50 shrink-0" />
                    <span className="truncate flex-1 min-w-0 text-white/60">Medium Risk</span>
                  </div>
                  <span className="flex-shrink-0 font-medium text-white">
                    {top10MediumRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50 shrink-0" />
                    <span className="truncate flex-1 min-w-0 text-white/60">Low Risk</span>
                  </div>
                  <span className="flex-shrink-0 font-medium text-white">
                    {top10LowRisk}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1f1f1f] space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1 min-w-0 text-white/60">Value at Risk</span>
                  <span className="flex-shrink-0 font-medium text-[#f97316]">
                    {formatRevenue(top10RiskValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1 min-w-0 text-white/60">
                    Deals Needing Action
                  </span>
                  <span className="flex-shrink-0 font-medium text-white">
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
                    className={`group flex items-center gap-6 p-5 rounded-xl border transition-all max-sm:overflow-hidden max-sm:gap-3 max-sm:p-4 ${isTop3
                      ? "bg-gradient-to-r from-[#151515] to-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]"
                      : "bg-[#151515] border-[#1f1f1f] hover:bg-[#1a1a1a] hover:border-[#2a2a2a]"
                      }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 max-sm:w-10 max-sm:h-10 max-sm:text-sm ${index === 0
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

                    <div className="flex-1 min-w-0 max-sm:overflow-hidden max-sm:min-w-0">
                      <div className="flex items-center gap-3 mb-2 max-sm:min-w-0 max-sm:overflow-hidden">
                        <p className="text-base font-semibold text-white truncate group-hover:text-[#0ea5e9] transition-colors max-sm:min-w-0">
                          {deal.name}
                        </p>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${riskLevel === "High"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : riskLevel === "Medium"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                        >
                          {riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#8a8a8a] max-sm:overflow-hidden max-sm:min-w-0 max-sm:gap-2">
                        <span className="capitalize max-sm:truncate max-sm:shrink-0">{deal.stage}</span>
                        <span className="max-sm:shrink-0">•</span>
                        <span className="max-sm:truncate max-sm:min-w-0 max-sm:shrink">
                          {formatDistanceToNow(new Date(deal.lastActivityAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {deal.recommendedAction && (
                          <>
                            <span className="max-sm:shrink-0">•</span>
                            <span className="text-[#f97316] max-sm:truncate max-sm:block max-sm:min-w-0 max-sm:max-w-[90px]">
                              {deal.recommendedAction.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 max-sm:min-w-[72px] max-sm:shrink-0">
                      <p className="text-2xl font-bold text-white mb-2 max-sm:text-lg max-sm:truncate">
                        ${formatted.value}
                        {formatted.suffix}
                      </p>
                      <div className="flex items-center gap-2 max-sm:flex-col max-sm:items-end max-sm:gap-0.5">
                        <div className="w-32 h-2 rounded-full bg-[#151515] overflow-hidden border border-[#1f1f1f] max-sm:w-16">
                          <div
                            className={`h-full rounded-full ${isTop3
                              ? "bg-gradient-to-r from-[#8b1a1a] to-[#6b0f0f]"
                              : "bg-gradient-to-r from-[#b91c1c] to-[#8b1a1a]"
                              }`}
                            style={{
                              width: `${Math.min(percentOfTotal, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#7d7d7d] min-w-[40px] max-sm:min-w-0">
                          {percentOfTotal.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <svg
                      className="w-5 h-5 text-[#7d7d7d] shrink-0 group-hover:text-white transition-colors max-sm:w-4 max-sm:h-4 max-sm:shrink-0"
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
          <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-4">
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4 max-sm:overflow-visible">
              <h3 className="text-lg font-semibold text-white mb-4 max-sm:mb-3 max-sm:truncate">
                Stage Distribution (Top 10)
              </h3>
              <div className="space-y-3 max-sm:space-y-4 max-sm:overflow-visible">
                {Object.entries(top10StageDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([stage, count]) => {
                    const percentage = (count / top10Deals.length) * 100;
                    return (
                      <div key={stage} className="max-sm:min-h-[3rem]">
                        <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:min-w-0 max-sm:mb-1.5">
                          <span className="text-sm text-white capitalize max-sm:truncate max-sm:min-w-0">
                            {stage}
                          </span>
                          <span className="text-sm font-semibold text-white max-sm:shrink-0">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#151515] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8b1a1a] to-[#6b0f0f] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] max-sm:w-full max-sm:min-w-0 max-sm:p-4">
              <h3 className="text-lg font-semibold text-white mb-4 max-sm:mb-3 max-sm:truncate">
                Pipeline Insights
              </h3>
              <div className="space-y-4 max-sm:space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] max-sm:min-w-0 max-sm:gap-2">
                  <span className="text-sm text-[#8a8a8a] max-sm:truncate max-sm:min-w-0">
                    Recent Top Deals (30d)
                  </span>
                  <span className="text-sm font-semibold text-white max-sm:shrink-0">
                    {recentTopDeals}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#151515] border border-[#1f1f1f] max-sm:min-w-0 max-sm:overflow-hidden">
                  <p className="text-sm text-[#8a8a8a] mb-2">
                    Oldest Top Deals
                  </p>
                  <div className="space-y-2 max-sm:space-y-2">
                    {oldestTopDeals.map(({ deal, age }) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between text-xs max-sm:gap-2 max-sm:min-w-0"
                      >
                        <span className="text-white truncate max-w-[200px] max-sm:max-w-[140px] max-sm:min-w-0">
                          {deal.name}
                        </span>
                        <span className="text-[#7d7d7d] max-sm:shrink-0">{age} days</span>
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
