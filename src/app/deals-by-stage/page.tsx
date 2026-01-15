import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { formatValueInMillions, formatRevenue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DealsByStagePage() {
  noStore();
  const deals = await getAllDeals();

  const stageGroups = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = [];
    }
    acc[deal.stage].push(deal);
    return acc;
  }, {} as Record<string, typeof deals>);

  const stageConfig: Record<
    string,
    {
      order: number;
      color: string;
      bgColor: string;
      borderColor: string;
      iconColor: string;
    }
  > = {
    discover: {
      order: 1,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
    },
    qualify: {
      order: 2,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      iconColor: "text-cyan-400",
    },
    proposal: {
      order: 3,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      iconColor: "text-violet-400",
    },
    negotiation: {
      order: 4,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
    },
    closed: {
      order: 5,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
    },
  };

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
    const currentCount = stageGroups[currentStage]?.length || 0;
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
  const activeDeals = deals.filter(
    (d) => d.status === "active" || d.status === "Active"
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
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Deals by Stage
            </h1>
            <p className="text-sm text-[#8a8a8a]">
              Comprehensive pipeline analysis across all stages
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
            <p className="text-3xl font-bold text-white mb-1">{totalDeals}</p>
            <p className="text-xs text-[#7d7d7d]">
              {sortedStages.length} active stages
            </p>
          </div>

          <PipelineValueCard totalValue={totalValue} />

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
                <p className="text-[11px] text-[#5f5f5f]">Requires attention</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {highRiskDeals.length}
            </p>
            <p className="text-xs text-[#f97316]">
              {formatRevenue(valueAtRisk)} at risk
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
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Pipeline Distribution
                  </h3>
                  <p className="text-sm text-[#8a8a8a]">
                    Deal count and value across stages
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 rounded-full bg-[#151515] overflow-hidden flex border border-[#1f1f1f]">
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
                        title={`${stage}: ${
                          metric?.count || 0
                        } deals (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {sortedStages.map((stage) => {
                    const metric = stageMetrics.find((m) => m.stage === stage);
                    const config = stageConfig[stage.toLowerCase()] || {
                      color: "text-white/60",
                      bgColor: "bg-white/10",
                    };
                    return (
                      <div
                        key={stage}
                        className="flex flex-col items-center p-3 rounded-xl bg-[#151515] border border-[#1f1f1f]"
                      >
                        <div
                          className={`w-4 h-4 rounded-full mb-2 ${config.bgColor.replace(
                            "/10",
                            "/50"
                          )}`}
                        />
                        <span className="text-xs text-white/60 mb-1">
                          {stage}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {metric?.count || 0}
                        </span>
                        <span className="text-xs text-white/40">
                          {formatRevenue(metric?.value || 0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="grid gap-6"
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
                    className={`rounded-2xl border ${config.borderColor} bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden`}
                  >
                    <div className="p-5 border-b border-[#1f1f1f] bg-gradient-to-br from-[#151515] to-[#111111]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${config.bgColor.replace(
                              "/10",
                              "/50"
                            )}`}
                          />
                          <h3
                            className={`text-base font-semibold ${config.color} capitalize`}
                          >
                            {stage}
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg ${config.bgColor} ${config.color}`}
                        >
                          {stageDeals.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-[#7d7d7d] mb-1">
                            Stage Value
                          </p>
                          <p className="text-2xl font-bold text-white">
                            ${formatted.value}
                            {formatted.suffix}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f1f1f]">
                          <div>
                            <p className="text-[10px] text-[#7d7d7d] mb-0.5">
                              Avg Deal
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {formatRevenue(metric?.avgValue || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#7d7d7d] mb-0.5">
                              Avg Days
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {metric?.avgDaysSinceActivity?.toFixed(0) || "0"}d
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-[#151515] border-b border-[#1f1f1f]">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <span className="text-[#7d7d7d]">
                              {metric?.highRiskCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                            <span className="text-[#7d7d7d]">
                              {metric?.mediumRiskCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            <span className="text-[#7d7d7d]">
                              {metric?.lowRiskCount || 0}
                            </span>
                          </div>
                        </div>
                        {conversionRates[stage] !== undefined && (
                          <span className="text-[#7d7d7d]">
                            →{conversionRates[stage].toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
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
                              className="block p-3 rounded-xl bg-[#151515] border border-[#1f1f1f] hover:bg-[#1a1a1a] hover:border-[#2a2a2a] transition-all group"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-white truncate flex-1 group-hover:text-[#0ea5e9] transition-colors">
                                  {deal.name}
                                </p>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
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
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">
                                  {formatRevenue(deal.value)}
                                </span>
                                <span className="text-[10px] text-[#7d7d7d]">
                                  {formatDistanceToNow(
                                    new Date(deal.lastActivityAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                              {deal.recommendedAction && (
                                <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                                  <p className="text-[10px] text-[#7d7d7d] truncate">
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
