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
import { PerformanceChartSkeleton, RevenueSourcesSkeleton, PipelineForecastSkeleton, ChartSkeleton } from "@/components/ui/skeleton";
import { formatRevenue } from "@/lib/utils";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { DashboardGettingStarted } from "@/components/dashboard-getting-started";

const BusinessPerformanceTrends = nextDynamic(
  () =>
    import("@/components/business-performance-trends").then((m) => ({
      default: m.BusinessPerformanceTrends,
    })),
  { loading: () => <PerformanceChartSkeleton /> }
);

const TopRevenueSourcesChart = nextDynamic(
  () =>
    import("@/components/top-revenue-sources-chart").then((m) => ({
      default: m.TopRevenueSourcesChart,
    })),
  { loading: () => <RevenueSourcesSkeleton /> }
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
  { loading: () => <PipelineForecastSkeleton /> }
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
  try {
    await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/dashboard");
  }

  let showDemoBanner = false;
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dbUnavailable = false;
  let crmConnected = false;
  let crmEverSynced = false;

  try {
    deals = await getAllDeals();
    showDemoBanner = deals.length > 0 && deals.every((deal) => deal.isDemo);
  } catch {
    dbUnavailable = true;
  }

  try {
    const integrationStatuses = await getAllIntegrationStatuses();
    crmConnected =
      integrationStatuses.salesforce.connected ||
      integrationStatuses.hubspot.connected;
    crmEverSynced = Boolean(
      integrationStatuses.salesforce.lastSyncAt ||
      integrationStatuses.hubspot.lastSyncAt
    );
  } catch {
  }

  const showGettingStarted =
    !dbUnavailable &&
    (showDemoBanner ||
      !crmConnected ||
      (crmConnected && !crmEverSynced));

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

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-screen w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto">
          {dbUnavailable && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/10">
              <p className="text-sm font-medium text-amber-200">Unable to load dashboard data</p>
              <p className="text-xs text-amber-200/70 mt-1">
                This can happen when the database is temporarily busy. Please try again in a moment.
              </p>
            </div>
          )}
          {showDemoBanner && <DemoBanner />}

          <DashboardGettingStarted
            show={showGettingStarted}
            crmConnected={crmConnected}
            crmEverSynced={crmEverSynced}
            demoMode={showDemoBanner}
          />

          <header className="animate-fade-in-up">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">
              Dashboard
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Pipeline
              <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}> overview</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
              Key metrics, performance trends, and at-risk deals at a glance.
            </p>
          </header>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <div className="relative rounded-xl border border-white/[0.08] overflow-hidden bg-[#080808] card-elevated">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 100%)",
                }}
                aria-hidden
              />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0f766e] via-[#0f766e]/50 to-[#0f766e]/15" aria-hidden />
              <div className="relative pl-6 pr-6 sm:pl-8 sm:pr-8 lg:px-10 py-8 sm:py-9">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/45 mb-3">
                      Pipeline value
                    </p>
                    <p className="text-4xl sm:text-5xl lg:text-[3rem] font-bold tabular-nums text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                      {formatRevenue(revenueImpact)}
                    </p>
                    <p className={`mt-3 text-base font-semibold tabular-nums ${revenueGrowthPercent >= 0 ? "text-[#0f766e]" : "text-amber-500"}`}>
                      {revenueGrowthPercent >= 0 ? "+" : ""}{revenueGrowthPercent.toFixed(1)}% vs last month
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-8 sm:gap-10 lg:gap-14 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-12 lg:min-h-18">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Data accuracy</p>
                      <p className="text-2xl font-bold tabular-nums text-white mt-1.5">{dataAccuracy.toFixed(1)}%</p>
                      {closedWonCount === 0 && totalDeals > 0 && (
                        <p className="text-[10px] text-white/40 mt-1">Close deals to see</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Active deals</p>
                      <p className="text-2xl font-bold tabular-nums text-white mt-1.5">{activeInsights}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Processing</p>
                      <p className="text-2xl font-bold tabular-nums text-white mt-1.5">{processingSpeed.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Performance
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} min-h-[300px] lg:min-h-[340px] xl:min-h-[360px]`}>
                <BusinessPerformanceTrends
                  chartData={chartData}
                  totalValue={totalValue}
                  avgGrowthRate={avgGrowthRate}
                />
              </div>
              <div className={`${CARD_CLASS} min-h-[300px] lg:min-h-[340px] xl:min-h-[360px]`}>
                <TopRevenueSourcesChart data={revenueSources} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Pipeline & insights
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
              <div className={`lg:col-span-2 min-w-0 h-full ${CARD_CLASS} p-7 sm:p-8 lg:p-10`}>
                <PipelineForecastChart forecast={pipelineForecast} />
              </div>
              <div className={`lg:col-span-1 min-w-0 h-full ${CARD_CLASS}`}>
                <InsightsPanel deals={dealsForPrediction} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Top deals · Map · Calendar
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} min-w-0`}>
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
              <div className={`${CARD_CLASS} min-w-0 overflow-hidden`}>
                <CustomerByCountry />
              </div>
              <div className={`${CARD_CLASS} min-w-0`}>
                <UpcomingMeetingsWidget limit={5} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
