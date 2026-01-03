import Link from "next/link";
import { getDealById } from "@/app/actions/deals";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { AddEventButtons } from "./add-event-buttons";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let deal;
  try {
    deal = await getDealById(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-4 text-3xl font-semibold text-black dark:text-zinc-50">
            {deal.name}
          </h1>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Stage</p>
              <p className="text-lg font-medium text-black dark:text-zinc-50">
                {deal.stage}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Value</p>
              <p className="text-lg font-medium text-black dark:text-zinc-50">
                ${deal.value.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Status</p>
              <p className="text-lg font-medium text-black dark:text-zinc-50">
                {deal.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Last Activity
              </p>
              <p className="text-lg font-medium text-black dark:text-zinc-50">
                {formatDistanceToNow(new Date(deal.lastActivityAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Risk Assessment
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Risk Score
              </p>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                  {(deal.riskScore * 100).toFixed(0)}%
                </p>
                {deal.riskLevel && (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      deal.riskLevel === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : deal.riskLevel === "Medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {deal.riskLevel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {deal.nextAction && deal.nextActionReason && (
          <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6 shadow dark:border-blue-800 dark:bg-blue-900/20">
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
              Next Action
            </h2>
            <p className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-200">
              {deal.nextAction === "send_follow_up_email"
                ? "Send Follow-up Email"
                : deal.nextAction === "schedule_meeting"
                ? "Schedule Meeting"
                : deal.nextAction === "escalate"
                ? "Escalate"
                : "Wait"}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {deal.nextActionReason}
            </p>
          </div>
        )}

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Events
            </h2>
            <AddEventButtons dealId={deal.id} />
          </div>

          {deal.events.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              No events recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {deal.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-zinc-50">
                        {event.type.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDistanceToNow(new Date(event.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {Object.keys(event.payload as Record<string, unknown>)
                        .length > 0 && (
                        <pre className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            Timeline
          </h2>
          {deal.timeline && deal.timeline.length > 0 ? (
            <div className="space-y-3">
              {deal.timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-800"
                >
                  <p className="text-sm text-zinc-900 dark:text-zinc-50">
                    {entry.eventType === "risk_evaluated"
                      ? `Risk evaluated: ${
                          ((entry.metadata as Record<string, unknown>)
                            ?.score as number) * 100
                        }%`
                      : entry.eventType === "event_created"
                      ? `Event recorded: ${
                          ((entry.metadata as Record<string, unknown>)
                            ?.eventType as string) || ""
                        }`
                      : entry.eventType === "stage_changed"
                      ? `Stage changed to ${
                          ((entry.metadata as Record<string, unknown>)
                            ?.stage as string) || ""
                        }`
                      : entry.eventType}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              No timeline entries yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
