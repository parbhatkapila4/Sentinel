import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAllDeals,
  getFounderRiskOverview,
  getFounderActionQueue,
} from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import {
  HIGH_VALUE_THRESHOLD,
  INACTIVITY_DAYS,
  RISK_REASONS,
} from "@/lib/config";
import { DashboardLayout } from "@/components/dashboard-layout";
import { formatRevenue, formatValueInMillions } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function RiskOverviewPage() {
  noStore();
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let riskOverview: Awaited<ReturnType<typeof getFounderRiskOverview>> = {
    totalDeals: 0,
    atRiskDealsCount: 0,
    overdueDealsCount: 0,
    highUrgencyDealsCount: 0,
    dealsOverdueMoreThan3Days: 0,
    top3MostCriticalDeals: [],
  };
  let actionQueue: Awaited<ReturnType<typeof getFounderActionQueue>> = {
    urgent: [],
    important: [],
    safe: [],
  };
  let dataError = false;
  try {
    [deals, riskOverview, actionQueue] = await Promise.all([
      getAllDeals(),
      getFounderRiskOverview(),
      getFounderActionQueue(),
    ]);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/risk-overview");
    }
    dataError = true;
  }

  const highRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const mediumRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  );
  const lowRiskDeals = deals.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  );

  const avgRiskScore =
    deals.length > 0
      ? deals.reduce((sum, d) => sum + d.riskScore, 0) / deals.length
      : 0;

  const highRiskValue = highRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const mediumRiskValue = mediumRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const lowRiskValue = lowRiskDeals.reduce((sum, d) => sum + d.value, 0);
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const valueAtRiskPercentage =
    totalValue > 0 ? (highRiskValue / totalValue) * 100 : 0;

  const highRiskWithAge = highRiskDeals
    .map((deal) => ({
      deal,
      riskAge: deal.riskAgeInDays || 0,
    }))
    .sort((a, b) => b.riskAge - a.riskAge);
  const avgRiskAge =
    highRiskWithAge.length > 0
      ? highRiskWithAge.reduce((sum, d) => sum + d.riskAge, 0) /
      highRiskWithAge.length
      : 0;

  const stageRiskDistribution: Record<
    string,
    { high: number; medium: number; low: number; total: number }
  > = {};
  deals.forEach((deal) => {
    if (!stageRiskDistribution[deal.stage]) {
      stageRiskDistribution[deal.stage] = {
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      };
    }
    const riskLevel = formatRiskLevel(deal.riskScore);
    stageRiskDistribution[deal.stage][
      riskLevel.toLowerCase() as "high" | "medium" | "low"
    ]++;
    stageRiskDistribution[deal.stage].total++;
  });

  const riskReasonsCount: Record<string, number> = {};
  highRiskDeals.forEach((deal) => {
    if (deal.primaryRiskReason) {
      riskReasonsCount[deal.primaryRiskReason] =
        (riskReasonsCount[deal.primaryRiskReason] || 0) + 1;
    }
  });

  const overdueDeals = deals.filter((d) => d.isActionOverdue);
  const overdueValue = overdueDeals.reduce((sum, d) => sum + d.value, 0);
  const avgOverdueDays =
    overdueDeals.length > 0
      ? overdueDeals.reduce((sum, d) => sum + (d.actionOverdueByDays || 0), 0) /
      overdueDeals.length
      : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEscalations = highRiskDeals.filter((deal) => {
    if (!deal.riskStartedAt) return false;
    return new Date(deal.riskStartedAt) >= sevenDaysAgo;
  }).length;

  const riskRuleExplanations = [
    {
      title: "No activity threshold exceeded",
      description: `No recent human activity for more than ${INACTIVITY_DAYS} days pushes the score up.`,
      count: riskReasonsCount[RISK_REASONS.NO_ACTIVITY] || 0,
      accent: "text-amber-400",
      bar: "bg-amber-500",
    },
    {
      title: "Negotiation stalled without response",
      description:
        "Deals in negotiation become riskier when there is no recent email response or outreach momentum.",
      count: riskReasonsCount[RISK_REASONS.NEGOTIATION_STALLED] || 0,
      accent: "text-red-400",
      bar: "bg-red-700",
    },
    {
      title: "High value deal requires attention",
      description: `Large deals above $${HIGH_VALUE_THRESHOLD.toLocaleString("en-US")} get extra weight because the downside is bigger.`,
      count: riskReasonsCount[RISK_REASONS.HIGH_VALUE] || 0,
      accent: "text-red-300",
      bar: "bg-red-600",
    },
    {
      title: "Competitive signals detected",
      description:
        "Competitive pressure raises risk when timeline or interaction patterns suggest the buyer may be evaluating alternatives.",
      count: riskReasonsCount[RISK_REASONS.COMPETITIVE_PRESSURE] || 0,
      accent: "text-orange-300",
      bar: "bg-orange-600",
    },
  ];

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          {dataError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/10">
              <p className="text-sm font-medium text-amber-200">Data temporarily unavailable</p>
              <p className="text-xs text-amber-200/70 mt-1">Check your connection and try again.</p>
            </div>
          )}
          <header className="animate-fade-in-up">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Alerts</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Risk
              <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}> overview</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
              Comprehensive risk analysis and management across your pipeline.
            </p>
          </header>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Key metrics</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-700/10 text-red-400 border border-red-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">High risk deals</p>
                    <p className="text-[11px] text-white/40 truncate">Requires attention</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{riskOverview.atRiskDealsCount}</p>
                <p className="text-xs text-red-400/80">{formatRevenue(highRiskValue)} at risk</p>
              </div>

              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-700/10 text-amber-400 border border-amber-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">Overdue actions</p>
                    <p className="text-[11px] text-white/40 truncate">Past due date</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{riskOverview.overdueDealsCount}</p>
                <p className="text-xs text-amber-400/80">Avg {avgOverdueDays.toFixed(0)} days overdue</p>
              </div>

              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-700/10 text-red-400 border border-red-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">High urgency</p>
                    <p className="text-[11px] text-white/40 truncate">Immediate action</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{riskOverview.highUrgencyDealsCount}</p>
                <p className="text-xs text-white/40">{recentEscalations} escalated this week</p>
              </div>

              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-700/10 text-green-400 border border-green-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">Avg risk score</p>
                    <p className="text-[11px] text-white/40 truncate">Pipeline health</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{(avgRiskScore * 100).toFixed(0)}%</p>
                <p className="text-xs text-green-400/80">
                  {avgRiskScore < 0.4 ? "Healthy" : avgRiskScore < 0.6 ? "Moderate" : "Critical"}
                </p>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Risk analysis</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
                <div className="border-l-2 border-[#0f766e] pl-3 mb-6">
                  <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Risk distribution</h3>
                </div>
                {deals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/50 text-sm">No deals to analyze</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-48 h-48 max-sm:w-32 max-sm:h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                          {deals.length > 0 && (
                            <>
                              <circle cx="50" cy="50" r="40" fill="none" stroke="#15803d" strokeWidth="12" strokeDasharray={`${(lowRiskDeals.length / deals.length) * 251.2} 251.2`} strokeLinecap="round" />
                              {mediumRiskDeals.length > 0 && (
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#a16207" strokeWidth="12" strokeDasharray={`${(mediumRiskDeals.length / deals.length) * 251.2} 251.2`} strokeDashoffset={-((lowRiskDeals.length / deals.length) * 251.2)} strokeLinecap="round" />
                              )}
                              {highRiskDeals.length > 0 && (
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#b91c1c" strokeWidth="12" strokeDasharray={`${(highRiskDeals.length / deals.length) * 251.2} 251.2`} strokeDashoffset={-(((lowRiskDeals.length + mediumRiskDeals.length) / deals.length) * 251.2)} strokeLinecap="round" />
                              )}
                            </>
                          )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-white max-sm:text-2xl [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{deals.length}</span>
                          <span className="text-xs text-white/50 max-sm:text-[10px]">Total deals</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-sm:gap-2">
                      <div className="text-center p-3 rounded-lg bg-green-700/20 border border-green-700/30 max-sm:p-2">
                        <p className="text-2xl font-bold text-green-400 max-sm:text-xl">{lowRiskDeals.length}</p>
                        <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">Low</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-700/20 border border-amber-700/30 max-sm:p-2">
                        <p className="text-2xl font-bold text-amber-400 max-sm:text-xl">{mediumRiskDeals.length}</p>
                        <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">Medium</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-700/20 border border-red-700/30 max-sm:p-2">
                        <p className="text-2xl font-bold text-red-400 max-sm:text-xl">{highRiskDeals.length}</p>
                        <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">High</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
                <div className="border-l-2 border-white/20 pl-3 mb-6">
                  <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Value at risk</h3>
                </div>
                <div className="space-y-4 max-sm:space-y-3">
                  <div className="max-sm:min-w-0 max-sm:overflow-hidden">
                    <div className="flex items-center justify-between mb-2 max-sm:gap-2 max-sm:mb-1.5">
                      <span className="text-sm font-medium text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">High risk value</span>
                      <span className="text-lg font-bold text-red-400 max-sm:text-base shrink-0">{formatRevenue(highRiskValue)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden max-sm:h-2">
                      <div className="h-full bg-red-700 rounded-full" style={{ width: `${valueAtRiskPercentage}%` }} />
                    </div>
                    <p className="text-xs text-white/50 mt-1 max-sm:text-[10px] max-sm:truncate">{valueAtRiskPercentage.toFixed(1)}% of total pipeline</p>
                  </div>
                  <div className="pt-4 border-t border-white/6 space-y-3 max-sm:pt-3 max-sm:space-y-2">
                    <div className="flex items-center justify-between max-sm:gap-2 max-sm:min-w-0">
                      <span className="text-sm text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Medium risk</span>
                      <span className="text-sm font-semibold text-white max-sm:text-xs shrink-0">{formatRevenue(mediumRiskValue)}</span>
                    </div>
                    <div className="flex items-center justify-between max-sm:gap-2 max-sm:min-w-0">
                      <span className="text-sm text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Low risk</span>
                      <span className="text-sm font-semibold text-white max-sm:text-xs shrink-0">{formatRevenue(lowRiskValue)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/6 max-sm:pt-1.5 max-sm:gap-2 max-sm:min-w-0">
                      <span className="text-sm text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Total pipeline</span>
                      <span className="text-sm font-semibold text-white max-sm:text-xs shrink-0">{formatRevenue(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
                <div className="border-l-2 border-white/20 pl-3 mb-6">
                  <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Risk insights</h3>
                </div>
                <div className="space-y-4 max-sm:space-y-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/8 max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                    <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                      <span className="text-sm font-medium text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Avg risk age</span>
                      <span className="text-sm font-semibold text-white max-sm:text-xs shrink-0">{avgRiskAge.toFixed(0)} days</span>
                    </div>
                    <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">Average time deals have been at risk</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/8 max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                    <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                      <span className="text-sm font-medium text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Overdue value</span>
                      <span className="text-sm font-semibold text-amber-400 max-sm:text-xs shrink-0">{formatRevenue(overdueValue)}</span>
                    </div>
                    <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">Value in deals with overdue actions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/8 max-sm:p-2.5 max-sm:min-w-0 max-sm:overflow-hidden">
                    <div className="flex items-center justify-between mb-1 max-sm:gap-2 max-sm:mb-0.5 max-sm:min-w-0">
                      <span className="text-sm font-medium text-white/50 max-sm:text-xs max-sm:truncate max-sm:min-w-0">Recent escalations</span>
                      <span className="text-sm font-semibold text-red-400 max-sm:text-xs shrink-0">{recentEscalations}</span>
                    </div>
                    <p className="text-xs text-white/50 max-sm:text-[10px] max-sm:truncate">Deals that became at-risk this week</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Focus areas</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
                <div className="border-l-2 border-red-700/60 pl-3 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Most critical deals</h3>
                </div>

                {riskOverview.top3MostCriticalDeals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-green-700/20 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white/50 text-sm">No critical deals</p>
                    <p className="text-white/40 text-xs mt-1">Your pipeline is healthy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {riskOverview.top3MostCriticalDeals.map((deal, index) => {
                      const dealData = deals.find((d) => d.id === deal.id);
                      return (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block p-4 rounded-lg bg-white/5 hover:bg-white/6 border border-white/8 hover:border-red-700/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-400">#{index + 1}</span>
                              <p className="text-sm font-medium text-white">{deal.name}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-red-700/20 text-red-400 border border-red-700/30">{deal.riskLevel}</span>
                          </div>
                          {dealData && <p className="text-xs text-white/60 mb-1">{formatRevenue(dealData.value)}</p>}
                          <p className="text-xs text-red-400/80 mb-1">{deal.primaryRiskReason}</p>
                          {deal.recommendedAction && <p className="text-xs text-white/50 mt-1">→ {deal.recommendedAction.label}</p>}
                          {deal.actionOverdueByDays !== null && deal.actionOverdueByDays > 0 && (
                            <p className="text-xs text-amber-400 mt-1">{deal.actionOverdueByDays} days overdue</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
                <div className="border-l-2 border-white/20 pl-3 mb-4">
                  <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">What makes a deal risky</h3>
                </div>
                {highRiskDeals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/50 text-sm">No high-risk deals right now</p>
                    <p className="text-white/40 text-xs mt-1">Risk rules will appear here as deals become risky.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/8">
                      <p className="text-sm text-white/80 leading-relaxed">
                        Sentinel marks a deal as risky by combining activity decay, stage context, deal value, and competitive pressure into a score from 0 to 1. These are the main triggers:
                      </p>
                    </div>
                    {riskRuleExplanations.map((rule) => {
                      const percentage =
                        highRiskDeals.length > 0
                          ? (rule.count / highRiskDeals.length) * 100
                          : 0;
                      return (
                        <div
                          key={rule.title}
                          className="p-3 rounded-lg bg-white/5 border border-white/8"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                {rule.title}
                              </p>
                              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                {rule.description}
                              </p>
                            </div>
                            <span className={`text-sm font-semibold shrink-0 ${rule.accent}`}>
                              {rule.count}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rule.bar}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-white/50 mt-1">
                            {percentage.toFixed(0)}% of current high-risk deals
                          </p>
                        </div>
                      );
                    })}
                    <div className="p-3 rounded-lg bg-[#0f766e]/10 border border-[#0f766e]/20">
                      <p className="text-xs text-white/70 leading-relaxed">
                        Recent emails sent, replies received, and meetings held reduce the risk score, so active deals stay healthier.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">By stage</p>
            <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden`}>
              <div className="border-l-2 border-white/20 pl-3 mb-6">
                <h3 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Risk by stage</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {Object.entries(stageRiskDistribution)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([stage, distribution]) => {
                    const highPercentage = distribution.total > 0 ? (distribution.high / distribution.total) * 100 : 0;
                    return (
                      <div key={stage} className="p-4 rounded-lg bg-white/5 border border-white/8">
                        <h4 className="text-sm font-semibold text-white mb-3 capitalize">{stage}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-700 shrink-0" />
                              <span className="text-xs text-white/50">High</span>
                            </div>
                            <span className="text-xs font-semibold text-white">{distribution.high}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-amber-700 shrink-0" />
                              <span className="text-xs text-white/50">Med</span>
                            </div>
                            <span className="text-xs font-semibold text-white">{distribution.medium}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-700 shrink-0" />
                              <span className="text-xs text-white/50">Low</span>
                            </div>
                            <span className="text-xs font-semibold text-white">{distribution.low}</span>
                          </div>
                          <div className="pt-2 border-t border-white/6">
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-red-700 rounded-full" style={{ width: `${highPercentage}%` }} />
                            </div>
                            <p className="text-[10px] text-white/50 mt-1">{highPercentage.toFixed(0)}% high risk</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Action queue</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden flex flex-col`}>
                <div className="border-l-2 border-l-red-700/60 pl-3 pb-4 mb-4 border-b border-b-white/6">
                  <h3 className="text-base font-semibold text-red-400 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                    Urgent
                  </h3>
                  <p className="text-xs text-white/50 mt-1">{actionQueue.urgent.length} deals need immediate attention</p>
                </div>
                <div className="p-1 space-y-2 max-h-[400px] overflow-y-auto flex-1 min-h-0">
                  {actionQueue.urgent.length === 0 ? (
                    <p className="text-center text-white/50 text-sm py-4">No urgent deals</p>
                  ) : (
                    actionQueue.urgent.map((deal) => {
                      const dealData = deals.find((d) => d.id === deal.id);
                      const formatted = dealData ? formatValueInMillions(dealData.value) : { value: "0", suffix: "" };
                      return (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block p-3 rounded-lg bg-white/5 hover:bg-white/6 border border-white/8 hover:border-red-700/20 transition-colors"
                        >
                          <p className="text-sm font-medium text-white truncate mb-1">{deal.name}</p>
                          <p className="text-xs text-white/60 mb-1">${formatted.value}{formatted.suffix}</p>
                          <p className="text-xs text-red-400/80">{deal.recommendedAction?.label}</p>
                          {deal.actionOverdueByDays !== null && deal.actionOverdueByDays > 0 && (
                            <p className="text-[10px] text-amber-400 mt-1">{deal.actionOverdueByDays} days overdue</p>
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden flex flex-col`}>
                <div className="border-l-2 border-l-amber-700/60 pl-3 pb-4 mb-4 border-b border-b-white/6">
                  <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    Important
                  </h3>
                  <p className="text-xs text-white/50 mt-1">{actionQueue.important.length} deals to monitor</p>
                </div>
                <div className="p-1 space-y-2 max-h-[400px] overflow-y-auto flex-1 min-h-0">
                  {actionQueue.important.length === 0 ? (
                    <p className="text-center text-white/50 text-sm py-4">No important deals</p>
                  ) : (
                    actionQueue.important.map((deal) => {
                      const dealData = deals.find((d) => d.id === deal.id);
                      const formatted = dealData ? formatValueInMillions(dealData.value) : { value: "0", suffix: "" };
                      return (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block p-3 rounded-lg bg-white/5 hover:bg-white/6 border border-white/8 transition-colors"
                        >
                          <p className="text-sm font-medium text-white truncate mb-1">{deal.name}</p>
                          <p className="text-xs text-white/60 mb-1">${formatted.value}{formatted.suffix}</p>
                          <p className="text-xs text-white/50">{deal.recommendedAction?.label}</p>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <div className={`${CARD_CLASS} max-sm:w-full max-sm:min-w-0 overflow-hidden flex flex-col`}>
                <div className="border-l-2 border-l-green-700/60 pl-3 pb-4 mb-4 border-b border-b-white/6">
                  <h3 className="text-base font-semibold text-green-400 flex items-center gap-2 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    On track
                  </h3>
                  <p className="text-xs text-white/50 mt-1">{actionQueue.safe.length} deals progressing well</p>
                </div>
                <div className="p-1 space-y-2 max-h-[400px] overflow-y-auto flex-1 min-h-0">
                  {actionQueue.safe.length === 0 ? (
                    <p className="text-center text-white/50 text-sm py-4">No deals on track</p>
                  ) : (
                    actionQueue.safe.map((deal) => {
                      const dealData = deals.find((d) => d.id === deal.id);
                      const formatted = dealData ? formatValueInMillions(dealData.value) : { value: "0", suffix: "" };
                      return (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block p-3 rounded-lg bg-white/5 hover:bg-white/6 border border-white/8 transition-colors"
                        >
                          <p className="text-sm font-medium text-white truncate mb-1">{deal.name}</p>
                          <p className="text-xs text-white/60 mb-1">${formatted.value}{formatted.suffix}</p>
                          <p className="text-xs text-white/50">{deal.stage}</p>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
