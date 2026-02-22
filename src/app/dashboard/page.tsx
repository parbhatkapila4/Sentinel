import { unstable_noStore as noStore } from "next/cache";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
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
import { TopDeals } from "@/components/top-deals";
import { InsightsPanel } from "@/components/insights-panel";
import { DemoBanner } from "@/components/demo-banner";
import { UpcomingMeetingsWidget } from "@/components/upcoming-meetings-widget";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatRevenue } from "@/lib/utils";
import { getAuthenticatedUserId } from "@/lib/auth";
import { seedDemoDataForUser, hasDemoData } from "@/lib/demo-data";

const BusinessPerformanceTrends = nextDynamic(
  () =>
    import("@/components/business-performance-trends").then((m) => ({
      default: m.BusinessPerformanceTrends,
    })),
  { loading: () => <ChartSkeleton /> }
);

const TopRevenueSourcesChart = nextDynamic(
  () =>
    import("@/components/top-revenue-sources-chart").then((m) => ({
      default: m.TopRevenueSourcesChart,
    })),
  { loading: () => <ChartSkeleton className="min-h-[280px] lg:min-h-[320px] xl:min-h-[350px]" /> }
);

const CustomerByCountry = nextDynamic(
  () =>
    import("@/components/customer-by-country").then((m) => ({
      default: m.CustomerByCountry,
    })),
  { loading: () => <ChartSkeleton className="min-h-[240px]" /> }
);

const PipelineForecastChart = nextDynamic(
  () =>
    import("@/components/pipeline-forecast").then((m) => ({
      default: m.PipelineForecastChart,
    })),
  { loading: () => <ChartSkeleton /> }
);

export const dynamic = "force-dynamic";

const isClosed = (stage: string) =>
  stage === "Closed Won" ||
  stage === "closed_won" ||
  stage === "Closed Lost" ||
  stage === "closed_lost";

function isClosedWonStage(stage: string): boolean {
  const s = stage.toLowerCase().replace(/\s+/g, "_");
  return s === "closed_won" || s === "closed";
}

export default async function DashboardPage() {
  noStore();
  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/dashboard");
  }

  let showDemoBanner = false;
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dbUnavailable = false;

  try {
    await seedDemoDataForUser(userId);
    showDemoBanner = await hasDemoData(userId);
    deals = await getAllDeals();
  } catch {
    dbUnavailable = true;
  }

  const { totalValue, totalDeals } = calculatePipelineMetrics(deals);
  const { growthPercent: revenueGrowthPercent } =
    calculateRevenueGrowth(deals);
  const { data: chartData, avgGrowthRate } = calculateChartData(deals);
  const revenueSources = calculateRevenueBySource(deals);
  const stageDist = getStageDistribution(deals);
  const { avgDealAge } = calculateDealActivity(deals);

  const closedWonCount = Object.entries(stageDist).reduce(
    (sum, [stage, count]) => sum + (isClosedWonStage(stage) ? count : 0),
    0
  );
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
      <div className="relative min-h-screen w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-8 sm:space-y-10 max-w-[1600px] mx-auto">
          {dbUnavailable && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-black/20">
              <p className="text-sm font-medium text-amber-200">Database temporarily unavailable</p>
              <p className="text-xs text-amber-200/70 mt-1">
                Check your <code className="bg-white/10 px-1 rounded">DATABASE_URL</code> and that your database is active.
              </p>
            </div>
          )}
          {showDemoBanner && <DemoBanner />}


          <header className="animate-fade-in-up">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-white/45 mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.15] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Pipeline
              <span className="text-[#0ea5e9]" style={{ textShadow: "0 0 32px rgba(14,165,233,0.25)" }}> overview</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/55 max-w-xl">
              Key metrics, performance trends, and at-risk deals at a glance.
            </p>
          </header>


          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0c0c0c]">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0ea5e9]/60 to-[#0ea5e9]/20" aria-hidden />
              <div className="pl-6 pr-6 sm:pl-7 sm:pr-7 lg:px-8 py-6 sm:py-7">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-10">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/40 mb-2">
                      Pipeline value
                    </p>
                    <p className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tabular-nums text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                      {formatRevenue(revenueImpact)}
                    </p>
                    <p className={`mt-2 text-sm font-medium tabular-nums ${revenueGrowthPercent >= 0 ? "text-[#0ea5e9]" : "text-amber-400/90"}`}>
                      {revenueGrowthPercent >= 0 ? "+" : ""}{revenueGrowthPercent.toFixed(1)}% vs last month
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-6 sm:gap-8 lg:gap-10 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-white/[0.07] lg:pl-10 lg:min-h-[4.5rem]">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-white/40">Data accuracy</p>
                      <p className="text-xl font-bold tabular-nums text-white mt-1">{dataAccuracy.toFixed(1)}%</p>
                      {closedWonCount === 0 && totalDeals > 0 && (
                        <p className="text-[10px] text-white/40 mt-1">Close deals to see</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-white/40">Active deals</p>
                      <p className="text-xl font-bold tabular-nums text-white mt-1">{activeInsights}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-white/40">Processing</p>
                      <p className="text-xl font-bold tabular-nums text-white mt-1">{processingSpeed.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-4">
              Performance
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <div className="rounded-2xl p-4 sm:p-6 border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 min-h-[280px] lg:min-h-[320px] xl:min-h-[350px]">
                <BusinessPerformanceTrends
                  chartData={chartData}
                  totalValue={totalValue}
                  avgGrowthRate={avgGrowthRate}
                />
              </div>
              <div className="rounded-2xl p-4 sm:p-6 border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 min-h-[280px] lg:min-h-[320px] xl:min-h-[350px]">
                <TopRevenueSourcesChart data={revenueSources} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-4">
              Pipeline & insights
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
              <div className="lg:col-span-2 min-w-0 h-full rounded-2xl overflow-hidden border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 p-5 sm:p-6 lg:p-6">
                <PipelineForecastChart forecast={pipelineForecast} />
              </div>
              <div className="lg:col-span-1 min-w-0 h-full rounded-2xl overflow-hidden border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 p-5 sm:p-6 lg:p-6">
                <InsightsPanel deals={dealsForPrediction} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-4">
              Top deals · Map · Calendar
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
              <div className="rounded-2xl p-4 sm:p-6 border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 min-w-0">
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
              <div className="rounded-2xl p-4 sm:p-6 border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 min-w-0 overflow-hidden">
                <CustomerByCountry />
              </div>
              <div className="rounded-2xl p-4 sm:p-6 border border-white/[0.07] bg-[#0f0f0f]/90 shadow-xl shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-white/10 min-w-0">
                <UpcomingMeetingsWidget limit={5} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
