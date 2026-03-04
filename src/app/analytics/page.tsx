import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatRevenue } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportButton } from "@/components/export-button";
import { AnalyticsDateFilter } from "@/components/analytics-date-filter";
import { RiskDistributionChart } from "@/components/risk-distribution-chart";
import { subDays } from "date-fns";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

function filterDealsByDateRange(
  deals: Awaited<ReturnType<typeof getAllDeals>>,
  range: string
) {
  if (range === "all") {
    return deals;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (range) {
    case "7d":
      cutoffDate = subDays(now, 7);
      break;
    case "30d":
      cutoffDate = subDays(now, 30);
      break;
    case "90d":
      cutoffDate = subDays(now, 90);
      break;
    default:
      cutoffDate = subDays(now, 30);
  }

  return deals.filter((deal) => {
    const dealDate = new Date(deal.createdAt);
    return dealDate >= cutoffDate;
  });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const range = params?.range || "30d";

  let allDeals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dataError = false;
  try {
    allDeals = await getAllDeals();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=" + encodeURIComponent("/analytics?range=" + (range || "30d")));
    }
    dataError = true;
  }
  const deals = filterDealsByDateRange(allDeals, range);

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

  const lowNeedingAction = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low" && d.recommendedAction?.urgency === "high"
  ).length;
  const mediumNeedingAction = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium" && d.recommendedAction?.urgency === "high"
  ).length;
  const highNeedingAction = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High" && d.recommendedAction?.urgency === "high"
  ).length;

  const won = deals.filter((d) => d.stage === "closed_won").length;
  const lost = deals.filter((d) => d.stage === "closed_lost").length;
  const closedTotal = won + lost;
  const winRate = closedTotal > 0 ? (won / closedTotal) * 100 : 0;

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-screen w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto">
          {dataError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/10">
              <p className="text-sm font-medium text-amber-200">Data temporarily unavailable</p>
              <p className="text-xs text-amber-200/70 mt-1">Check your connection and try again.</p>
            </div>
          )}

          <header className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">
                  Analytics
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  Revenue
                  <span className="text-[#0ea5e9]" style={{ textShadow: "0 0 48px rgba(14,165,233,0.4)" }}> breakdown</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
                  Track your finances and achieve your financial goals.
                </p>
              </div>
              <div className="flex flex-col gap-3 items-stretch sm:items-end">
                <ExportButton
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-[#050505] border border-white/6 hover:border-white/10"
                />
                <Suspense fallback={
                  <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-[#050505] border border-white/6">
                    Loading...
                  </div>
                }>
                  <AnalyticsDateFilter />
                </Suspense>
              </div>
            </div>
          </header>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Key metrics
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              <div className={CARD_CLASS}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Total Pipeline</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  {formatRevenue(totalValue)}
                </p>
                <p className="text-xs text-emerald-400/90 mt-1">+12.5% from last month</p>
              </div>
              <div className={CARD_CLASS}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Average Deal</p>
                  <div className="w-8 h-8 rounded-lg bg-[#0f766e]/10 flex items-center justify-center border border-[#0f766e]/20">
                    <svg className="w-4 h-4 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  {formatRevenue(avgDealValue)}
                </p>
                <p className="text-xs text-emerald-400/90 mt-1">+8.2% from last month</p>
              </div>
              <div className={CARD_CLASS}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Risk Score</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  {(avgRiskScore * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-red-400/90 mt-1">-3.1% from last month</p>
              </div>
              <div className={CARD_CLASS}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/45">Needs Action</p>
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center border border-red-500/20">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  {dealsNeedingAction}
                </p>
                <p className={`text-xs mt-1 ${dealsNeedingAction > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {dealsNeedingAction > 0 ? "Urgent" : "None pending"}
                </p>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Risk & attention
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
              <div className={CARD_CLASS}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-6 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  Risk Distribution
                </h3>

                <div className="flex flex-col items-center justify-center mb-6">
                  <RiskDistributionChart
                    lowRisk={lowRiskDeals}
                    mediumRisk={mediumRiskDeals}
                    highRisk={highRiskDeals}
                    lowNeedingAction={lowNeedingAction}
                    mediumNeedingAction={mediumNeedingAction}
                    highNeedingAction={highNeedingAction}
                    total={totalDeals}
                    className="min-h-[260px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Low", value: lowRiskDeals, dot: "bg-cyan-400", card: "border-cyan-500/25 bg-cyan-500/10" },
                    { label: "Medium", value: mediumRiskDeals, dot: "bg-violet-400", card: "border-violet-500/25 bg-violet-500/10" },
                    { label: "High", value: highRiskDeals, dot: "bg-rose-400", card: "border-rose-500/25 bg-rose-500/10" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl border p-3 text-center ${item.card}`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <div className={`w-2 h-2 rounded-full ${item.dot} ring-2 ring-white/10`} />
                        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/50">{item.label}</span>
                      </div>
                      <p className="text-xl font-bold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Deals Requiring Attention</h3>

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
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/6 hover:border-red-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{deal.name}</p>
                              <p className="text-xs text-white/50">{deal.stage} • ${deal.value.toLocaleString("en-US")}</p>
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
                      className="block mt-4 text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      View all at-risk deals →
                    </a>
                  )}
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Top & at-risk deals
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} min-w-0`}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
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
                          className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/6 min-w-0"
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
                            ${deal.value.toLocaleString("en-US")}
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

              <div className={`${CARD_CLASS} min-w-0`}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
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
                          className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/6 min-w-0"
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
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">
              Velocity & insights
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
              <div className={CARD_CLASS}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Stage Velocity</h3>
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

              <div className={CARD_CLASS}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Value by Stage</h3>
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
                          <span className="text-xs font-medium text-white">{formatRevenue(stageValue)}</span>
                        </div>
                        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#0f766e] to-[#14b8a6] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Quick Insights</h3>
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
                  <div className="flex items-center justify-between p-3 bg-red-600/10 rounded-lg border border-red-600/20">
                    <span className="text-sm text-white/70">Active Deals</span>
                    <span className="text-lg font-bold text-red-400">
                      {deals.filter((d) => d.status === "active").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
