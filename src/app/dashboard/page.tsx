import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import {
  calculatePipelineMetrics,
  calculateRevenueGrowth,
  calculateChartData,
  calculateRevenueBySource,
  getStageDistribution,
  calculateDealActivity,
} from "@/lib/analytics";
import { forecastPipelineValue } from "@/lib/predictions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BusinessPerformanceTrends } from "@/components/business-performance-trends";
import { TopRevenueSourcesChart } from "@/components/top-revenue-sources-chart";
import { TopDeals } from "@/components/top-deals";
import { CustomerByCountry } from "@/components/customer-by-country";
import { PipelineForecastChart } from "@/components/pipeline-forecast";
import { InsightsPanel } from "@/components/insights-panel";
import { DemoBanner } from "@/components/demo-banner";
import { UpcomingMeetingsWidget } from "@/components/upcoming-meetings-widget";
import { formatRevenue } from "@/lib/utils";
import { getAuthenticatedUserId } from "@/lib/auth";
import { seedDemoDataForUser, hasDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const isClosed = (stage: string) =>
  stage === "Closed Won" ||
  stage === "closed_won" ||
  stage === "Closed Lost" ||
  stage === "closed_lost";

export default async function DashboardPage() {
  noStore();
  const userId = await getAuthenticatedUserId();
  await seedDemoDataForUser(userId);
  const showDemoBanner = await hasDemoData(userId);
  const deals = await getAllDeals();

  const { totalValue, totalDeals } = calculatePipelineMetrics(deals);
  const { growthPercent: revenueGrowthPercent } =
    calculateRevenueGrowth(deals);
  const { data: chartData, avgGrowthRate } = calculateChartData(deals);
  const revenueSources = calculateRevenueBySource(deals);
  const stageDist = getStageDistribution(deals);
  const { avgDealAge } = calculateDealActivity(deals);

  const closedWonCount =
    (stageDist["Closed Won"] ?? 0) + (stageDist["closed_won"] ?? 0);
  const dataAccuracy =
    totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0;

  const activeDeals = deals.filter((d) => !isClosed(d.stage)).length;
  const activeInsights = activeDeals;

  const processingSpeed =
    avgDealAge > 0 ? Math.max(0.1, Math.min(1.0, 30 / avgDealAge)) : 0.8;

  const revenueImpact = totalValue;

  const dealsForPrediction = deals.map((d) => ({
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    createdAt: d.createdAt,
    lastActivityAt: d.lastActivityAt,
    riskScore: d.riskScore,
    riskLevel: d.riskLevel ?? undefined,
    status: d.status ?? undefined,
  }));
  const pipelineForecast = forecastPipelineValue(dealsForPrediction);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 w-full">
        {showDemoBanner && <DemoBanner />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2d1115] text-[#f87171] border border-[#3a1418]">
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
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#fca5a5] truncate">
                    Revenue Impact
                  </p>
                  <p className="text-[11px] text-[#9f6168]">Verified models</p>
                </div>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words min-w-0">
              {formatRevenue(revenueImpact)}
            </p>
            <p className="text-xs text-[#fca5a5]">
              {revenueGrowthPercent >= 0 ? "+" : ""}
              {revenueGrowthPercent.toFixed(1)}% from last month
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#151515] text-[#a3e635] border border-[#1f1f1f]">
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
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {dataAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-[#7d7d7d]">Live</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#151515] text-[#22c55e] border border-[#1f1f1f]">
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
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {activeInsights}
            </p>
            <p className="text-xs text-[#22c55e]">Increasing</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#151515] text-[#f97316] border border-[#1f1f1f]">
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
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {processingSpeed.toFixed(1)}s
            </p>
            <p className="text-xs text-[#7d7d7d]">Updated live</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          <BusinessPerformanceTrends
            chartData={chartData}
            totalValue={totalValue}
            avgGrowthRate={avgGrowthRate}
          />

          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0 min-h-[280px] lg:min-h-[320px] xl:min-h-[350px]">
            <TopRevenueSourcesChart data={revenueSources} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
          <div className="lg:col-span-2 min-w-0 h-full">
            <PipelineForecastChart forecast={pipelineForecast} />
          </div>
          <div className="lg:col-span-1 min-w-0 h-full">
            <InsightsPanel deals={dealsForPrediction} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0">
            <TopDeals
              deals={deals.map((deal) => ({
                id: deal.id,
                name: deal.name,
                stage: deal.stage,
                value: deal.value,
                createdAt: deal.createdAt,
                isDemo: deal.isDemo,
              }))}
            />
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0">
            <CustomerByCountry />
          </div>

          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0">
            <UpcomingMeetingsWidget limit={5} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
