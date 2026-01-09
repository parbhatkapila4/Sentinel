import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  noStore();
  const deals = await getAllDeals();

  const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 };
  const sortedDeals = [...deals].sort((a, b) => {
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
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">All Deals</h1>
            <p className="text-sm text-white/40">
              Manage and track your deals pipeline
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
              New Deal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-violet-400/70 uppercase tracking-wider">
                All Deals
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-violet-400"
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
            </div>
            <p className="text-3xl font-bold text-white">{deals.length}</p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-emerald-400/70 uppercase tracking-wider">
                Active
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-emerald-400"
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
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {activeDeals.length}
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-amber-400/70 uppercase tracking-wider">
                At Risk
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-amber-400"
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
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {highRiskDeals.length}
            </p>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-blue-400/70 uppercase tracking-wider">
                Pipeline
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
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
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(totalValue / 1000).toFixed(0)}K
            </p>
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
            <h3 className="text-lg font-semibold text-white">Deal Pipeline</h3>
            <div className="flex items-center gap-2">
              {["All", "Active", "At Risk", "Closed"].map((filter, i) => (
                <button
                  key={filter}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    i === 0
                      ? "bg-violet-500/20 text-violet-400"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="p-16 text-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <svg
                  className="w-10 h-10 text-violet-400/50"
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
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Start tracking your revenue pipeline by creating your first
                deal.
              </p>
              <Link
                href="/deals/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
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
                Create Your First Deal
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Next Action
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeals.map((deal) => {
                    const riskLevel = formatRiskLevel(deal.riskScore);
                    return (
                      <tr
                        key={deal.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-violet-400"
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
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          ${deal.value.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {deal.stage}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              riskLevel === "High"
                                ? "bg-red-500/20 text-red-400"
                                : riskLevel === "Medium"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {deal.recommendedAction?.label || "No action needed"}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/40">
                          {formatDistanceToNow(new Date(deal.lastActivityAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
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
