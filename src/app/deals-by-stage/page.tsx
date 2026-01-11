import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

export default async function DealsByStagePage() {
  noStore();
  const deals = await getAllDeals();

  const stageGroups = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = [];
    }
    acc[deal.stage].push(deal);
    return acc;
  }, {} as Record<string, typeof deals>);

  const stageConfig: Record<
    string,
    { order: number; color: string; bgColor: string; borderColor: string }
  > = {
    discover: {
      order: 1,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    qualify: {
      order: 2,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    proposal: {
      order: 3,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    negotiation: {
      order: 4,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    closed: {
      order: 5,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  };

  const sortedStages = Object.keys(stageGroups).sort((a, b) => {
    const orderA = stageConfig[a.toLowerCase()]?.order ?? 99;
    const orderB = stageConfig[b.toLowerCase()]?.order ?? 99;
    return orderA - orderB;
  });

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Deals by Stage
            </h1>
            <p className="text-sm text-white/40">
              Visualize your pipeline across different stages
            </p>
          </div>
          <Link
            href="/deals/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <p className="text-sm text-white/40 mb-2">
              Total Deals in Pipeline
            </p>
            <p className="text-3xl font-bold text-white">{totalDeals}</p>
          </div>
          <div
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <p className="text-sm text-white/40 mb-2">Total Pipeline Value</p>
            <p className="text-3xl font-bold text-white">
              ${totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        {deals.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
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
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No deals yet</h3>
            <p className="text-white/40 mb-8">
              Create deals to see them organized by stage.
            </p>
            <Link
              href="/deals/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white"
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
              Create First Deal
            </Link>
          </div>
        ) : (
          <>
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Pipeline Distribution
              </h3>
              <div className="h-4 rounded-full bg-white/5 overflow-hidden flex">
                {sortedStages.map((stage) => {
                  const count = stageGroups[stage].length;
                  const percentage = (count / totalDeals) * 100;
                  const config = stageConfig[stage.toLowerCase()] || {
                    color: "text-white/60",
                    bgColor: "bg-white/10",
                  };
                  return (
                    <div
                      key={stage}
                      className={`h-full ${config.bgColor.replace(
                        "/10",
                        "/50"
                      )}`}
                      style={{ width: `${percentage}%` }}
                      title={`${stage}: ${count} deals (${percentage.toFixed(
                        1
                      )}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {sortedStages.map((stage) => {
                  const config = stageConfig[stage.toLowerCase()] || {
                    color: "text-white/60",
                    bgColor: "bg-white/10",
                  };
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${config.bgColor.replace(
                          "/10",
                          "/50"
                        )}`}
                      />
                      <span className="text-sm text-white/60">{stage}</span>
                      <span className="text-sm text-white/30">
                        ({stageGroups[stage].length})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  sortedStages.length,
                  4
                )}, 1fr)`,
              }}
            >
              {sortedStages.map((stage) => {
                const stageDeals = stageGroups[stage];
                const stageValue = stageDeals.reduce(
                  (sum, d) => sum + d.value,
                  0
                );
                const config = stageConfig[stage.toLowerCase()] || {
                  color: "text-white/60",
                  bgColor: "bg-white/10",
                  borderColor: "border-white/10",
                };

                return (
                  <div
                    key={stage}
                    className={`rounded-2xl border ${config.borderColor}`}
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    }}
                  >
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-base font-semibold ${config.color}`}
                        >
                          {stage}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-lg ${config.bgColor} ${config.color}`}
                        >
                          {stageDeals.length}
                        </span>
                      </div>
                      <p className="text-sm text-white/40">
                        ${stageValue.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                      {stageDeals.map((deal) => {
                        const riskLevel = formatRiskLevel(deal.riskScore);
                        return (
                          <Link
                            key={deal.id}
                            href={`/deals/${deal.id}`}
                            className="block p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                          >
                            <p className="text-sm font-medium text-white truncate mb-1">
                              {deal.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/40">
                                ${deal.value.toLocaleString()}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  riskLevel === "High"
                                    ? "bg-red-500/20 text-red-400"
                                    : riskLevel === "Medium"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}
                              >
                                {riskLevel}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
