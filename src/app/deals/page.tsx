import Link from "next/link";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportButton } from "@/components/export-button";
import { DealsFilter } from "@/components/deals-filter";
import { PipelineValueCard } from "@/components/pipeline-value-card";

export const dynamic = "force-dynamic";

type FilterType = "all" | "active" | "at-risk" | "closed";

function filterDeals(
  deals: Awaited<ReturnType<typeof getAllDeals>>,
  filter: FilterType
) {
  switch (filter) {
    case "all":
      return deals;
    case "active":
      return deals.filter((deal) => deal.status === "active");
    case "at-risk":
      return deals.filter((deal) => formatRiskLevel(deal.riskScore) === "High");
    case "closed":
      return deals.filter(
        (deal) => deal.status === "saved" || deal.status === "lost"
      );
    default:
      return deals;
  }
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  noStore();
  const deals = await getAllDeals();
  const params = await searchParams;
  const filter = (params?.filter || "all") as FilterType;
  const filteredDeals = filterDeals(deals, filter);

  const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 };
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const aUrgency = a.recommendedAction?.urgency || "none";
    const bUrgency = b.recommendedAction?.urgency || "none";
    const urgencyDiff = urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.riskScore - a.riskScore;
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const highRiskDeals = deals.filter(
    (deal) => formatRiskLevel(deal.riskScore) === "High"
  );
  const activeDeals = deals.filter(
    (deal) => deal.status === "active" || deal.status === "Active"
  );

  return (
    <DashboardLayout>
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">All Deals</h1>
            <p className="text-sm text-[#8a8a8a]">
              Manage and track your deals pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8a8a8a] hover:text-white transition-colors bg-[#131313] border border-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed" />
            <Link
              href="/deals/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-[#d51024] hover:bg-[#b80e1f]"
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

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#8b5cf6] border border-[#1f1f1f]">
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
            <p className="text-3xl font-bold text-white mb-1">{deals.length}</p>
            <p className="text-xs text-[#7d7d7d]">Active pipeline</p>
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

        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-5">
            <h3 className="text-lg font-semibold text-white">Deal Pipeline</h3>
            <Suspense
              fallback={
                <div className="h-8 w-48 bg-[#151515] rounded-xl animate-pulse" />
              }
            >
              <DealsFilter currentFilter={filter} />
            </Suspense>
          </div>

          {filteredDeals.length === 0 ? (
            <div className="p-16 text-center">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Next Action
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeals.map((deal) => {
                    const riskLevel = formatRiskLevel(deal.riskScore);
                    return (
                      <tr
                        key={deal.id}
                        className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#151515] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#1f1f1f] flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-[#8b5cf6]"
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
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-white">
                            ${deal.value.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#8a8a8a]">
                            {deal.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              riskLevel === "High"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : riskLevel === "Medium"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#8a8a8a]">
                            {deal.recommendedAction?.label ||
                              "No action needed"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#8a8a8a]">
                            {formatDistanceToNow(
                              new Date(deal.lastActivityAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="text-sm text-[#8b5cf6] hover:text-[#7c3aed] transition-colors font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
