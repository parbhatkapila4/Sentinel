import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButtonWrapper } from "@/components/sign-in-button";
import { UserButtonWrapper } from "@/components/user-button";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-black to-zinc-800 dark:from-white dark:to-zinc-200"></div>
              <span className="text-xl font-bold text-black dark:text-zinc-50">
                Revenue Sentinel
              </span>
            </div>
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    href="/founder"
                    className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Dashboard
                  </Link>
                  <UserButtonWrapper />
                </>
              ) : (
                <SignInButtonWrapper />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl lg:text-7xl">
              Never Lose a Deal to
              <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Silent Decay
              </span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              Real-time risk detection that tells you exactly which deals are
              dying—and what to do about it. Before it's too late.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-black px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                >
                  Open Dashboard
                </Link>
              ) : (
                <SignInButtonWrapper />
              )}
              <Link
                href="#features"
                className="rounded-lg border-2 border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-black dark:text-zinc-50">
                100%
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Real-Time Risk Calculation
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                No stale data, always accurate
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black dark:text-zinc-50">
                &lt;1s
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Risk Score Computation
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Calculated on every request
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black dark:text-zinc-50">
                0
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Database Triggers
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Pure application logic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
              Everything You Need to Protect Revenue
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              A complete deal risk management system built for founders who
              refuse to lose deals to silence.
            </p>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-100 opacity-20 blur-3xl dark:bg-red-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Real-Time Risk Detection
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Risk scores calculated on every request from deal activity.
                  Action-based model rewards engagement and penalizes silence.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Risk scores 0.0-1.0 with Low/Medium/High levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Status: "active" or "at_risk" derived from score</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Risk aging: track when deals became at-risk</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-yellow-100 opacity-20 blur-3xl dark:bg-yellow-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
                  <svg
                    className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Actionable Recommendations
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Get specific actions for each deal with urgency levels. Know
                  exactly what to do next, prioritized by risk.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Automatic recommendations from risk analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Urgency: high (1 day), medium (3 days), low (7 days)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Primary risk reason for each deal</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-100 opacity-20 blur-3xl dark:bg-blue-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Action SLA Tracking
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Track when actions become overdue. Automatic escalation ensures
                  critical deals never fall through cracks.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Overdue tracking with days overdue calculation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Automatic urgency escalation when overdue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Risk increases: +0.1 per 2 days overdue</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-100 opacity-20 blur-3xl dark:bg-purple-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-3.75v3.75m-3-3.75h3.75"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Founder Dashboard
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Executive overview of deal risk. See total deals, at-risk
                  count, overdue deals, and top 3 most critical deals.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Risk metrics: at-risk, overdue, high urgency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Top 3 critical deals sorted by urgency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Deals overdue more than 3 days</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-green-100 opacity-20 blur-3xl dark:bg-green-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25l2.25-2.25m0 0l2.25 2.25M10.5 6.75v3.75"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Daily Action Queue
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Prioritized list organized by urgency. Know exactly what to
                  focus on today: urgent, important, or safe.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Urgent: at-risk + (overdue OR high urgency)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Important: at-risk but not overdue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Safe: active deals sorted by stage priority</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-20 blur-3xl dark:bg-indigo-900/20"></div>
              <div className="relative">
                <div className="mb-6 inline-flex rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/20">
                  <svg
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                  Activity Timeline
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Complete audit trail of all deal activity. Track emails,
                  meetings, and stage changes in chronological order.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Record emails sent, received, meetings held</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Immutable timeline of all events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                    <span>Automatic last activity calculation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                How Risk Calculation Works
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Deterministic, action-based model. No AI, no black boxes. Every
                score is calculated from your deal activity.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  Baseline Risk
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Each deal starts with baseline risk: Negotiation (+0.3),
                  Discovery (+0.1), or other stages (0.0).
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  Risk Reducers
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Recent activity reduces risk: Email sent (-0.2), Email received
                  (-0.3), Meeting held (-0.4). Activity must be within 5-7 days.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  Risk Increases
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Penalties: No activity 7+ days (+0.4), Negotiation stalled
                  (+0.4), High value &gt;$5k (+0.2).
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  Final Score
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Clamped to 0.0-1.0. Status: "at_risk" if ≥0.6, else "active".
                  Risk level: Low (&lt;0.4), Medium (0.4-0.6), High (≥0.6).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
              Ready to Stop Losing Deals?
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Start detecting risk before it becomes revenue loss. Get actionable
              recommendations and never let a deal die in silence again.
            </p>
            <div className="mt-10">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-lg bg-black px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                >
                  Open Dashboard
                </Link>
              ) : (
                <SignInButtonWrapper />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-black dark:bg-white"></div>
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Revenue Sentinel
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Deal risk management for revenue teams
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
