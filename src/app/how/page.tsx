import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works | Sentinel",
  description:
    "A tour of every part of Sentinel: where to go, what you'll see on each screen, and how to use it day to day.",
};

type Section = {
  kicker: string;
  title: string;
  lede: string;
  meta?: { label: string; value: string }[];
  steps: { heading: string; body: string }[];
};

const sections: Section[] = [
  {
    kicker: "01",
    title: "Dashboard",
    lede: "Your home base. High-level pipeline health, a date-ranged analytics view, and a focus panel for your largest opportunities.",
    meta: [
      { label: "Routes", value: "/dashboard · /analytics · /top-deals" },
      { label: "Use", value: "Daily overview" },
      { label: "Best for", value: "Trends, concentration, triage" },
    ],
    steps: [
      {
        heading: "Overview",
        body: "Pipeline value, revenue by source, deal stages, upcoming meetings, and today's risk callouts. Start here every morning to see where attention is needed.",
      },
      {
        heading: "Analytics",
        body: "Filter by 7 / 30 / 90 day windows to answer questions like 'how did we do this month?' Data can be exported for leadership reviews.",
      },
      {
        heading: "Top Deals",
        body: "Deals ordered by value so you can see concentration risk at a glance. Shows which of your largest opportunities are currently scoring high risk.",
      },
    ],
  },
  {
    kicker: "02",
    title: "Deals: Forecast & Deals by stage",
    lede: "Your working pipeline. Filter, search, open individual deals, log activity, and move deals through the stages that drive risk scoring.",
    meta: [
      { label: "Routes", value: "/deals · /deals/new · /deals/[id] · /deals-by-stage" },
      { label: "Stages", value: "Discover · Negotiate · Closed Won · Closed Lost" },
      { label: "Bulk", value: "Multi-select, stage update, export" },
    ],
    steps: [
      {
        heading: "Forecast (the deals list)",
        body: "All your deals in a table. Filter by status (active, at-risk, closed), search by name, scope to my deals vs. team. See value, stage, risk score, and last activity. Select rows for bulk stage updates or export.",
      },
      {
        heading: "Create deal",
        body: "Enter name, value, stage, and details. Stage drives risk scoring, so pick the correct one. You can change a deal's stage anytime from its detail page.",
      },
      {
        heading: "Deal detail",
        body: "Summary, risk score, recommended next action, and an activity timeline (emails, meetings, notes, stage changes). Draft follow-ups with the email helper and see near-term predictions. Logging activity updates the risk score immediately.",
      },
      {
        heading: "Deals by stage",
        body: "Same pipeline, grouped by stage with count and value per stage. Expand a stage to review everything currently in Negotiate, for example, instead of scrolling one long list.",
      },
    ],
  },
  {
    kicker: "03",
    title: "Alerts & risk scoring",
    lede: "The one page that tells you what to work on right now. Risk is computed from activity, not vibes.",
    meta: [
      { label: "Route", value: "/risk-overview" },
      { label: "Inputs", value: "Last touch · Time since contact · Stage · Value" },
      { label: "Queue", value: "Urgent · Important · Safe" },
    ],
    steps: [
      {
        heading: "What you'll see",
        body: "Counts of at-risk, overdue, and high-urgency deals. A critical list with value, risk score, and last activity. An action queue ranked Urgent then Important then Safe.",
      },
      {
        heading: "How scores are computed",
        body: "Days since last activity, stage, and value roll up into a 0.00 to 1.00 composite score. No activity for 7 to 14 days raises the score; healthy ongoing activity lowers it.",
      },
      {
        heading: "Where else risk shows up",
        body: "Bell icon in the sidebar and a callout on the dashboard, so you can jump to the worst deal of the day without opening the full Alerts page.",
      },
    ],
  },
  {
    kicker: "04",
    title: "AI (Insights)",
    lede: "A chat interface for questions your CRM cannot answer easily. Every ask runs against your current deals and risk data, not a synthetic demo set.",
    meta: [
      { label: "Route", value: "/insights" },
      { label: "Data", value: "Your live pipeline" },
      { label: "Privacy", value: "No training on your data" },
    ],
    steps: [
      {
        heading: "Good questions to ask",
        body: "'Which deals are at risk and why?' · 'Summarize my pipeline this quarter.' · 'What is our biggest revenue concentration?' · 'Which Negotiate deals have gone quiet?'",
      },
      {
        heading: "How it stays current",
        body: "Responses are generated against your current data at query time. Add or update a deal, ask again, and you get an updated answer.",
      },
    ],
  },
  {
    kicker: "05",
    title: "Reports",
    lede: "A one-page snapshot built for weekly reviews and leadership updates.",
    meta: [
      { label: "Route", value: "/reports" },
      { label: "Export", value: "Share link or download" },
    ],
    steps: [
      {
        heading: "What is in it",
        body: "Pipeline value, deal counts, risk distribution, stage breakdown, recent and 30-day activity, and top deals, all in one exportable view.",
      },
    ],
  },
  {
    kicker: "06",
    title: "Notifications",
    lede: "Every alert and in-app event in one place, plus preferences so you are never drowning in pings.",
    meta: [
      { label: "Routes", value: "/notifications · /settings/notifications" },
      { label: "Channels", value: "In-app · Email" },
    ],
    steps: [
      {
        heading: "Inbox",
        body: "All alerts and activity in one feed. Filter by all or unread. Click a notification to open the related deal. Mark items as read as you work through them.",
      },
      {
        heading: "Preferences",
        body: "Settings → Notifications lets you turn channels on and off and tune what you want to be notified about. Sensible defaults out of the box.",
      },
    ],
  },
  {
    kicker: "07",
    title: "Settings",
    lede: "Account, team, thresholds, notifications, webhooks, and integrations, all under one roof.",
    meta: [
      { label: "Route", value: "/settings" },
      { label: "Sections", value: "General · Team · Notifications · Webhooks · Integrations" },
    ],
    steps: [
      {
        heading: "General",
        body: "Profile, risk thresholds (when a deal is flagged at-risk), and billing or payment if applicable.",
      },
      {
        heading: "Team",
        body: "Invite members, manage roles, and see who has access. Invitations use a tokenized link and expire automatically.",
      },
      {
        heading: "Notifications",
        body: "Per-channel toggles for in-app and email alerts. Mute categories you do not want without disabling the whole thing.",
      },
      {
        heading: "Webhooks",
        body: "Add outbound endpoints to send deal and risk events to other tools. Signed with HMAC-SHA256 and retried on failure.",
      },
      {
        heading: "Integrations",
        body: "Connect Salesforce, HubSpot, Google Calendar, and Slack. Trigger a sync, see connection status, and rotate secrets without a reconnect.",
      },
    ],
  },
  {
    kicker: "08",
    title: "Search & teams",
    lede: "Two small things that make the rest of the product faster.",
    meta: [
      { label: "Where", value: "Top nav, every page" },
    ],
    steps: [
      {
        heading: "Search",
        body: "Top-nav search bar accepts a company or deal name and jumps straight to the detail page. Also works from the deals list via the search and filter params.",
      },
      {
        heading: "Team scope",
        body: "Use the team selector in the nav to switch between teams. Deal lists and dashboards can be scoped to my deals or team-wide, so you can either focus on your own pipeline or see the full picture.",
      },
    ],
  },
];

const quickRef: { goal: string; path: string }[] = [
  { goal: "Pipeline at a glance", path: "Dashboard → Overview" },
  { goal: "Analyze by date range", path: "Dashboard → Analytics" },
  { goal: "Focus on biggest deals", path: "Dashboard → Top Deals" },
  { goal: "List, filter, search deals", path: "Forecast" },
  { goal: "Add a deal", path: "Create deal" },
  { goal: "Open one deal", path: "Click deal in table" },
  { goal: "Deals grouped by stage", path: "Deals by stage" },
  { goal: "At-risk queue", path: "Alerts" },
  { goal: "Ask in plain language", path: "AI (Insights)" },
  { goal: "Pipeline snapshot / export", path: "Reports" },
  { goal: "All notifications", path: "Notifications" },
  { goal: "Account, team, integrations", path: "Settings" },
];

function BackLink() {
  return (
    <div className="border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur">
      <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
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
          Back to home
        </Link>
        <Link
          href="/features"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          See all features →
        </Link>
      </div>
    </div>
  );
}

export default function HowPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            How it works
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Every screen, in one tour. Find the button and know what it does before you click it.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel is a deal-risk platform. This page walks through each
            area of the product, dashboard, deals, alerts, AI, reports,
            settings, so you know exactly where to go and what you will see
            when you get there.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>{sections.length} sections</span>
            <span className="text-white/20">·</span>
            <span>Every route live</span>
            <span className="text-white/20">·</span>
            <span>Written for operators, not a demo reel</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-4">
        <div className="max-w-[1700px] mx-auto">
          <div className="border-t border-white/10 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 pt-2">
                Start
              </div>
              <div>
                <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-3">
                  Where to go first
                </h2>
                <p className="text-white/70 leading-relaxed max-w-2xl">
                  After you sign in, use the sidebar to move between sections.
                  Add and manage deals in{" "}
                  <span className="text-white/90">Forecast</span> and{" "}
                  <span className="text-white/90">Deals by stage</span>. Check
                  risk and next steps in{" "}
                  <span className="text-white/90">Alerts</span>. Ask questions
                  in plain language in{" "}
                  <span className="text-white/90">AI</span>. Run reports and
                  change preferences under{" "}
                  <span className="text-white/90">Dashboard</span> and{" "}
                  <span className="text-white/90">Settings</span>. The rest of
                  this page explains each area in order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {sections.map((s) => (
            <article
              key={s.kicker}
              className="border-t border-white/10 pt-10 scroll-mt-24"
              id={`s${s.kicker}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 pt-2">
                  {s.kicker}
                </div>
                <div>
                  <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-3">
                    {s.title}
                  </h2>
                  <p className="text-white/70 leading-relaxed max-w-2xl mb-6">
                    {s.lede}
                  </p>

                  {s.meta && (
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mb-8 font-mono text-xs">
                      {s.meta.map((m) => (
                        <div key={m.label}>
                          <dt className="text-white/40 uppercase tracking-[0.18em] mb-1">
                            {m.label}
                          </dt>
                          <dd className="text-white/80 leading-snug">
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <div className="space-y-5 max-w-3xl">
                    {s.steps.map((step) => (
                      <div key={step.heading}>
                        <div className="text-sm font-medium text-white mb-1.5">
                          {step.heading}
                        </div>
                        <p className="text-[15px] text-white/70 leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-14">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">
                Quick reference
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                Shortcut to the right screen for the job you are trying to do.
              </p>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0 text-[14px]">
              {quickRef.map((row) => (
                <div
                  key={row.goal}
                  className="flex items-baseline justify-between gap-4 border-b border-white/6 py-3"
                >
                  <dt className="text-white/80">{row.goal}</dt>
                  <dd className="font-mono text-xs text-white/50 text-right">
                    {row.path}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-14">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3">
                Next
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3 max-w-xl leading-tight">
                The fastest way to see it is to connect your own data.
              </h2>
              <p className="text-white/60 leading-relaxed max-w-xl">
                Starter is free. Connect a CRM, import 25 deals, and see real
                risk scoring against your actual pipeline in under five minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-5 py-2.5 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
