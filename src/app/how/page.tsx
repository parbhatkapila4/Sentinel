import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works | Sentinel",
  description:
    "Learn how Sentinel helps you connect deals, detect risk signals, and take action to close more revenue before deals go silent.",
};

export default function HowPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
      <main className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium mb-10 sm:mb-12"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
          <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-white/40 mb-4">
            How it works
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.12] mb-6 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            How Sentinel
            <br />
            <span className="text-[#0ea5e9]">works</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-20 max-w-2xl">
            Sentinel is a deal risk intelligence platform. This page walks you through every part of the product so you know where to go and what to do: from adding deals and viewing risk to using AI insights and reports.
          </p>


          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-6">Where to start</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              After you sign in, use the sidebar to move between sections. You’ll add and manage deals in Forecast and Deals by stage; check risk and next steps in Alerts; ask questions about your pipeline in AI; and run reports or change preferences under Dashboard and Settings. The rest of this guide explains each area step by step.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Dashboard</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To see your pipeline at a glance, go to <strong className="text-white/90">Dashboard → Overview</strong>. You’ll see high-level metrics, charts (e.g. pipeline value, revenue by source, deal stages), and widgets like top deals and upcoming meetings. Use this as your home base to spot trends and which deals need attention.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              To dig into numbers over time, open <strong className="text-white/90">Dashboard → Analytics</strong>. You can filter by date range (e.g. last 7, 30, or 90 days), see deal and revenue metrics, and export data. Use it when you need to answer “how did we do over this period?”
            </p>
            <p className="text-white/70 leading-relaxed">
              To focus on your largest opportunities, go to <strong className="text-white/90">Dashboard → Top Deals</strong>. Deals are ordered by value so you can see concentration (e.g. top 3 or top 10) and which of those are high risk. Helpful when you want to prioritize by size and risk together.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Deals: Forecast and Deals by stage</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To work with your full pipeline, go to <strong className="text-white/90">Forecast</strong> (the deals list). Here you can filter by status (all, active, at-risk, closed), search by deal or company name, and optionally scope to “my deals” or “all” depending on your team. Use the table to see value, stage, risk score, and last activity. You can select multiple deals for bulk actions (e.g. update stage) and export the list.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              To add a new deal, click <strong className="text-white/90">Create deal</strong> (or go to the “new deal” flow from the sidebar). Enter name, value, stage, and any details. Stages (e.g. Discover, Negotiate, Closed Won, Closed Lost) drive how Sentinel scores risk; you can change a deal’s stage anytime from its detail page.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              To open a single deal, click it in the table. On the deal detail page you’ll see the summary, risk score, recommended action, and an activity timeline (emails, meetings, notes, stage changes). You can change stage, add events, use the email helper to draft follow-ups, and see predictions. Logging new activity here updates the deal’s risk and keeps the timeline accurate.
            </p>
            <p className="text-white/70 leading-relaxed">
              To view deals grouped by stage, go to <strong className="text-white/90">Deals by stage</strong>. You’ll see each stage with count and value, and can expand to see the deals in that stage. Use it when you want to review a specific stage (e.g. all in Negotiate) rather than one long list.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Alerts and risk</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To see which deals need attention and why, go to <strong className="text-white/90">Alerts</strong> (risk overview). You’ll see counts of at-risk, overdue, and high-urgency deals, plus a list of the most critical ones with value, risk score, and last activity. There’s an action queue (urgent, important, safe) so you know what to do first. Click a deal to open its detail page and take action or log activity.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Risk scores are computed from activity: last touch date, time since contact, stage, and value. No activity for a while (e.g. 7 or 14 days) raises the score. You don’t have to calculate this yourself; just use Alerts and the deal detail page to see the score and the suggested next step.
            </p>
            <p className="text-white/70 leading-relaxed">
              You’ll also see risk alerts in the sidebar (bell icon) and on the dashboard. Use those to jump straight to an at-risk deal when you don’t want to open the full Alerts page.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">AI (Insights)</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To ask questions about your pipeline in plain language, go to <strong className="text-white/90">AI</strong> (Insights). You get a chat interface: type things like “Which deals are at risk?” or “Summarize my pipeline” and get answers based on your deals and risk data. Use it to explore patterns, find at-risk deals, or get a quick summary without clicking through multiple pages.
            </p>
            <p className="text-white/70 leading-relaxed">
              Responses are based on your current data. If you add or update deals, you can ask again and get updated answers.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Reports</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To get a snapshot of pipeline health and metrics, go to <strong className="text-white/90">Reports</strong>. You’ll see pipeline value, deal counts, risk distribution, stage breakdown, recent and 30-day activity, and top deals. Use the report actions to export or share when you need a formal summary for leadership or weekly reviews.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Notifications</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To see all alerts and activity notifications in one place, open <strong className="text-white/90">Notifications</strong> (from the nav or the bell icon). You can filter by all or unread and click a notification to go to the related deal. Mark items as read as you work through them.
            </p>
            <p className="text-white/70 leading-relaxed">
              To control how and when you’re notified (e.g. email, in-app), go to <strong className="text-white/90">Settings → Notifications</strong>. There you can turn channels on or off and set preferences so you’re not overloaded.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Settings</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To manage your account and team, go to <strong className="text-white/90">Settings</strong>. Under <strong className="text-white/90">General</strong> you’ll find profile, risk thresholds (e.g. when a deal is considered at risk), and billing/payment if applicable. Under <strong className="text-white/90">Team</strong> you can invite members, manage roles, and see who has access. Under <strong className="text-white/90">Notifications</strong> you configure how you get alerts (email, in-app). Under <strong className="text-white/90">Webhooks</strong> you can add endpoints if you want to send deal or risk events to other tools. Under <strong className="text-white/90">Integrations</strong> you connect external systems (e.g. CRM, calendar) so deals and activity stay in sync; you can trigger syncs and see connection status there.
            </p>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Search and teams</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To find a deal or company quickly, use the search bar in the top nav. Type a name or keyword and pick a result to jump to that deal. You can also run a search from the deals list by using the search or filter params.
            </p>
            <p className="text-white/70 leading-relaxed">
              If you’re in a team, use the team selector in the nav to switch between teams. Deal lists and dashboards can be scoped to “my deals” or “all” (team-wide) depending on the page; that way you can either focus on your own pipeline or see the full team view.
            </p>
          </section>

          <section className="mb-20 rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
              Quick reference
            </h2>
            <ul className="space-y-3 text-white/70 text-sm sm:text-base">
              <li><strong className="text-white/90">See pipeline at a glance</strong> → Dashboard → Overview</li>
              <li><strong className="text-white/90">Analyze by date range</strong> → Dashboard → Analytics</li>
              <li><strong className="text-white/90">Focus on biggest deals</strong> → Dashboard → Top Deals</li>
              <li><strong className="text-white/90">List, filter, search deals</strong> → Forecast</li>
              <li><strong className="text-white/90">Add a deal</strong> → Create deal (or Forecast / new deal)</li>
              <li><strong className="text-white/90">View one deal (activity, risk, actions)</strong> → Click deal in table or search</li>
              <li><strong className="text-white/90">Deals by stage</strong> → Deals by stage</li>
              <li><strong className="text-white/90">At-risk deals and action queue</strong> → Alerts</li>
              <li><strong className="text-white/90">Ask questions about pipeline</strong> → AI (Insights)</li>
              <li><strong className="text-white/90">Pipeline snapshot / export</strong> → Reports</li>
              <li><strong className="text-white/90">All notifications</strong> → Notifications</li>
              <li><strong className="text-white/90">Account, team, integrations</strong> → Settings</li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}
