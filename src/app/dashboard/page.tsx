import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  noStore();
  const deals = await getAllDeals();

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const highestDeal =
    deals.length > 0 ? Math.max(...deals.map((d) => d.value)) : 0;
  const lowestDeal =
    deals.length > 0 ? Math.min(...deals.map((d) => d.value)) : 0;

  const monthlyRevenue = deals.reduce((acc, deal) => {
    const date = new Date(deal.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + deal.value;
    return acc;
  }, {} as Record<string, number>);

  const sortedMonths = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let growthRate = 0;
  if (sortedMonths.length >= 2) {
    const currentMonth = sortedMonths[0][1];
    const previousMonth = sortedMonths[1][1];
    if (previousMonth > 0) {
      growthRate = Math.round(
        ((currentMonth - previousMonth) / previousMonth) * 100
      );
    }
  }

  const chartData = sortedMonths.reverse().map(([monthKey, value]) => {
    const [year, month] = monthKey.split("-");
    return {
      label: `${monthNames[parseInt(month) - 1].slice(0, 3)} ${year.slice(2)}`,
      value,
    };
  });

  const chartPoints = chartData.reduce((acc, point, index) => {
    const previousCumulative = index > 0 ? acc[index - 1].cumulative : 0;
    acc.push({ ...point, cumulative: previousCumulative + point.value });
    return acc;
  }, [] as Array<{ label: string; value: number; cumulative: number }>);

  const maxChartValue =
    chartPoints.length > 0
      ? Math.max(...chartPoints.map((p) => p.cumulative))
      : 100;

  const getStageColor = (stage: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      discover: { bg: "bg-blue-500/20", text: "text-blue-400" },
      qualify: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
      proposal: { bg: "bg-violet-500/20", text: "text-violet-400" },
      negotiation: { bg: "bg-amber-500/20", text: "text-amber-400" },
      closed_won: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
      closed_lost: { bg: "bg-red-500/20", text: "text-red-400" },
    };
    return colors[stage] || { bg: "bg-gray-500/20", text: "text-gray-400" };
  };

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
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
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
            <Link
              href="/deals/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Report
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Total Revenue</p>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-rose-400"
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
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">{deals.length} deals total</p>
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
              <p className="text-sm text-white/40">Revenue Growth Rate</p>
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
              {growthRate >= 0 ? "+" : ""}
              {growthRate}%
            </p>
            <p className="text-xs text-white/40">vs previous month</p>
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
              <p className="text-sm text-white/40">Highest Revenue</p>
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
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              ${highestDeal.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">Largest deal value</p>
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
              <p className="text-sm text-white/40">Lowest Revenue</p>
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
                    d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              ${lowestDeal.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">Smallest deal value</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div
            className="col-span-2 rounded-2xl p-6"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Total Pipeline Value
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-white">
                    ${totalValue.toLocaleString()}
                  </p>
                  {growthRate !== 0 && (
                    <span
                      className={`flex items-center gap-1 text-xs ${
                        growthRate >= 0
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-red-400 bg-red-500/10"
                      } px-2 py-1 rounded-lg`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={
                            growthRate >= 0
                              ? "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                              : "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                          }
                        />
                      </svg>
                      {growthRate >= 0 ? "+" : ""}
                      {growthRate}% Growth
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Today
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className="flex items-center gap-1 p-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <button className="p-1.5 rounded text-white/60 hover:text-white">
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
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded bg-white/10 text-white">
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
                        d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative h-48">
              {chartPoints.length > 0 ? (
                <>
                  <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-[10px] text-white/30">
                    <span>${(maxChartValue / 1000).toFixed(0)}k</span>
                    <span>${((maxChartValue * 0.75) / 1000).toFixed(0)}k</span>
                    <span>${((maxChartValue * 0.5) / 1000).toFixed(0)}k</span>
                    <span>${((maxChartValue * 0.25) / 1000).toFixed(0)}k</span>
                    <span>$0</span>
                  </div>

                  <div className="absolute left-14 right-0 top-0 bottom-0">
                    <div className="absolute inset-0 flex flex-col justify-between pb-6">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-full border-t border-white/5"
                        />
                      ))}
                    </div>

                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 500 180"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="lineGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgba(139, 92, 246, 0.3)"
                          />
                          <stop
                            offset="100%"
                            stopColor="rgba(139, 92, 246, 0)"
                          />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const points = chartPoints
                          .map((p, i) => {
                            const x =
                              chartPoints.length > 1
                                ? (i / (chartPoints.length - 1)) * 500
                                : 250;
                            const y =
                              maxChartValue > 0
                                ? 160 - (p.cumulative / maxChartValue) * 140
                                : 80;
                            return `${x},${y}`;
                          })
                          .join(" L");

                        const lastPoint = chartPoints[chartPoints.length - 1];
                        const lastX = chartPoints.length > 1 ? 500 : 250;
                        const lastY =
                          maxChartValue > 0
                            ? 160 - (lastPoint.cumulative / maxChartValue) * 140
                            : 80;

                        return (
                          <>
                            <path
                              d={`M${points} L${lastX},160 L0,160 Z`}
                              fill="url(#lineGradient)"
                            />
                            <path
                              d={`M${points}`}
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="2"
                            />
                            <circle
                              cx={lastX}
                              cy={lastY}
                              r="6"
                              fill="#8b5cf6"
                            />
                            <circle
                              cx={lastX}
                              cy={lastY}
                              r="10"
                              fill="rgba(139, 92, 246, 0.3)"
                            />
                          </>
                        );
                      })()}
                    </svg>

                    {chartPoints.length > 0 && (
                      <div
                        className="absolute rounded-xl px-3 py-2 text-center"
                        style={{
                          right: "0",
                          top: "15%",
                          transform: "translateX(0%)",
                          background: "rgba(20, 20, 30, 0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <p className="text-[10px] text-white/50">
                          {chartPoints[chartPoints.length - 1]?.label}
                        </p>
                        <p className="text-sm font-semibold text-white">
                          $
                          {chartPoints[
                            chartPoints.length - 1
                          ]?.cumulative.toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/30">
                      {chartPoints.map((point, i) => (
                        <span key={i}>{point.label}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white/40 text-sm">
                  No deal data available. Create your first deal to see the
                  chart.
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Monthly Revenue Trends
              </h3>
              <button className="text-white/40 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {sortedMonths.length > 0 ? (
                sortedMonths.slice(0, 4).map(([monthKey, value], index) => {
                  const [year, month] = monthKey.split("-");
                  const monthName = monthNames[parseInt(month) - 1];
                  const colors = [
                    { bg: "rgba(139, 92, 246, 0.15)", text: "text-violet-400" },
                    { bg: "rgba(251, 191, 36, 0.15)", text: "text-amber-400" },
                    { bg: "rgba(59, 130, 246, 0.15)", text: "text-blue-400" },
                    {
                      bg: "rgba(16, 185, 129, 0.15)",
                      text: "text-emerald-400",
                    },
                  ];
                  const color = colors[index % colors.length];

                  const dealsInMonth = deals.filter((d) => {
                    const date = new Date(d.createdAt);
                    return (
                      date.getFullYear() === parseInt(year) &&
                      date.getMonth() + 1 === parseInt(month)
                    );
                  }).length;

                  return (
                    <div key={monthKey} className="flex items-center gap-4">
                      <div className="text-center min-w-[40px]">
                        <p className="text-xl font-bold text-white">
                          {dealsInMonth}
                        </p>
                        <p className="text-xs text-white/40">deals</p>
                      </div>
                      <div
                        className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: color.bg }}
                      >
                        <span className={`text-sm font-medium ${color.text}`}>
                          {monthName} {year}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          ${value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-white/40 py-6">
                  No monthly data available yet.
                </div>
              )}
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
              See All
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
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">All Deals</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/40">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                {deals.length} deal{deals.length !== 1 ? "s" : ""}
              </div>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60"
                style={{ background: "rgba(255,255,255,0.05)" }}
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
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60"
                style={{ background: "rgba(255,255,255,0.05)" }}
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
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
                More Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-transparent"
                    />
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Deal Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Risk Reason
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {deals.length > 0 ? (
                  deals.map((deal) => {
                    const stageColor = getStageColor(deal.stage);
                    return (
                      <tr
                        key={deal.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-transparent"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg ${stageColor.bg} flex items-center justify-center`}
                            >
                              <svg
                                className={`w-4 h-4 ${stageColor.text}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {deal.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          ${deal.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm capitalize ${stageColor.text}`}
                          >
                            {deal.stage.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              formatRiskLevel(deal.riskScore) === "High"
                                ? "bg-red-500/20 text-red-400"
                                : formatRiskLevel(deal.riskScore) === "Medium"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {formatRiskLevel(deal.riskScore)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {deal.primaryRiskReason || "No risks"}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {new Date(deal.lastActivityAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-white/40">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-sm mb-2">No deals yet</p>
                        <Link
                          href="/deals/new"
                          className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                        >
                          Create your first deal →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
