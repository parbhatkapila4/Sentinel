import Link from "next/link";
import { createDeal } from "@/app/actions/deals";
import { redirect } from "next/navigation";

export default function NewDealPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    await createDeal(formData);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
            Create New Deal
          </h1>

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Deal Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:border-white"
              />
            </div>

            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Stage
              </label>
              <input
                type="text"
                id="stage"
                name="stage"
                required
                placeholder="e.g., Discovery, Proposal, Negotiation"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:border-white"
              />
            </div>

            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Value ($)
              </label>
              <input
                type="number"
                id="value"
                name="value"
                required
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:border-white"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Create Deal
              </button>
              <Link
                href="/dashboard"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
