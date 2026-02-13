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
import { seedDemoDataForUser, hasDemoData } from "@/lib/demo-data";

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
    await seedDemoDataForUser(userId);
    showDemoBanner = await hasDemoData(userId);
    deals = await getAllDeals(
      scope === "all"
        ? { includeTeamDeals: true }
        : teamId
          ? { teamId }
          : undefined
    );
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

  return (
    <DashboardLayout>
      <div className="min-h-full p-4 lg:p-6 space-y-6 bg-[#0b0b0b]">
        {dataError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-amber-200">
              Data temporarily unavailable
            </p>
            <p className="text-xs text-amber-200/70 mt-1">
              Check your connection and try again. Deals list is empty.
            </p>
          </div>
        )}
        {showDemoBanner && <DemoBanner />}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              All Deals
            </h1>
            <p className="text-sm text-[#8a8a8a]">
              Manage and track your deals pipeline
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <ExportButton
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8a8a8a] hover:text-white transition-colors bg-[#131313] border border-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              teamId={teamId}
              includeTeamDeals={scope === "all"}
            />
            <Link
              href="/deals/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-4 lg:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#8b1a1a] border border-[#1f1f1f]">
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
                  All Deals
                </p>
                <p className="text-[11px] text-[#5f5f5f]">Total deals</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{scopeDeals.length}</p>
            <p className="text-xs text-[#7d7d7d]">Active pipeline</p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-4 lg:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
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
                  Active
                </p>
                <p className="text-[11px] text-[#5f5f5f]">In progress</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {activeDeals.length}
            </p>
            <p className="text-xs text-[#22c55e]">Increasing</p>
          </div>

          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-4 lg:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
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
                <p className="text-[11px] text-[#5f5f5f]">Need attention</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {highRiskDeals.length}
            </p>
            <p className="text-xs text-[#7d7d7d]">Monitor closely</p>
          </div>

          <PipelineValueCard totalValue={totalValue} />
        </div>

        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 lg:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1a1a1a] pb-5">
            <h3 className="text-lg font-semibold text-white">Deal Pipeline</h3>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap max-md:gap-2">
              <Suspense fallback={<div className="h-8 w-24 bg-[#151515] rounded-xl animate-pulse" />}>
                <DealsScopeFilter currentScope={scope} />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-8 w-48 bg-[#151515] rounded-xl animate-pulse" />
                }
              >
                <DealsFilter currentFilter={filter} />
              </Suspense>
            </div>
          </div>

          {filteredDeals.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No deals yet
              </h3>
              <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
                Start tracking your revenue pipeline by creating your first
                deal.
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
      </div>
    </DashboardLayout>
  );
}
