import Link from "next/link";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { getAuthenticatedUserId } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportButton } from "@/components/export-button";
import { DealsFilter } from "@/components/deals-filter";
import { DealsScopeFilter } from "@/components/deals-scope-filter";
import { PipelineValueCard } from "@/components/pipeline-value-card";
import { DemoBanner } from "@/components/demo-banner";
import { DealsTableWithBulk } from "@/components/deals-table-with-bulk";

export const dynamic = "force-dynamic";

type FilterType = "all" | "active" | "at-risk" | "closed";

function filterDeals(
  deals: Awaited<ReturnType<typeof getAllDeals>>,
  filter: FilterType,
  searchQuery?: string
) {
  let filtered = deals;

  if (searchQuery && searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (deal) =>
        deal.name.toLowerCase().includes(query) ||
        deal.stage.toLowerCase().includes(query)
    );
  }

  switch (filter) {
    case "all":
      return filtered;
    case "active":
      return filtered.filter((deal) => deal.status === "active");
    case "at-risk":
      return filtered.filter(
        (deal) => formatRiskLevel(deal.riskScore) === "High"
      );
    case "closed":
      return filtered.filter(
        (deal) => deal.status === "saved" || deal.status === "lost" || deal.status === "closed"
      );
    default:
      return filtered;
  }
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string; team?: string; scope?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const filter = (params?.filter || "all") as FilterType;
  const searchQuery = params?.search;
  const teamId = params?.team ?? null;
  const scope = (params?.scope || "my") as "my" | "all";

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    redirect("/sign-in?redirect=/deals");
  }

  let showDemoBanner = false;
  let deals: Awaited<ReturnType<typeof getAllDeals>> = [];
  let dataError = false;
  try {
    deals = await getAllDeals(
      scope === "all"
        ? { includeTeamDeals: true }
        : teamId
          ? { teamId }
          : undefined
    );
    showDemoBanner = deals.length > 0 && deals.every((deal) => deal.isDemo);
  } catch {
    dataError = true;
  }

  const scopeDeals =
    teamId && scope === "my"
      ? deals.filter(
        (d) => d.assignedToId === userId || d.userId === userId
      )
      : deals;

  const filteredDeals = filterDeals(scopeDeals, filter, searchQuery);

  const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 };
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const aUrgency = a.recommendedAction?.urgency || "none";
    const bUrgency = b.recommendedAction?.urgency || "none";
    const urgencyDiff = urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.riskScore - a.riskScore;
  });

  const totalValue = scopeDeals.reduce((sum, deal) => sum + deal.value, 0);
  const highRiskDeals = scopeDeals.filter(
    (deal) => formatRiskLevel(deal.riskScore) === "High"
  );
  const activeDeals = scopeDeals.filter(
    (deal) => deal.status === "active" || deal.status === "Active"
  );

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/8 bg-[#080808] transition-colors hover:border-white/10 card-elevated";

  return (
    <DashboardLayout>
      <div className="relative min-h-full w-full">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto">
          {dataError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-500/10">
              <p className="text-sm font-medium text-amber-200">Data temporarily unavailable</p>
              <p className="text-xs text-amber-200/70 mt-1">Check your connection and try again. Deals list is empty.</p>
            </div>
          )}
          {showDemoBanner && <DemoBanner />}

          <header className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/50 mb-3">Pipeline</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12] [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                  All
                  <span className="text-[#0f766e]" style={{ textShadow: "0 0 32px rgba(15,118,110,0.35)" }}> deals</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
                  Manage and track your deals pipeline.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <ExportButton
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-colors bg-white/4 border border-white/8 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  teamId={teamId}
                  includeTeamDeals={scope === "all"}
                />
                <Link
                  href="/deals/new"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New deal
                </Link>
              </div>
            </div>
          </header>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Key metrics</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-white/70">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">All deals</p>
                    <p className="text-[11px] text-white/40 truncate">Total deals</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{scopeDeals.length}</p>
                <p className="text-xs text-white/40">Active pipeline</p>
              </div>

              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-700/10 text-green-400 border border-green-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">Active</p>
                    <p className="text-[11px] text-white/40 truncate">In progress</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{activeDeals.length}</p>
                <p className="text-xs text-green-400/80">Increasing</p>
              </div>

              <div className={`${CARD_CLASS} min-w-0 flex flex-col space-y-3`}>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-700/10 text-red-400 border border-red-700/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/50 truncate">At risk</p>
                    <p className="text-[11px] text-white/40 truncate">Need attention</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{highRiskDeals.length}</p>
                <p className="text-xs text-white/40">Monitor closely</p>
              </div>

              <PipelineValueCard totalValue={totalValue} className="border-white/8! bg-[#080808]! hover:border-white/10! shadow-none! card-elevated" />
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/45 mb-5">Deal pipeline</p>
            <div className={CARD_CLASS}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/6 pb-5">
                <h2 className="text-base font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Deals</h2>
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap max-md:gap-2">
                  <Suspense fallback={<div className="h-8 w-24 rounded-lg relative overflow-hidden bg-white/[0.04] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent before:animate-[skeleton-shimmer_2s_ease-in-out_infinite] before:-translate-x-full" />}>
                    <DealsScopeFilter currentScope={scope} />
                  </Suspense>
                  <Suspense fallback={<div className="h-8 w-48 rounded-lg relative overflow-hidden bg-white/[0.04] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent before:animate-[skeleton-shimmer_2s_ease-in-out_infinite] before:-translate-x-full" />}>
                    <DealsFilter currentFilter={filter} />
                  </Suspense>
                </div>
              </div>

              {filteredDeals.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <p className="text-white/50 text-sm font-medium">No deals yet</p>
                  <p className="text-white/40 text-xs mt-1.5 max-w-md mx-auto">Start tracking your pipeline by creating your first deal.</p>
                  <Link
                    href="/deals/new"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors mt-6"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create deal
                  </Link>
                </div>
                  ) : (
                <DealsTableWithBulk
                  deals={sortedDeals.map((d) => ({
                id: d.id,
                name: d.name,
                value: d.value,
                stage: d.stage,
                riskScore: d.riskScore,
                assignedTo: d.assignedTo ?? null,
                recommendedAction: d.recommendedAction ?? null,
                lastActivityAt: d.lastActivityAt,
                isDemo: d.isDemo,
              }))}
                  />
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
