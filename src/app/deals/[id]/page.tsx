import Link from "next/link";
import { getDealById } from "@/app/actions/deals";
import { createDealEvent } from "@/app/actions/events";
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
  } catch (error) {
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
      </div>
    </div>
  );
}
