import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations · Sentinel",
  description:
    "Sentinel connects to the systems your revenue runs on. Salesforce, HubSpot, Google Calendar, Slack, and outbound webhooks.",
};

type Integration = {
  slug: string;
  name: string;
  category: "CRM" | "Calendar" | "Notifications" | "Developer";
  summary: string;
  auth: string;
  direction: "Inbound" | "Outbound";
  scopes: string[];
  does: string[];
  doesNot: string[];
  status: "Available" | "Beta";
};

const integrations: Integration[] = [
  {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM",
    summary:
      "Read-only sync for Accounts, Opportunities, and stage history. Sentinel pulls pipeline state into its own workspace; it does not push anything back into Salesforce.",
    auth: "API key / connected-app access token",
    direction: "Inbound",
    scopes: ["opportunities:read", "accounts:read", "contacts:read"],
    does: [
      "Pull Opportunities, Accounts, Contacts, and stage transitions",
      "Track last-activity timestamps per deal",
      "Surface risk score and Sentinel notes inside Sentinel - never written back to Salesforce",
      "Incremental sync on a daily cadence; full resync on demand",
    ],
    doesNot: [
      "Write, update, or delete any records in Salesforce",
      "Modify pipeline stages or custom object schemas",
      "Send email from your Salesforce domain",
    ],
    status: "Available",
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    category: "CRM",
    summary:
      "Connect your HubSpot portal with a private app access token to sync Deals, Contacts, and Companies. Read-only: changes in HubSpot flow into Sentinel, not the other way around.",
    auth: "Private app access token",
    direction: "Inbound",
    scopes: [
      "crm.objects.deals.read",
      "crm.objects.contacts.read",
      "crm.objects.companies.read",
    ],
    does: [
      "Sync Deals, Contacts, Companies, and owner assignments",
      "Read deal pipelines and stage probabilities as configured in HubSpot",
      "Display Sentinel risk alongside HubSpot data inside Sentinel, without touching your portal",
      "Run on a daily cadence; full resync on demand",
    ],
    doesNot: [
      "Write, update, or delete any records in HubSpot",
      "Send marketing email or create sequences",
      "Alter your pipeline structure, automations, or workflows",
      "Access HubSpot Conversations or Service Hub tickets",
    ],
    status: "Available",
  },
  {
    slug: "google-calendar",
    name: "Google Calendar",
    category: "Calendar",
    summary:
      "Turn meetings into deal signals. Sentinel matches calendar events to open Opportunities and flags deals where the customer has gone quiet.",
    auth: "API key · read-only",
    direction: "Inbound",
    scopes: ["calendar.events.readonly", "calendar.readonly"],
    does: [
      "Read event titles, attendees, and timestamps across connected calendars",
      "Match events to deals by domain and attendee email",
      "Detect meeting cadence gaps and no-shows",
    ],
    doesNot: [
      "Create, modify, or delete calendar events",
      "Read event descriptions, conference links, or attached files",
      "Send invitations or respond on your behalf",
    ],
    status: "Available",
  },
  {
    slug: "slack",
    name: "Slack",
    category: "Notifications",
    summary:
      "Route Sentinel alerts into the channels your team already lives in. Deal-at-risk, stage changes, and daily summaries arrive where work happens.",
    auth: "Incoming Webhook URL",
    direction: "Outbound",
    scopes: ["incoming-webhook"],
    does: [
      "Post alerts to any channel the webhook is authorized for",
      "Filter notifications by event type (risk, stage change, new deal, daily digest)",
      "Include deal owner, value, and a deep link back to Sentinel",
    ],
    doesNot: [
      "Read your Slack messages or channel history",
      "List users, DMs, or workspace metadata",
      "Install as a full Slack app; runs as a standard Incoming Webhook",
    ],
    status: "Available",
  },
  {
    slug: "webhooks",
    name: "Outbound Webhooks",
    category: "Developer",
    summary:
      "Stream Sentinel events to any HTTPS endpoint. Signed with HMAC-SHA256, delivered with retries, and fully introspectable from Settings.",
    auth: "HMAC-SHA256 signed payloads",
    direction: "Outbound",
    scopes: ["deal.created", "deal.updated", "deal.stage_changed", "deal.at_risk"],
    does: [
      "Deliver JSON payloads to your endpoint on subscribed events",
      "Sign every request with a per-webhook secret in X-Sentinel-Signature",
      "Retry failed deliveries with exponential backoff and log the full history",
      "Expose delivery logs, payloads, and response codes in the dashboard",
    ],
    doesNot: [
      "Send unsigned payloads or deliver over plain HTTP",
      "Store your endpoint's responses beyond the last 30 days",
    ],
    status: "Available",
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
          href="/settings"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Manage integrations →
        </Link>
      </div>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <article
      id={integration.slug}
      className="group scroll-mt-24 border-t border-white/10 pt-10"
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
        <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white">
          {integration.name}
        </h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
          {integration.category}
        </span>
        <span
          className={`text-[11px] uppercase tracking-[0.18em] ml-auto ${
            integration.status === "Available"
              ? "text-emerald-400/80"
              : "text-amber-400/80"
          }`}
        >
          {integration.status}
        </span>
      </div>

      <p className="text-white/70 leading-relaxed max-w-2xl mb-6">
        {integration.summary}
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mb-8 font-mono text-xs">
        <div>
          <dt className="text-white/40 uppercase tracking-[0.18em] mb-1">
            Auth
          </dt>
          <dd className="text-white/80">{integration.auth}</dd>
        </div>
        <div>
          <dt className="text-white/40 uppercase tracking-[0.18em] mb-1">
            Direction
          </dt>
          <dd className="text-white/80">{integration.direction}</dd>
        </div>
        <div>
          <dt className="text-white/40 uppercase tracking-[0.18em] mb-1">
            {integration.slug === "webhooks" ? "Events" : "Scopes"}
          </dt>
          <dd className="text-white/80">
            {integration.scopes.map((s, i) => (
              <span key={s}>
                <span className="text-white/70">{s}</span>
                {i < integration.scopes.length - 1 && (
                  <span className="text-white/30">, </span>
                )}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
            What it does
          </h3>
          <ul className="space-y-2">
            {integration.does.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] text-white/80 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
            What it never does
          </h3>
          <ul className="space-y-2">
            {integration.doesNot.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] text-white/70 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-[10px] h-[2px] w-[8px] flex-none bg-white/30"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Integrations
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Connect the systems your revenue runs on.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel is a read-only layer over your existing CRM and calendar.
            We sync the signals that matter, never write back to connected
            systems, and log every request so you can audit what moved.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>{integrations.length} integrations</span>
            <span className="text-white/20">·</span>
            <span>Scoped API keys inbound, HMAC-signed webhooks outbound</span>
            <span className="text-white/20">·</span>
            <span>Disconnect deletes credentials within 24h</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.slug} integration={integration} />
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Don&apos;t see your stack?
              </h3>
              <p className="text-white/60 leading-relaxed mb-5 max-w-md">
                Outbound webhooks cover most custom pipelines. For anything
                deeper, get in touch and we&apos;ll scope it directly.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Request an integration
                </Link>
                <Link
                  href="/api-docs"
                  className="inline-flex items-center gap-2 border border-white/15 text-white/80 px-4 py-2 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
                >
                  Read the API
                </Link>
              </div>
            </div>
            <div className="md:border-l md:border-white/10 md:pl-10">
              <h3 className="text-xl font-semibold text-white mb-3">
                Security posture
              </h3>
              <p className="text-white/60 leading-relaxed max-w-md">
                Every token is encrypted at rest with per-user keys. Scopes are
                minimized to the smallest surface that makes the feature work.
                Full details on the{" "}
                <Link
                  href="/security"
                  className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  security
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
