import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function FeaturesPage() {
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

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Features
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Everything you need to never lose a deal to silent decay. Revenue
            Sentinel gives you the visibility and intelligence to act before
            deals stall.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Pipeline Management
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Track every deal through your entire sales process. From initial
              discovery to closed-won, see exactly where each deal stands and
              what needs attention.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Five-stage pipeline: Discovery → Qualification → Proposal →
                  Negotiation → Closed
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Real-time pipeline value calculation across all stages
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Automated status tracking and stage transitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Customizable pipeline to match your sales process</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Risk Detection
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Our algorithm continuously monitors deal activity and identifies
              at-risk deals before they stall. Get alerts when deals need
              attention, not after they&apos;re already lost.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Automated risk scoring: Low, Medium, and High classifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Activity pattern analysis to detect silent deal decay
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Stage duration analysis with stage-specific risk thresholds
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  High-value deal prioritization with weighted risk factors
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Activity Tracking
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Complete visibility into every interaction with your deals. Track
              emails, meetings, calls, and custom events with a full audit
              trail.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Email sent and received tracking with metadata</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Meeting and call event logging with timestamps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Custom events with extensible JSON metadata</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Automatic lastActivityAt updates for all deals</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Timeline & Audit Trail
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Immutable chronological timeline of all deal interactions. Every
              event is permanently recorded with complete metadata for
              compliance and forensic analysis.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Chronological event view with UUID-based identifiers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Complete metadata preservation for compliance and analysis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Timezone-aware timestamp handling for global operations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Optimized queries for sub-100ms response times</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Action Recommendations
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Don&apos;t just know which deals are at risk, know exactly what to
              do about it. Get personalized, actionable recommendations for
              every at-risk deal.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Personalized action recommendations for each at-risk deal
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Urgency classification: high, medium, and low priority
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Action due dates with automatic overdue tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Context-aware strategies based on deal characteristics
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Analytics & Reports
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Understand your pipeline performance with comprehensive analytics.
              See revenue trends, risk distribution, and deal health metrics at
              a glance.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Pipeline value analytics with stage-by-stage breakdown
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Monthly revenue trends with growth rate calculations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Risk distribution and deal health overview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Exportable reports for stakeholders</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              AI Assistant
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Get instant answers to your questions about deal management, risk
              analysis, and sales strategy. Our AI assistant is always available
              to help.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal management and risk analysis guidance on demand
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Sales strategy recommendations and best practices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Tips for deal follow-ups and client engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Real-time answers to platform questions</span>
              </li>
            </ul>
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
                  href="/pricing"
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white mb-4">
                Login Required
              </h2>
              <p className="text-white/60 mb-8">
                Please log in first to access the dashboard and start managing your deals.
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
