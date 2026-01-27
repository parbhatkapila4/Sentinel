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
              Predictive Risk Detection
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Our advanced algorithm continuously monitors deal activity and identifies
              at-risk deals before they stall. Get alerts when deals need
              attention, not after they&apos;re already lost. Multiple risk factors
              combine into a comprehensive risk score.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Automated risk scoring: Composite 0-1 score with Low, Medium, and High classifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Temporal decay: Weighted risk from time since last activity with configurable thresholds
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Stage velocity analysis: Time-in-stage vs. historical norms with bottleneck detection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Engagement scoring: Human touchpoints (emails, meetings, calls) tracked with drop-off alerts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Competitive signals: High-value and negotiation-stage deals weighted for priority
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Risk reason strings explaining why each deal is at risk
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Real-time risk updates as deals move through the pipeline
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
              a glance. Make data-driven decisions with visual dashboards and detailed reports.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Pipeline value analytics with stage-by-stage breakdown and total pipeline value
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Monthly revenue trends with growth rate calculations and forecasting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Risk distribution charts showing Low/Medium/High risk deal counts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal health metrics: Win probability, activity scores, and engagement rates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Top deals by value, risk, and performance with ranking
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Customer analytics: Geographic distribution and country-based insights
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Exportable reports in CSV/JSON format for external analysis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Pipeline forecast charts with predictive analytics
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Intelligent AI Assistant
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Get instant answers to your questions about deal management, risk
              analysis, and sales strategy. Our multi-model AI router intelligently
              selects the best AI model for each query type.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Natural language queries: &quot;Which deals need my attention today?&quot;
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Multi-model routing: GPT-4 Turbo, Claude 3.5, GPT-4o, Gemini Pro
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Specialized models for semantic search, financial analysis, and code queries
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Chat history with folder organization and persistent conversations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal-specific insights and pipeline health analysis
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Team Collaboration & Workspaces
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Work seamlessly with your team using role-based access control,
              shared workspaces, and collaborative deal management.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Role-based access control (RBAC): Owner, Admin, Member, Viewer roles
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Team workspaces with unique slugs and customizable team names
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Email-based team invitations with role assignment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Team-scoped deal access and assignment to team members
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Shared webhooks and integrations at team level
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Team member management with role updates and removal
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              CRM Integrations
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Sync your existing CRM data seamlessly. Import deals, contacts, and
              opportunities from Salesforce and HubSpot with automatic stage mapping.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  <strong>Salesforce Integration:</strong> Import opportunities as deals with automatic stage mapping
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  <strong>HubSpot Integration:</strong> Sync deals and contacts with portal detection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Automatic stage mapping from CRM stages to Sentinel pipeline stages
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal deduplication using external IDs to prevent duplicates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Auto-sync every 6 hours via cron job or manual on-demand sync
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Complete activity logging and error handling with detailed sync history
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Source tracking: Synced deals tagged with CRM source badges
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Google Calendar Integration
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Automatically sync meetings and calendar events, intelligently linking
              them to your deals for complete visibility.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Automatic event sync for the next 30 days from your calendar
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Intelligent auto-linking: Matches meetings to deals by title, attendees, or description
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Create meetings directly for deals with full calendar integration
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Dashboard widget showing upcoming meetings at a glance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal detail pages showing all linked meetings with timestamps
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Link and unlink meetings manually for complete control
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Slack Integration
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Receive real-time deal notifications directly in your Slack channels.
              Stay informed about at-risk deals, stage changes, and important updates.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Multiple Slack webhook support for different channels
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Event filtering: Choose which events trigger notifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Rich message formatting with deal details and direct links
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Test messages to verify webhook configuration before saving
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Team-level and user-level Slack integrations
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Webhooks & API Integration
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Build custom integrations with our comprehensive webhook system and
              RESTful API. Receive real-time events and programmatically manage your pipeline.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Configurable webhook endpoints with HMAC-SHA256 signature verification
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Event types: deal.created, deal.updated, deal.stage_changed, deal.at_risk, deal.closed_won, deal.closed_lost
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Team events: team.member_added, team.member_removed
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Webhook delivery tracking with retry logic and status monitoring
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Full REST API with OpenAPI documentation and interactive API explorer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal search, export, and programmatic management endpoints
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Notifications System
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Never miss a critical update. Get notified in-app and via email when
              deals need attention, actions are overdue, or important events occur.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  In-app notifications with real-time updates and read/unread status
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Email alerts for deal at risk, action overdue, and stage changes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Customizable notification preferences per user
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Weekly digest emails with pipeline summary and key metrics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Mark all as read functionality and notification history
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Risk Settings & Configuration
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Customize risk detection thresholds and competitive signal preferences
              to match your sales process and business requirements.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Configurable inactivity threshold (default: 7 days) for risk detection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Enable/disable competitive signals for high-value deals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Stage-specific risk thresholds based on historical norms
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Temporal decay weighting with configurable time-based risk factors
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Deal Search & Filtering
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Quickly find the deals you need with powerful search and filtering
              capabilities across all deal attributes and metadata.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Full-text search across deal names, companies, and descriptions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Filter by stage, risk level, status, assigned team member, and value range
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Sort by value, risk score, last activity, creation date, and more
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Scope filtering: My deals vs. All team deals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  API endpoint for programmatic deal search and filtering
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Export & Reporting
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Export your data for external analysis, stakeholder reports, and
              integration with other tools. Generate comprehensive reports on demand.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Deal export to CSV/JSON with all deal attributes and metadata
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Report export with pipeline analytics, risk distribution, and revenue trends
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Filtered exports based on current search and filter criteria
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  API endpoints for programmatic data export and reporting
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Command Palette & Navigation
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Navigate quickly and efficiently with keyboard shortcuts and a powerful
              command palette that puts every feature at your fingertips.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Global command palette (Cmd/Ctrl + K) for instant navigation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Quick actions: Create deal, search, navigate to pages, open settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Keyboard shortcuts throughout the application for power users
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Recent pages and quick access to frequently used features
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Meeting Management
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Manage meetings directly within deals. Create, link, and track all
              customer meetings with full calendar integration.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Create meetings for deals with title, time, attendees, and location
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Link existing calendar events to deals manually or automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  View all meetings for a deal on the deal detail page
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Upcoming meetings widget on dashboard with time until next meeting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Meeting metadata: Attendees, location, video links, and descriptions
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Plan Management & Usage Limits
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Flexible pricing plans with usage-based limits. Monitor your usage and
              upgrade seamlessly as your team grows.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Four plan tiers: Free, Starter, Professional, Enterprise
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Usage limits: Deals, team members, API calls, webhooks, integrations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Feature gating: Basic vs. advanced risk detection, AI recommendations, analytics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Automatic plan enforcement with graceful limit handling
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Usage tracking and monitoring in settings dashboard
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              API Documentation & Developer Tools
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Comprehensive API documentation with interactive explorer. Build custom
              integrations and automate your workflow with our full-featured REST API.
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Interactive OpenAPI/Swagger documentation at /api-docs
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Try API endpoints directly from the documentation interface
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Complete endpoint reference: Deals, Teams, Integrations, Webhooks, Notifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Authentication examples and webhook signature verification guides
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Developer documentation with code examples and integration guides
                </span>
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
