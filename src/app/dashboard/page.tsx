import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RevenueForecastChart } from "@/components/revenue-forecast-chart";
import { TopRevenueSourcesChart } from "@/components/top-revenue-sources-chart";
import { TopDeals } from "@/components/top-deals";
import { CustomerByCountry } from "@/components/customer-by-country";
import { formatRevenue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  noStore();
  const deals = await getAllDeals();

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const revenueImpact = totalValue;

  const currentMonth = new Date();
  const lastMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );
  const nowTime = currentMonth.getTime();

  const currentMonthRevenue = deals
    .filter((deal) => {
      const dealDate = new Date(deal.createdAt);
      return (
        dealDate >=
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      );
    })
    .reduce((sum, deal) => sum + deal.value, 0);

  const lastMonthRevenue = deals
    .filter((deal) => {
      const dealDate = new Date(deal.createdAt);
      return (
        dealDate >= lastMonth &&
        dealDate <
          new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      );
    })
    .reduce((sum, deal) => sum + deal.value, 0);

  const revenueGrowthPercent =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const closedWonDeals = deals.filter(
    (deal) => deal.stage === "Closed Won"
  ).length;
  const totalDeals = deals.length;
  const dataAccuracy = totalDeals > 0 ? (closedWonDeals / totalDeals) * 100 : 0;

  const activeDeals = deals.filter(
    (deal) => deal.stage !== "Closed Won" && deal.stage !== "Closed Lost"
  ).length;
  const activeInsights = activeDeals;

  const avgDealAge =
    deals.length > 0
      ? deals.reduce((sum, deal) => {
          const age =
            (nowTime - new Date(deal.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + age;
        }, 0) / deals.length
      : 0;
  const processingSpeed =
    avgDealAge > 0 ? Math.max(0.1, Math.min(1.0, 30 / avgDealAge)) : 0.8;

  const monthlyRevenue = deals.reduce((acc, deal) => {
    const date = new Date(deal.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + deal.value;
    return acc;
  }, {} as Record<string, number>);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = [];
  const today = new Date();

  const sortedMonths = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  let avgGrowthRate = 0;
  if (sortedMonths.length >= 2) {
    const growthRates: number[] = [];
    for (let i = 1; i < sortedMonths.length; i++) {
      const prevValue = sortedMonths[i - 1][1];
      const currValue = sortedMonths[i][1];
      if (prevValue > 0) {
        growthRates.push((currValue - prevValue) / prevValue);
      }
    }
    if (growthRates.length > 0) {
      avgGrowthRate =
        growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    }
  }

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const actual = monthlyRevenue[monthKey] || 0;

    const prediction = actual > 0 ? actual * (1 + avgGrowthRate) : 0;

    chartData.push({
      month: monthNames[date.getMonth()],
      actual: actual,
      prediction: prediction,
    });
  }

  const stageToSource: Record<string, string> = {
    discover: "Direct",
    qualify: "Organic",
    proposal: "Paid Ads",
    negotiation: "Referrals",
    closed_won: "Partnerships",
  };

  const revenueBySource = deals.reduce((acc, deal) => {
    const source = stageToSource[deal.stage] || "Direct";
    if (!acc[source]) {
      acc[source] = { value: 0, previousValue: 0 };
    }
    acc[source].value += deal.value;
    return acc;
  }, {} as Record<string, { value: number; previousValue: number }>);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const previousRevenueBySource = deals.reduce((acc, deal) => {
    const dealDate = new Date(deal.createdAt);
    if (dealDate < thirtyDaysAgo) {
      const source = stageToSource[deal.stage] || "Direct";
      if (!acc[source]) {
        acc[source] = 0;
      }
      acc[source] += deal.value;
    }
    return acc;
  }, {} as Record<string, number>);

  const revenueSources = [
    "Direct",
    "Organic",
    "Paid Ads",
    "Referrals",
    "Partnerships",
  ].map((source) => {
    const current = revenueBySource[source]?.value || 0;
    const previous = previousRevenueBySource[source] || current * 0.8; // Fallback if no previous data
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      source,
      value: current,
      change: change,
    };
  });

  return (
    <DashboardLayout>
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b]">
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#2a0f12] bg-gradient-to-br from-[#1f0b0d] via-[#181013] to-[#0e0d0d] p-5 shadow-[0_25px_80px_rgba(213,16,36,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d1115] text-[#f87171] border border-[#3a1418]">
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
                  <p className="text-xs uppercase tracking-[0.08em] text-[#fca5a5]">
                    Revenue Impact
                  </p>
                  <p className="text-[11px] text-[#9f6168]">Verified models</p>
                </div>
              </div>
              <button className="text-[#fca5a5]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {formatRevenue(revenueImpact)}
            </p>
            <p className="text-xs text-[#fca5a5]">
              {revenueGrowthPercent >= 0 ? "+" : ""}
              {revenueGrowthPercent.toFixed(1)}% from last month
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#a3e635] border border-[#1f1f1f]">
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
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                  Data Accuracy
                </p>
                <p className="text-[11px] text-[#5f5f5f]">Verified models</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {dataAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-[#7d7d7d]">Live</p>
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
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                  Active Insights
                </p>
                <p className="text-[11px] text-[#5f5f5f]">
                  {activeDeals > 0 ? `${activeDeals} active` : "No active"}
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {activeInsights}
            </p>
            <p className="text-xs text-[#22c55e]">Increasing</p>
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
                    d="M3 4.5h14.25M3 8.25h14.25M3 12h14.25m-14.25 3.75h14.25"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
                  Processing Speed
                </p>
                <p className="text-[11px] text-[#5f5f5f]">
                  Real-time analytics
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {processingSpeed.toFixed(1)}s
            </p>
            <p className="text-xs text-[#7d7d7d]">Updated live</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-2xl border border-[#1f1f1f] bg-[#101010] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between mb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#8a8a8a]"
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
                  <p className="text-sm text-[#7d7d7d] uppercase tracking-[0.08em]">
                    Business Performance Trends
                  </p>
                </div>
                <p className="text-3xl font-semibold text-white">
                  {formatRevenue(totalValue)}
                </p>
                <div className="flex items-center gap-1">
                  {avgGrowthRate >= 0 ? (
                    <svg
                      className="w-3 h-3 text-[#22c55e]"
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
                  ) : (
                    <svg
                      className="w-3 h-3 text-[#ef4444]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l2.28-5.941"
                      />
                    </svg>
                  )}
                  <p
                    className={`text-xs ${
                      avgGrowthRate >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                    }`}
                  >
                    {avgGrowthRate >= 0 ? "+" : ""}
                    {(avgGrowthRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#181818] border border-[#2a2a2a]">
                  Last 6 Month
                </button>
                <button className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8a8a8a] bg-[#121212] border border-[#1f1f1f]">
                  Columns
                </button>
                <button className="p-2 rounded-xl text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a] transition-colors">
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
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-[#161616] bg-[#0f0f0f] p-3">
              <RevenueForecastChart data={chartData} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <TopRevenueSourcesChart data={revenueSources} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <TopDeals
              deals={deals.map((deal) => ({
                id: deal.id,
                name: deal.name,
                stage: deal.stage,
                value: deal.value,
                createdAt: deal.createdAt,
              }))}
            />
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <CustomerByCountry />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
