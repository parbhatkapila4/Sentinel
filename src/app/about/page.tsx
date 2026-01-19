import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function AboutPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors -ml-76"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>


      <section className="py-20 px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About Sentinel
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Proactive revenue management for teams who refuse to lose deals to
            silent decay
          </p>
        </div>
      </section>


      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            What is Sentinel?
          </h2>
          <div className="space-y-4 text-lg text-white/70 leading-relaxed">
            <p>
              Sentinel is a modern revenue management platform designed
              to help sales and revenue teams proactively manage their pipeline
              and prevent deals from going cold. Unlike traditional CRMs that
              focus on historical data, Sentinel provides real-time
              insights into your pipeline health, identifies at-risk deals
              early, and gives you the intelligence you need to act before
              opportunities slip away.
            </p>
            <p>
              Our platform combines AI-powered risk analysis with intuitive
              pipeline management tools, giving you visibility into every deal
              and actionable recommendations to keep your pipeline healthy and
              moving forward.
            </p>
          </div>
        </div>
      </section>


      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            The Problem We Solve
          </h2>
          <div className="space-y-4 text-lg text-white/70 leading-relaxed">
            <p>
              Revenue teams lose deals every single day not because the product
              is wrong or the price is too high, but because they don&apos;t see
              the warning signs until it&apos;s too late. This phenomenon, known
              as &quot;silent decay,&quot; happens when deals gradually lose
              momentum without anyone noticing.
            </p>
            <p>
              Traditional CRMs are reactive. They tell you what happened
              yesterday, last week, or last month. By the time you see a deal
              has stalled, the relationship may have already cooled, the
              decision-maker has moved on, or a competitor has stepped in.
            </p>
            <p>
              Sentinel changes that. We give you real-time visibility
              into your pipeline health, identify risks before they become
              problems, and provide actionable insights to help you intervene at
              the right moment.
            </p>
          </div>
        </div>
      </section>


      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why Sentinel?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  Proactive Risk Detection
                </h3>
              </div>
              <p className="text-white/70">
                Identify at-risk deals before they stall. Our AI analyzes
                patterns and flags potential issues early, giving you time to
                act.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  Real-Time Insights
                </h3>
              </div>
              <p className="text-white/70">
                Get instant visibility into your pipeline health. Know exactly
                which deals need attention, right now.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  Intelligent Pipeline Management
                </h3>
              </div>
              <p className="text-white/70">
                Track your entire pipeline with precision. Understand deal
                velocity, stage progression, and pipeline health at a glance.
              </p>
            </div>

            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-white">
                  Actionable Intelligence
                </h3>
              </div>
              <p className="text-white/70">
                Every insight comes with clear recommendations. Know not just
                what&apos;s wrong, but what to do about it.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <div className="space-y-4 text-lg text-white/70 leading-relaxed">
            <p>
              Sentinel exists to solve a real problem: the silent
              decay of deals that could have been won. We&apos;re committed to
              building tools that genuinely help revenue teams succeed, not just
              track what&apos;s already happened.
            </p>
            <p>
              Behind every deal is a real opportunity, a real relationship, and
              a real impact on your business. That&apos;s why we built
              Sentinel to ensure those opportunities don&apos;t slip away
              unnoticed.
            </p>
            <p>
              We believe revenue professionals deserve better tools. Tools that
              help them win, not just report on what they&apos;ve already done.
              Tools that give them the intelligence they need to make decisions
              that drive real results.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-white/10">
            <div className="space-y-4 text-base text-white/70 leading-relaxed">
              <p>
                I built Sentinel because I was tired of watching revenue
                teams lose deals they never saw coming. Too many times, I&apos;ve
                seen promising opportunities fade away silently not because the
                product was wrong, but simply because no one noticed the warning
                signs until it was too late.
              </p>

              <p>
                This platform was born from a simple idea: what if you could see
                which deals are at risk before they actually fail? What if you
                had real-time visibility into your pipeline health? What if your
                tools actually helped you prevent problems instead of just
                reporting them?
              </p>

              <p>
                I&apos;m constantly improving Sentinel based on feedback
                from revenue professionals. If you have ideas or suggestions, I&apos;d
                love to hear from you at{" "}
                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  parbhat@parbhat.dev
                </a>
                .
              </p>

              <p className="pt-2 text-white/60 text-sm">
                - Parbhat Kapila, the creator of Sentinel
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          {user ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-white/60 mb-8">
                Join revenue teams using Sentinel to proactively manage
                deals and prevent silent decay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/features"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  View Features
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Login Required
              </h2>
              <p className="text-white/60 mb-8">
                Please log in first to access the dashboard and start managing
                your deals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-in"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
