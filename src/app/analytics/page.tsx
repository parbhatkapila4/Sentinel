import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  noStore();
  const deals = await getAllDeals();

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const highRiskDeals = deals.filter(
    (deal) => formatRiskLevel(deal.riskScore) === "High"
  ).length;
  const mediumRiskDeals = deals.filter(
    (deal) => formatRiskLevel(deal.riskScore) === "Medium"
  ).length;
  const lowRiskDeals = deals.filter(
    (deal) => formatRiskLevel(deal.riskScore) === "Low"
  ).length;

  const avgRiskScore =
    totalDeals > 0
      ? deals.reduce((sum, deal) => sum + deal.riskScore, 0) / totalDeals
      : 0;

  const dealsNeedingAction = deals.filter(
    (deal) => deal.recommendedAction?.urgency === "high"
  ).length;

  const won = deals.filter((d) => d.stage === "closed_won").length;
  const lost = deals.filter((d) => d.stage === "closed_lost").length;
  const closedTotal = won + lost;
  const winRate = closedTotal > 0 ? (won / closedTotal) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Revenue Breakdown
            </h1>
            <p className="text-sm text-white/40">
              Track your finances and achieve your financial goals
            </p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors w-full sm:w-auto justify-center sm:justify-start"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Export
            </button>
            <select
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 bg-transparent cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Total Pipeline</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              ${(totalValue / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-emerald-400">+12.5% from last month</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Average Deal</p>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              ${(avgDealValue / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-emerald-400">+8.2% from last month</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Risk Score</p>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {(avgRiskScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-red-400">-3.1% from last month</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Needs Action</p>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {dealsNeedingAction}
            </p>
            <p
              className={`text-xs ${dealsNeedingAction > 0 ? "text-amber-400" : "text-emerald-400"
                }`}
            >
              {dealsNeedingAction > 0 ? "Urgent" : "None pending"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
          <div
            className="rounded-2xl p-6"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              Risk Distribution
            </h3>

            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                  />
                  {totalDeals > 0 && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray={`${(lowRiskDeals / totalDeals) * 251.2
                          } 251.2`}
                        strokeLinecap="round"
                      />
                      {mediumRiskDeals > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="12"
                          strokeDasharray={`${(mediumRiskDeals / totalDeals) * 251.2
                            } 251.2`}
                          strokeDashoffset={
                            -((lowRiskDeals / totalDeals) * 251.2)
                          }
                          strokeLinecap="round"
                        />
                      )}
                      {highRiskDeals > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="12"
                          strokeDasharray={`${(highRiskDeals / totalDeals) * 251.2
                            } 251.2`}
                          strokeDashoffset={
                            -(
                              ((lowRiskDeals + mediumRiskDeals) / totalDeals) *
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
                  <span className="text-2xl font-bold text-white">
                    {totalDeals}
                  </span>
                  <span className="text-xs text-white/40">Total</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Low", value: lowRiskDeals, color: "bg-emerald-500" },
                {
                  label: "Medium",
                  value: mediumRiskDeals,
                  color: "bg-amber-500",
                },
                { label: "High", value: highRiskDeals, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs text-white/40">{item.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Deals Requiring Attention</h3>

            <div className="space-y-3">
              {deals
                .filter((deal) => {
                  const riskLevel = formatRiskLevel(deal.riskScore);
                  return riskLevel === "High";
                })
                .slice(0, 5)
                .map((deal) => {
                  const riskLevel = formatRiskLevel(deal.riskScore);
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                          <p className="text-xs text-white/50">{deal.stage} • ${deal.value.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-red-500/20 text-red-400">
                          {riskLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {deals.filter((deal) => {
                const riskLevel = formatRiskLevel(deal.riskScore);
                return riskLevel === "High";
              }).length === 0 && (
                  <div className="text-center py-8 text-white/40">
                    <p className="text-sm">No high-risk deals</p>
                    <p className="text-xs mt-1">All deals are in good health</p>
                  </div>
                )}
            </div>

            {deals.filter((deal) => {
              const riskLevel = formatRiskLevel(deal.riskScore);
              return riskLevel === "High";
            }).length > 5 && (
                <a
                  href="/risk-overview"
                  className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all at-risk deals →
                </a>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
          <div
            className="rounded-2xl p-4 sm:p-6 min-w-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
              Top Performing Deals
            </h3>

            {deals.filter((d) => formatRiskLevel(d.riskScore) === "Low")
              .length > 0 ? (
              <div className="space-y-3">
                {deals
                  .filter((d) => formatRiskLevel(d.riskScore) === "Low")
                  .slice(0, 4)
                  .map((deal, i) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/3 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {deal.name}
                          </p>
                          <p className="text-xs text-white/40">{deal.stage}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white shrink-0">
                        ${deal.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">No low-risk deals yet</p>
              </div>
            )}
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6 min-w-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(239,68,68,0.05) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
              At Risk Deals
            </h3>

            {deals.filter((d) => formatRiskLevel(d.riskScore) === "High")
              .length > 0 ? (
              <div className="space-y-3">
                {deals
                  .filter((d) => formatRiskLevel(d.riskScore) === "High")
                  .slice(0, 4)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/3 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {deal.name}
                          </p>
                          <p className="text-xs text-red-400/70 truncate">
                            {deal.recommendedAction?.label || "Needs attention"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-red-400 px-2 py-1 rounded-lg bg-red-500/10 shrink-0">
                        {(deal.riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
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
                <p className="text-white/40 text-sm">No high-risk deals!</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Stage Velocity</h3>
            <div className="space-y-3">
              {["lead", "qualified", "proposal", "negotiation"].map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage);
                const avgDays = stageDeals.length > 0
                  ? Math.round(stageDeals.reduce((acc, d) => {
                    const days = Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    return acc + days;
                  }, 0) / stageDeals.length)
                  : 0;
                return (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm text-white/70 capitalize">{stage}</span>
                    <span className="text-sm font-medium text-white">{avgDays} days avg</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Value by Stage</h3>
            <div className="space-y-3">
              {["lead", "qualified", "proposal", "negotiation", "closed_won"].map((stage) => {
                const stageValue = deals
                  .filter((d) => d.stage === stage)
                  .reduce((acc, d) => acc + d.value, 0);
                const maxValue = Math.max(...["lead", "qualified", "proposal", "negotiation", "closed_won"].map((s) =>
                  deals.filter((d) => d.stage === s).reduce((acc, d) => acc + d.value, 0)
                ), 1);
                const percentage = maxValue > 0 ? (stageValue / maxValue) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60 capitalize">{stage.replace("_", " ")}</span>
                      <span className="text-xs font-medium text-white">${(stageValue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 lg:p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-sm text-white/70">Win Rate</span>
                <span className="text-lg font-bold text-green-400">
                  {closedTotal > 0 ? Math.round(winRate) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-sm text-white/70">Avg Deal Size</span>
                <span className="text-lg font-bold text-blue-400">
                  ${deals.length > 0
                    ? Math.round(deals.reduce((acc, d) => acc + d.value, 0) / deals.length / 1000)
                    : 0}K
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <span className="text-sm text-white/70">Active Deals</span>
                <span className="text-lg font-bold text-purple-400">
                  {deals.filter((d) => d.status === "active").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
