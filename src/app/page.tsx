import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButtonWrapper } from "@/components/sign-in-button";
import { AnimatedSection } from "@/components/animated-section";
import { AnimatedNav } from "@/components/animated-nav";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-black">
      <AnimatedNav />

      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-50 via-white to-white dark:from-zinc-950 dark:via-black dark:to-black"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Real-time risk detection • Zero database triggers • 100%
              deterministic
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-7xl lg:text-8xl">
              Never Lose a Deal to
              <span className="block bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Silent Decay
              </span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              Real-time risk detection that tells you exactly which deals are
              dying—and what to do about it. Before it&apos;s too late.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link
                  href="/dashboard"
                  className="group relative overflow-hidden rounded-xl bg-black px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-black/50 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                >
                  <span className="relative z-10">Open Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-black opacity-0 transition-opacity group-hover:opacity-100 dark:from-zinc-200 dark:to-white"></div>
                </Link>
              ) : (
                <SignInButtonWrapper />
              )}
              <Link
                href="#how-it-works"
                className="rounded-xl border-2 border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-50 hover:scale-105 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection>
        <section className="border-y border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-20 dark:border-zinc-800 dark:from-zinc-950 dark:to-black">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <div className="group text-center transition-all duration-500 hover:scale-105">
                <div className="text-5xl font-bold text-black transition-colors duration-300 group-hover:text-red-600 dark:text-zinc-50 dark:group-hover:text-red-400">
                  100%
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Real-Time
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Risk calculated on every request
                </div>
              </div>
              <div className="group text-center transition-all duration-500 hover:scale-105">
                <div className="text-5xl font-bold text-black transition-colors duration-300 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                  &lt;1s
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Computation
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Instant risk score calculation
                </div>
              </div>
              <div className="group text-center transition-all duration-500 hover:scale-105">
                <div className="text-5xl font-bold text-black transition-colors duration-300 group-hover:text-green-600 dark:text-zinc-50 dark:group-hover:text-green-400">
                  0
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  DB Triggers
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Pure application logic
                </div>
              </div>
              <div className="group text-center transition-all duration-500 hover:scale-105">
                <div className="text-5xl font-bold text-black transition-colors duration-300 group-hover:text-purple-600 dark:text-zinc-50 dark:group-hover:text-purple-400">
                  100%
                </div>
                <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Deterministic
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  No AI, no randomness
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={100}>
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                The Problem: Silent Deal Decay
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Revenue teams lose deals to silent decay. Deals stall without
                visible warning signs, and by the time a CRM shows
                &quot;stale,&quot; the opportunity is often unrecoverable.
                Traditional CRMs track status changes but miss the absence of
                activity.
              </p>
              <div className="mt-10 rounded-2xl border-2 border-red-200 bg-red-50 p-8 transition-all duration-500 hover:border-red-300 hover:shadow-xl dark:border-red-900/50 dark:bg-red-950/20 dark:hover:border-red-800/50">
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-400">
                  What Happens Without Risk Detection
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-red-800 dark:text-red-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                    <span>
                      Deals go silent for weeks without anyone noticing
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                    <span>
                      By the time you realize a deal is dead, it&apos;s too late
                      to save it
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                    <span>
                      No visibility into which deals need immediate attention
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                    <span>
                      Revenue leaks away silently, quarter after quarter
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                The Solution: Real-Time Risk Intelligence
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Revenue Sentinel detects deal risk before it becomes revenue
                loss. Track activity, calculate risk in real-time, and get
                actionable recommendations to save at-risk deals.
              </p>
            </div>
            <div className="mt-16 rounded-2xl border-2 border-green-200 bg-green-50 p-8 dark:border-green-900/50 dark:bg-green-950/20">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-400">
                How Revenue Sentinel Solves This
              </h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-400">
                    Real-Time Risk Detection
                  </h4>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                    Risk scores calculated on every request from deal activity.
                    No stale data, always accurate.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-400">
                    Actionable Recommendations
                  </h4>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                    Get specific actions for each deal with urgency levels. Know
                    exactly what to do next.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-400">
                    Automatic Escalation
                  </h4>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                    When actions become overdue, urgency escalates and risk
                    increases. Neglected deals become impossible to ignore.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-400">
                    Founder-Level Visibility
                  </h4>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                    Executive dashboard showing total risk, overdue deals, and
                    top 3 most critical deals requiring immediate attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Complete Deal Risk Management
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Everything you need to track deals, detect risk, and take action
                before it&apos;s too late.
              </p>
            </div>

            <div className="mt-20 grid gap-8 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-red-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-red-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-red-900/20">
                    <svg
                      className="h-7 w-7 text-red-600 transition-colors duration-300 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Real-Time Risk Detection
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Risk scores calculated on every request from deal activity.
                    Action-based model rewards engagement and penalizes silence.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Risk Scores:
                        </strong>{" "}
                        0.0 (safe) to 1.0 (critical) with Low/Medium/High
                        classification
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Status:
                        </strong>{" "}
                        &quot;active&quot; or &quot;at_risk&quot; automatically
                        derived from score
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Risk Aging:
                        </strong>{" "}
                        Track when deals first became at-risk and days since
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Deterministic:
                        </strong>{" "}
                        No AI, no randomness—pure calculation from activity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-yellow-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-yellow-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-yellow-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-yellow-900/20">
                    <svg
                      className="h-7 w-7 text-yellow-600 transition-colors duration-300 group-hover:text-yellow-700 dark:text-yellow-400 dark:group-hover:text-yellow-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Actionable Recommendations
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Get specific actions for each deal with urgency levels. Know
                    exactly what to do next, prioritized by risk.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Automatic:
                        </strong>{" "}
                        Recommendations generated from primary risk reason
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Urgency Levels:
                        </strong>{" "}
                        High (1 day SLA), Medium (3 days), Low (7 days)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Actions:
                        </strong>{" "}
                        &quot;Send follow-up email&quot;, &quot;Nudge for
                        response&quot;, &quot;Review deal details&quot;
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Primary Reason:
                        </strong>{" "}
                        Clear explanation of why each deal is at risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-blue-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-blue-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-900/20">
                    <svg
                      className="h-7 w-7 text-blue-600 transition-colors duration-300 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Action SLA & Escalation
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Track when actions become overdue. Automatic escalation
                    ensures critical deals never fall through cracks.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          SLA Deadlines:
                        </strong>{" "}
                        High (1 day), Medium (3 days), Low (7 days) from risk
                        start
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Overdue Tracking:
                        </strong>{" "}
                        Days overdue calculated automatically
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Urgency Escalation:
                        </strong>{" "}
                        Medium→High, Low→Medium when overdue
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Risk Escalation:
                        </strong>{" "}
                        +0.1 risk per 2 days overdue (capped at 1.0)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-purple-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-purple-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-purple-900/20">
                    <svg
                      className="h-7 w-7 text-purple-600 transition-colors duration-300 group-hover:text-purple-700 dark:text-purple-400 dark:group-hover:text-purple-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Founder Dashboard
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Executive overview of deal risk across your entire pipeline.
                    See the big picture at a glance.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Metrics:
                        </strong>{" "}
                        Total deals, at-risk count, overdue count, high urgency
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Critical Deals:
                        </strong>{" "}
                        Top 3 most urgent (sorted by overdue, risk score)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Overdue Tracking:
                        </strong>{" "}
                        Deals overdue more than 3 days highlighted
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          One Screen:
                        </strong>{" "}
                        Know if things are bad in 5 seconds
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-green-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-green-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-green-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-green-900/20">
                    <svg
                      className="h-7 w-7 text-green-600 transition-colors duration-300 group-hover:text-green-700 dark:text-green-400 dark:group-hover:text-green-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Daily Action Queue
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Prioritized list organized by urgency. Know exactly what to
                    focus on today.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Urgent:
                        </strong>{" "}
                        At-risk + (overdue OR high urgency) - max 5 deals
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Important:
                        </strong>{" "}
                        At-risk but not overdue - max 5 deals
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Safe:
                        </strong>{" "}
                        Active deals sorted by stage priority - max 5
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Sorted:
                        </strong>{" "}
                        By urgency, overdue days, then risk score
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-30 blur-3xl transition-opacity group-hover:opacity-50 dark:bg-indigo-900/30"></div>
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-xl bg-indigo-100 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-indigo-900/20">
                    <svg
                      className="h-7 w-7 text-indigo-600 transition-colors duration-300 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300"
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
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                    Activity Timeline
                  </h3>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                    Complete audit trail of all deal activity. Track emails,
                    meetings, and stage changes in chronological order.
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Event Types:
                        </strong>{" "}
                        Email sent, email received, meeting held, stage changes
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Immutable:
                        </strong>{" "}
                        Complete chronological history of all activity
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Last Activity:
                        </strong>{" "}
                        Automatically calculated from human engagement events
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"></span>
                      <span>
                        <strong className="text-black dark:text-zinc-50">
                          Metadata:
                        </strong>{" "}
                        JSON payload for extensibility and custom event data
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <section
          id="how-it-works"
          className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                  How Risk Calculation Works
                </h2>
                <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                  Deterministic, action-based model. No AI, no black boxes.
                  Every score is calculated from your deal activity data.
                </p>
              </div>

              <div className="mt-16 space-y-8">
                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Track Deal Activity
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Record every interaction: emails sent, emails received,
                        meetings held. Each event is timestamped and stored in
                        an immutable timeline. Only human engagement events
                        (email_sent, email_received, meeting_held) count toward
                        activity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Calculate Baseline Risk
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Each deal starts with baseline risk based on stage:
                        Negotiation (+0.3), Discovery (+0.1), or other stages
                        (0.0). This reflects the inherent risk of each stage in
                        the sales process.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Apply Risk Reducers (Rewards)
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Recent activity reduces risk: Email sent within 5 days
                        (-0.2), Email received within 5 days (-0.3), Meeting
                        held within 7 days (-0.4). This rewards active
                        engagement and reduces risk for deals with recent
                        communication.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Apply Risk Increases (Penalties)
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Penalties apply for: No activity in 7+ days (+0.4),
                        Negotiation stage without email activity (+0.4), High
                        value deals &gt;$5,000 (+0.2). These reflect warning
                        signs that require attention.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Calculate Final Score & Status
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Risk score is clamped to 0.0-1.0. Status is
                        &quot;at_risk&quot; if score ≥ 0.6, else
                        &quot;active&quot;. Risk level: Low (&lt;0.4), Medium
                        (0.4-0.6), High (≥0.6). All calculations happen in
                        real-time on every request.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <div className="flex items-start gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                      6
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-zinc-50">
                        Generate Recommendations & Track SLA
                      </h3>
                      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                        Based on primary risk reason, generate recommended
                        action with urgency. Calculate action due date (1/3/7
                        days from risk start). Track overdue status and escalate
                        urgency/risk when overdue. All derived from timeline
                        events—nothing persisted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Risk Calculation Model
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Complete breakdown of how risk scores are calculated.
              </p>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Baseline Risk (by Stage)
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Negotiation:</span>
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                        +0.3
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discovery:</span>
                      <span className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">
                        +0.1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other stages:</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        0.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Risk Reducers (Recent Activity)
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Email sent (≤5 days):</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        -0.2
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email received (≤5 days):</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        -0.3
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meeting held (≤7 days):</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        -0.4
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Risk Increases (Penalties)
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>No activity (7+ days):</span>
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                        +0.4
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negotiation stalled:</span>
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                        +0.4
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>High value (&gt;$5k):</span>
                      <span className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">
                        +0.2
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Final Calculation
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Score range:</span>
                      <span className="font-mono font-semibold">0.0 - 1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>At-risk threshold:</span>
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                        ≥ 0.6
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk levels:</span>
                      <span className="font-mono font-semibold">
                        Low/Med/High
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={600}>
        <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Technical Architecture
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Built for reliability, performance, and maintainability.
              </p>

              <div className="mt-12 space-y-6">
                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Stack
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL,
                    Clerk Authentication, Tailwind CSS
                  </p>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Risk Calculation
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Single source of truth in{" "}
                    <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono dark:bg-zinc-800">
                      calculateDealSignals()
                    </code>
                    . No database persistence—all risk fields derived on every
                    request. Uses{" "}
                    <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono dark:bg-zinc-800">
                      noStore()
                    </code>{" "}
                    to prevent caching.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Data Model
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Deals, DealEvents, DealTimeline—all user-scoped with
                    multi-tenant isolation. DealTimeline is the single source of
                    truth for activity. No triggers, no functions—pure
                    application logic.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-zinc-200 bg-white p-6 transition-all duration-500 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    Security
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    All database queries scoped by authenticated user ID. Server
                    actions verify authentication before any database access.
                    Cross-tenant data access architecturally impossible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={700}>
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Ready to Stop Losing Deals?
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Start detecting risk before it becomes revenue loss. Get
                actionable recommendations and never let a deal die in silence
                again.
              </p>
              <div className="mt-10">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="group relative overflow-hidden rounded-xl bg-black px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-black/50 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                  >
                    <span className="relative z-10">Open Dashboard</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-black opacity-0 transition-opacity group-hover:opacity-100 dark:from-zinc-200 dark:to-white"></div>
                  </Link>
                ) : (
                  <SignInButtonWrapper />
                )}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <footer className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-black dark:bg-white"></div>
              <div>
                <div className="font-semibold text-black dark:text-zinc-50">
                  Revenue Sentinel
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  Deal Risk Intelligence Platform
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-500 sm:text-left">
              <p>Built for founders who refuse to lose deals to silence.</p>
              <p className="mt-1">
                Real-time risk detection • Actionable insights • Zero database
                triggers
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
