import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getFounderRiskOverview } from "@/app/actions/deals";

export const dynamic = "force-dynamic";

export default async function FounderRiskOverviewPage() {
  noStore();
  const overview = await getFounderRiskOverview();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Risk Overview
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Deals</p>
            <p className="mt-2 text-3xl font-bold text-black dark:text-zinc-50">
              {overview.totalDeals}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              At-Risk Deals
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                overview.atRiskDealsCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-black dark:text-zinc-50"
              }`}
            >
              {overview.atRiskDealsCount}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Overdue Deals
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                overview.overdueDealsCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-black dark:text-zinc-50"
              }`}
            >
              {overview.overdueDealsCount}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              High Urgency
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                overview.highUrgencyDealsCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-black dark:text-zinc-50"
              }`}
            >
              {overview.highUrgencyDealsCount}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Overdue &gt; 3 Days
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                overview.dealsOverdueMoreThan3Days > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-black dark:text-zinc-50"
              }`}
            >
              {overview.dealsOverdueMoreThan3Days}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
            Most Critical Deals Right Now
          </h2>

          {overview.top3MostCriticalDeals.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No critical deals at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {overview.top3MostCriticalDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-lg font-semibold text-black dark:text-zinc-50">
                          {index + 1}. {deal.name}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            deal.riskLevel === "High"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : deal.riskLevel === "Medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {deal.riskLevel}
                        </span>
                        {deal.actionOverdueByDays !== null &&
                          deal.actionOverdueByDays > 0 && (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                              Overdue by {deal.actionOverdueByDays} day
                              {deal.actionOverdueByDays !== 1 ? "s" : ""}
                            </span>
                          )}
                      </div>

                      {deal.primaryRiskReason && (
                        <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Risk:</span>{" "}
                          {deal.primaryRiskReason}
                        </p>
                      )}

                      {deal.recommendedAction && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="font-medium">Action:</span>{" "}
                            {deal.recommendedAction.label}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              deal.recommendedAction.urgency === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : deal.recommendedAction.urgency === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {deal.recommendedAction.urgency}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/deals/${deal.id}`}
                      className="ml-4 text-sm font-medium text-black hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

