import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_UI_CONFIG } from "@/lib/config";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { formatValueInMillions, formatRevenue } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function DealsByStagePage() {
  noStore();
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dataError = false;
  try {
    deals = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/deals-by-stage");
    }
    dataError = true;
  }

  const stageGroups = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = [];
    }
    acc[deal.stage].push(deal);
    return acc;
  }, {} as Record<string, typeof deals>);

  type StageUi = (typeof STAGE_UI_CONFIG)[keyof typeof STAGE_UI_CONFIG];
  const stageConfig = STAGE_UI_CONFIG as Record<string, StageUi>;

  const sortedStages = Object.keys(stageGroups).sort((a, b) => {
    const orderA = stageConfig[a.toLowerCase()]?.order ?? 99;
    const orderB = stageConfig[b.toLowerCase()]?.order ?? 99;
    return orderA - orderB;
  });

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const stageMetrics = sortedStages.map((stage) => {
    const stageDeals = stageGroups[stage];
    const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
    const avgValue = stageDeals.length > 0 ? stageValue / stageDeals.length : 0;
    const highRiskCount = stageDeals.filter(
      (d) => formatRiskLevel(d.riskScore) === "High"
    ).length;
    const mediumRiskCount = stageDeals.filter(
      (d) => formatRiskLevel(d.riskScore) === "Medium"
    ).length;
    const lowRiskCount = stageDeals.filter(
      (d) => formatRiskLevel(d.riskScore) === "Low"
    ).length;

    const now = new Date();
    const avgDaysSinceActivity =
      stageDeals.length > 0
        ? stageDeals.reduce((sum, deal) => {
          const days = differenceInDays(now, new Date(deal.lastActivityAt));
          return sum + days;
        }, 0) / stageDeals.length
        : 0;

    return {
      stage,
      count: stageDeals.length,
      value: stageValue,
      avgValue,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      avgDaysSinceActivity,
      percentage: totalDeals > 0 ? (stageDeals.length / totalDeals) * 100 : 0,
    };
  });

  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < sortedStages.length - 1; i++) {
    const currentStage = sortedStages[i];
    const nextStage = sortedStages[i + 1];
    const nextCount = stageGroups[nextStage]?.length || 0;
    const totalAfterCurrent = deals.filter(
      (d) =>
        stageConfig[d.stage.toLowerCase()]?.order >=
        stageConfig[currentStage.toLowerCase()]?.order
    ).length;
    conversionRates[currentStage] =
      totalAfterCurrent > 0 ? (nextCount / totalAfterCurrent) * 100 : 0;
  }

  const highRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const valueAtRisk = highRiskDeals.reduce((sum, d) => sum + d.value, 0);

  const stageVelocity: Record<string, number> = {};
  sortedStages.forEach((stage) => {
    const stageDeals = stageGroups[stage];
    if (stageDeals.length > 0) {
      const avgAge =
        stageDeals.reduce((sum, deal) => {
          const age = differenceInDays(new Date(), new Date(deal.createdAt));
          return sum + age;
        }, 0) / stageDeals.length;
      stageVelocity[stage] = avgAge;
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Deals by Stage
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              Comprehensive pipeline analysis across all stages
            </p>
          </div>
          <Link
            href="/deals/new"
            className="w-full sm:w-auto px-4 py-2.5 bg-red-500 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-2 hover:bg-[#b80e1f] transition-colors"
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#8b1a1a] border border-[#1f1f1f]">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide truncate">
                  Total Deals
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">In pipeline</p>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{totalDeals}</p>
            <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">
              {sortedStages.length} active stages
            </p>
          </div>

          <PipelineValueCard totalValue={totalValue} />

          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#f97316] border border-[#1f1f1f]">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
                <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide truncate">
                  At Risk
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">Requires attention</p>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {highRiskDeals.length}
            </p>
            <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">
              {formatRevenue(valueAtRisk)} at risk
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#151515] text-[#22c55e] border border-[#1f1f1f]">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide truncate">
                  Avg Deal Size
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">Per deal</p>
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {formatRevenue(avgDealValue)}
            </p>
            <p className="text-[10px] sm:text-xs text-white/40 mt-1 truncate">Across all stages</p>
          </div>
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
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No deals yet</h3>
            <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
              Create deals to see them organized by stage with comprehensive
              analytics.
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
          <>
            <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Pipeline Distribution
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    Deal count and value across stages
                  </p>
                </div>
              </div>
              <div className="space-y-4 w-full max-sm:space-y-3">
                <div className="h-6 rounded-full bg-[#151515] overflow-hidden flex border border-[#1f1f1f] min-w-0 max-sm:h-4">
                  {sortedStages.map((stage) => {
                    const metric = stageMetrics.find((m) => m.stage === stage);
                    const percentage = metric?.percentage || 0;
                    const config = stageConfig[stage.toLowerCase()] || {
                      bgColor: "bg-white/10",
                    };
                    return (
                      <div
                        key={stage}
                        className={`h-full ${config.bgColor.replace(
                          "/10",
                          "/50"
                        )}`}
                        style={{ width: `${percentage}%` }}
                        title={`${stage}: ${metric?.count || 0
                          } deals (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-5 gap-4 w-full overflow-x-auto min-w-[300px] sm:min-w-0 px-2 max-sm:grid-cols-2 max-sm:gap-2 max-sm:min-w-0 max-sm:overflow-x-visible max-sm:px-0">
                  {sortedStages.map((stage) => {
                    const metric = stageMetrics.find((m) => m.stage === stage);
                    const config = stageConfig[stage.toLowerCase()] || {
                      color: "text-white/60",
                      bgColor: "bg-white/10",
                    };
                    return (
                      <div
                        key={stage}
                        className="flex flex-col items-center gap-1 flex-1 min-w-0 p-3 rounded-xl bg-[#151515] border border-[#1f1f1f] max-sm:w-full max-sm:flex-initial max-sm:p-2.5"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex-shrink-0 max-sm:w-3 max-sm:h-3 ${config.bgColor.replace(
                            "/10",
                            "/50"
                          )}`}
                        />
                        <span className="text-[9px] sm:text-xs text-white/60 max-w-full text-center max-sm:text-[10px] max-sm:whitespace-normal max-sm:break-words max-sm:leading-tight">
                          {stage}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-white max-sm:text-xs max-sm:font-semibold">
                          {metric?.count || 0}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-white/40 max-sm:text-[10px] max-sm:truncate max-sm:max-w-full">
                          {formatRevenue(metric?.value || 0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="grid gap-6 max-sm:flex max-sm:flex-col max-sm:gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  sortedStages.length,
                  5
                )}, 1fr)`,
              }}
            >
              {sortedStages.map((stage) => {
                const stageDeals = stageGroups[stage];
                const metric = stageMetrics.find((m) => m.stage === stage);
                const config = stageConfig[stage.toLowerCase()] || {
                  color: "text-white/60",
                  bgColor: "bg-white/10",
                  borderColor: "border-white/10",
                  iconColor: "text-white/60",
                };

                const formatted = formatValueInMillions(metric?.value || 0);

                return (
                  <div
                    key={stage}
                    className={`rounded-2xl border ${config.borderColor} bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden max-sm:w-full max-sm:min-w-0`}
                  >
                    <div className="p-5 border-b border-[#1f1f1f] bg-gradient-to-br from-[#151515] to-[#111111] max-sm:p-4">
                      <div className="flex items-center justify-between mb-3 max-sm:mb-2 max-sm:gap-2">
                        <div className="flex items-center gap-2 max-sm:min-w-0 max-sm:flex-1">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${config.bgColor.replace(
                              "/10",
                              "/50"
                            )}`}
                          />
                          <h3
                            className={`text-base font-semibold ${config.color} capitalize max-sm:text-sm max-sm:truncate max-sm:min-w-0`}
                          >
                            {stage}
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg ${config.bgColor} ${config.color} max-sm:shrink-0`}
                        >
                          {stageDeals.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-sm:space-y-2">
                        <div className="max-sm:min-w-0 max-sm:overflow-hidden">
                          <p className="text-xs text-[#7d7d7d] mb-1 max-sm:text-[10px] max-sm:mb-0.5 max-sm:truncate">
                            Stage Value
                          </p>
                          <p className="text-2xl font-bold text-white max-sm:text-xl max-sm:truncate">
                            ${formatted.value}
                            {formatted.suffix}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f1f1f] max-sm:gap-1.5 max-sm:pt-1.5">
                          <div className="max-sm:min-w-0 max-sm:overflow-hidden">
                            <p className="text-[10px] text-[#7d7d7d] mb-0.5 max-sm:text-[9px] max-sm:truncate">
                              Avg Deal
                            </p>
                            <p className="text-sm font-semibold text-white max-sm:text-xs max-sm:truncate">
                              {formatRevenue(metric?.avgValue || 0)}
                            </p>
                          </div>
                          <div className="max-sm:min-w-0 max-sm:overflow-hidden">
                            <p className="text-[10px] text-[#7d7d7d] mb-0.5 max-sm:text-[9px] max-sm:truncate">
                              Avg Days
                            </p>
                            <p className="text-sm font-semibold text-white max-sm:text-xs max-sm:truncate">
                              {metric?.avgDaysSinceActivity?.toFixed(0) || "0"}d
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-[#151515] border-b border-[#1f1f1f] max-sm:px-4 max-sm:py-2">
                      <div className="flex items-center justify-between text-xs max-sm:flex-wrap max-sm:gap-2 max-sm:text-[10px]">
                        <div className="flex items-center gap-3 max-sm:gap-2 max-sm:flex-wrap">
                          <div className="flex items-center gap-1 max-sm:shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red-500/50 flex-shrink-0" />
                            <span className="text-[#7d7d7d] max-sm:text-[9px]">
                              {metric?.highRiskCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 max-sm:shrink-0">
                            <div className="w-2 h-2 rounded-full bg-amber-500/50 flex-shrink-0" />
                            <span className="text-[#7d7d7d] max-sm:text-[9px]">
                              {metric?.mediumRiskCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 max-sm:shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50 flex-shrink-0" />
                            <span className="text-[#7d7d7d] max-sm:text-[9px]">
                              {metric?.lowRiskCount || 0}
                            </span>
                          </div>
                        </div>
                        {conversionRates[stage] !== undefined && (
                          <span className="text-[#7d7d7d] max-sm:shrink-0 max-sm:text-[9px]">
                            →{conversionRates[stage].toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto max-sm:p-3 max-sm:space-y-1.5 max-sm:max-h-[400px]">
                      {stageDeals.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-[#7d7d7d]">No deals</p>
                        </div>
                      ) : (
                        stageDeals.map((deal) => {
                          const riskLevel = formatRiskLevel(deal.riskScore);
                          return (
                            <Link
                              key={deal.id}
                              href={`/deals/${deal.id}`}
                              className="block p-3 rounded-xl bg-[#151515] border border-[#1f1f1f] hover:bg-[#1a1a1a] hover:border-[#2a2a2a] transition-all group max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden"
                            >
                              <div className="flex items-start justify-between mb-2 max-sm:mb-1.5 max-sm:gap-2 max-sm:min-w-0">
                                <p className="text-sm font-medium text-white truncate flex-1 min-w-0 group-hover:text-[#0ea5e9] transition-colors max-sm:text-xs">
                                  {deal.name}
                                </p>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 ${riskLevel === "High"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : riskLevel === "Medium"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    }`}
                                >
                                  {riskLevel}
                                </span>
                              </div>
                              <div className="flex items-center justify-between max-sm:gap-2 max-sm:min-w-0">
                                <span className="text-xs font-semibold text-white max-sm:text-[10px] max-sm:truncate max-sm:min-w-0">
                                  {formatRevenue(deal.value)}
                                </span>
                                <span className="text-[10px] text-[#7d7d7d] max-sm:text-[9px] max-sm:shrink-0">
                                  {formatDistanceToNow(
                                    new Date(deal.lastActivityAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                              {deal.recommendedAction && (
                                <div className="mt-2 pt-2 border-t border-[#1f1f1f] max-sm:mt-1.5 max-sm:pt-1.5">
                                  <p className="text-[10px] text-[#7d7d7d] truncate max-sm:text-[9px]">
                                    {deal.recommendedAction.label}
                                  </p>
                                </div>
                              )}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
