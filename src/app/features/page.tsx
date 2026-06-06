import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features · Sentinel",
  description:
    "What Sentinel actually does: risk scoring, pipeline visibility, activity timelines, AI assistance, and the integrations they run on.",
};

type Pillar = {
  kicker: string;
  title: string;
  lede: string;
  meta?: { label: string; value: string }[];
  points: string[];
  notClaim?: string[];
  link?: { href: string; label: string };
};

const pillars: Pillar[] = [
  {
    kicker: "01",
    title: "Risk scoring",
    lede:
      "A composite 0-1 score on every open deal, recomputed as new activity arrives. Not a single heuristic. Each score comes with plain-English reasons.",
    meta: [
      { label: "Score", value: "0.00 - 1.00 composite" },
      { label: "Bands", value: "Low · Medium · High" },
      { label: "Inputs", value: "Activity · Velocity · Engagement · Value" },
    ],
    points: [
      "Temporal decay: weighted risk from time-since-last-activity, with configurable thresholds per stage.",
      "Stage velocity: time-in-stage compared against the pipeline's own historical norms, with bottleneck detection.",
      "Engagement scoring: emails, meetings, and calls tracked together with drop-off alerts when touchpoints go quiet.",
      "Competitive signals: high-value and negotiation-stage deals are weighted to surface first.",
      "Risk reasons: every score carries a short explanation of why it moved, so the team isn't arguing with a black box.",
    ],
  },
  {
    kicker: "02",
    title: "Pipeline management",
    lede:
      "A five-stage pipeline built around how deals actually move, with bulk operations and filtering that scale with the book.",
    meta: [
      {
        label: "Stages",
        value: "Discovery → Qualification → Proposal → Negotiation → Closed",
      },
      { label: "Bulk ops", value: "Move · Archive · Reassign · Export" },
      { label: "Views", value: "My deals · Team deals" },
    ],
    points: [
      "Real-time pipeline value across stages, with owner- and team-level roll-ups.",
      "Full-text search across deal names, companies, and descriptions; filter by stage, risk, owner, and value range.",
      "Sort by value, risk, last activity, or creation date. URL-addressable state so views are shareable.",
      "Bulk actions with error boundaries so partial failures surface clearly and never silently drop records.",
    ],
  },
  {
    kicker: "03",
    title: "Activity & timeline",
    lede:
      "Every touchpoint on every deal, written to an immutable log. The timeline is the source of truth, not the reason you have to re-key it.",
    meta: [
      { label: "Event types", value: "Email · Meeting · Call · Custom" },
      { label: "Metadata", value: "Extensible JSON per event" },
      { label: "Storage", value: "Append-only, UUID-keyed" },
    ],
    points: [
      "Email sent and received tracking with subject, direction, and timestamp.",
      "Meeting and call events logged with attendees and duration where available.",
      "Custom events with a JSON metadata field so any integration can contribute to the timeline.",
      "lastActivityAt is derived from the full event stream, not a manually updated field.",
      "Chronological event view with timezone-aware timestamps and stable identifiers for audit.",
    ],
  },
  {
    kicker: "04",
    title: "AI assistant",
    lede:
      "A multi-model router that picks the right model per question and always runs scoped to your workspace. Your data isn't training anyone else's model.",
    meta: [
      { label: "Routing", value: "Task-aware model selection" },
      { label: "Context", value: "Workspace-scoped, per request" },
      { label: "Attachments", value: "PDF parsing in chat" },
    ],
    points: [
      "Ask the things managers actually ask: which deals need attention today, where the pipeline is leaking, which accounts have gone quiet.",
      "Graceful provider fallbacks so a single upstream hiccup doesn't take inference down.",
      "Deal-specific insights generated against the actual event stream for that deal, not a generic summary.",
      "Chat history with folder organization; conversations persist and stay searchable.",
    ],
  },
  {
    kicker: "05",
    title: "Integrations",
    lede:
      "Read-only connections to the systems your revenue runs on. Scoped API keys inbound, HMAC-signed webhooks outbound.",
    meta: [
      { label: "CRM", value: "Salesforce · HubSpot" },
      { label: "Calendar", value: "Google Calendar" },
      { label: "Notify", value: "Slack · Outbound webhooks" },
    ],
    points: [
      "Salesforce: connected-app access token, inbound sync for Opportunities and Accounts, no write-back to the record.",
      "HubSpot: private app access token, Deals / Contacts / Companies sync, Sentinel never writes to your portal.",
      "Google Calendar: read-only API key, event-to-deal matching by domain and attendee.",
      "Slack: incoming webhook with per-event filters for risk, stage change, new deal, and daily digest.",
      "Outbound webhooks: HMAC-SHA256 signed, with retries, delivery logs, and a 30-day history you can inspect.",
    ],
    link: { href: "/integrations", label: "See integration details" },
  },
  {
    kicker: "06",
    title: "Teams & access",
    lede:
      "Built around the reality that a pipeline belongs to a team, not a person. Every control scopes correctly from day one.",
    meta: [
      { label: "Roles", value: "Owner · Admin · Member · Viewer" },
      { label: "Scope", value: "Team-scoped deals, shared integrations" },
      { label: "Invites", value: "Email with single-use token" },
    ],
    points: [
      "Team workspaces with unique slugs and renameable display names.",
      "Invite by email with role assigned at invite time; tokens expire and can be revoked.",
      "Deals can be assigned to specific team members, with team-wide visibility for managers.",
      "Integrations and webhooks can be owned at the team level so connections survive rotation.",
    ],
  },
  {
    kicker: "07",
    title: "Notifications",
    lede:
      "Alerts tuned to the work, not to the engagement metric. Every notification carries enough context to act without opening three tabs.",
    meta: [
      { label: "Channels", value: "In-app · Email · Slack" },
      { label: "Triggers", value: "Risk · Stage change · Action overdue · Digest" },
      { label: "Controls", value: "Per-user preferences" },
    ],
    points: [
      "In-app notification center with read/unread state and history.",
      "Email alerts for deal-at-risk, action-overdue, and stage transitions, each deep-linked back to the deal.",
      "Weekly digest with pipeline summary, risk distribution, and top movements.",
      "Notification preferences are per-user and respected across every channel.",
    ],
  },
  {
    kicker: "08",
    title: "Developer surface",
    lede:
      "A real API, documented against an OpenAPI spec, with an interactive explorer. Webhooks are signed, logged, and retried.",
    meta: [
      { label: "Docs", value: "OpenAPI / Swagger at /api-docs" },
      { label: "Auth", value: "Per-user API keys" },
      {
        label: "Events",
        value:
          "deal.created · deal.updated · deal.stage_changed · deal.at_risk · deal.closed_won · deal.closed_lost",
      },
    ],
    points: [
      "Deal search, export, and programmatic management endpoints with full filter parity with the UI.",
      "Webhook subscriptions with HMAC-SHA256 signatures in X-Sentinel-Signature.",
      "Delivery retries with exponential backoff; every attempt logged with response code and body preview.",
      "Team events (team.member_added, team.member_removed) for downstream access-control automations.",
    ],
    link: { href: "/api-docs", label: "Open API reference" },
  },
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
          href="/pricing"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          See pricing →
        </Link>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Features
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            A revenue-ops layer built on the signals your CRM already has.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel doesn't try to replace your CRM. It reads the signals your
            team is already generating - emails, meetings, stage transitions -
            and turns them into risk scores, next actions, and alerts that
            arrive before a deal goes quiet.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>{pillars.length} product pillars</span>
            <span className="text-white/20">·</span>
            <span>One team, one pipeline, one timeline</span>
            <span className="text-white/20">·</span>
            <span>No shared-model training</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {pillars.map((pillar) => (
            <article
              key={pillar.kicker}
              className="border-t border-white/10 pt-10 scroll-mt-24"
              id={`p${pillar.kicker}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 pt-2">
                  {pillar.kicker}
                </div>

                <div>
                  <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-3">
                    {pillar.title}
                  </h2>
                  <p className="text-white/70 leading-relaxed max-w-2xl mb-6">
                    {pillar.lede}
                  </p>

                  {pillar.meta && (
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mb-8 font-mono text-xs">
                      {pillar.meta.map((m) => (
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

                  <ul className="space-y-3 max-w-3xl">
                    {pillar.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-3 text-[15px] text-white/80 leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {pillar.link && (
                    <div className="mt-6">
                      <Link
                        href={pillar.link.href}
                        className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white"
                      >
                        {pillar.link.label}
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
