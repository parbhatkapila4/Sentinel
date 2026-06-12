import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog · Sentinel",
  description:
    "What shipped, when, and what we learned. Based on the actual commit history of Sentinel.",
};

type Tag = "Shipped" | "Fixed" | "Security" | "Infra" | "Preview";

type Release = {
  date: string;
  title: string;
  lede?: string;
  entries: { tag: Tag; text: string }[];
};

const releases: Release[] = [
  {
    date: "2026-06-13",
    title: "Integrations move to OAuth connect",
    lede:
      "Every integration now connects through a hosted OAuth redirect — click connect, authorize, done. No more pasting keys or tokens.",
    entries: [
      {
        tag: "Shipped",
        text: "HubSpot, Salesforce, and Slack now connect via OAuth redirect, joining Gmail and Google Calendar. No credentials to paste.",
      },
      {
        tag: "Shipped",
        text: "Slack is now a scoped OAuth app: it reads message history from the channels its bot is added to and matches senders to CRM contacts, in addition to posting alerts.",
      },
      {
        tag: "Security",
        text: "Disconnect now hard-deletes the stored OAuth tokens immediately; for Slack it also clears the ingested message log.",
      },
    ],
  },
  {
    date: "2026-04-19",
    title: "Cron + integration secrets hardening",
    lede:
      "Background sync is now the quiet, boring workhorse it should be. Rotatable secrets, clearer errors, fewer surprises at 3am.",
    entries: [
      {
        tag: "Infra",
        text: "Refined cron pipeline for Google Calendar and HubSpot sync, with richer error reporting on each run.",
      },
      {
        tag: "Security",
        text: "Integration secrets are now rotatable without a reconnect, with rotation timestamps tracked per integration.",
      },
      {
        tag: "Shipped",
        text: "Deployment docs and environment configuration rewritten to match the current cron + secrets flow.",
      },
    ],
  },
  {
    date: "2026-04-16",
    title: "AI routing fallbacks",
    entries: [
      {
        tag: "Shipped",
        text: "Added graceful fallback model handling in the AI layer so a single provider hiccup no longer breaks inference.",
      },
      {
        tag: "Fixed",
        text: "Tighter error management across the AI routing boundary with surfaced reasons in logs.",
      },
    ],
  },
  {
    date: "2026-03-24",
    title: "PDF attachments in chat",
    entries: [
      {
        tag: "Shipped",
        text: "Chat now accepts PDF attachments and parses them inline so you can ask questions about contracts and proposals directly.",
      },
      {
        tag: "Fixed",
        text: "Chat authentication and attachment processing hardened against partial uploads.",
      },
    ],
  },
  {
    date: "2026-03-22",
    title: "Deal inference + Slack sync alerts",
    entries: [
      {
        tag: "Shipped",
        text: "New deal-inference methods derive at-risk signals from CRM activity patterns instead of a single heuristic.",
      },
      {
        tag: "Shipped",
        text: "CRM syncs now post structured summaries to Slack so your team sees what moved, not just that something moved.",
      },
    ],
  },
  {
    date: "2026-03-04",
    title: "Email triggers for stage changes",
    entries: [
      {
        tag: "Shipped",
        text: "Deal stage transitions and at-risk alerts now fire transactional emails with full context and a deep link back to the deal.",
      },
      {
        tag: "Fixed",
        text: "Cleaned up variable naming inconsistencies across the deal lifecycle code for easier debugging.",
      },
    ],
  },
  {
    date: "2026-02-22",
    title: "Request ID propagation",
    entries: [
      {
        tag: "Infra",
        text: "Every API request now carries a stable request ID from edge to database. Logs, Sentry, and webhook deliveries all line up.",
      },
    ],
  },
  {
    date: "2026-01-31",
    title: "Bulk operations + webhook auth",
    entries: [
      {
        tag: "Shipped",
        text: "Bulk deal operations (move, archive, tag) with proper error boundaries and per-operation caching.",
      },
      {
        tag: "Security",
        text: "Webhook processing endpoint now requires a signed auth header and rejects unauthenticated invocations.",
      },
      {
        tag: "Infra",
        text: "Vercel Cron configuration documented and narrowed to the Hobby plan limits so deploys are predictable.",
      },
    ],
  },
  {
    date: "2026-01-30",
    title: "Security headers + audit log",
    entries: [
      {
        tag: "Security",
        text: "Content-Security-Policy and Permissions-Policy headers added to every response, with a strict default.",
      },
      {
        tag: "Shipped",
        text: "AuditLog model introduced on the User record so sensitive actions can be reviewed after the fact.",
      },
    ],
  },
  {
    date: "2026-01-27",
    title: "Integrations, Teams, and Webhooks",
    lede:
      "The biggest week of the project. Most of what Sentinel is today went in during these five days.",
    entries: [
      {
        tag: "Shipped",
        text: "Salesforce integration: scoped access-token connect flow, background sync, and in-app risk surfaced alongside synced Opportunities (read-only).",
      },
      {
        tag: "Shipped",
        text: "HubSpot integration: portal-scoped private-app access token, Deal/Contact/Company sync, and in-app risk against synced data (read-only).",
      },
      {
        tag: "Shipped",
        text: "Slack incoming webhook integration with per-event filters (risk, stage change, new deal, digest).",
      },
      {
        tag: "Shipped",
        text: "Teams with invite tokens, roles, and shared pipelines. Every team member sees the same risk signals.",
      },
      {
        tag: "Shipped",
        text: "Outbound webhooks with HMAC-SHA256 signing, delivery logs, retries with backoff, and a full management UI.",
      },
      {
        tag: "Infra",
        text: "Sentry performance monitoring wired through the full request path.",
      },
      {
        tag: "Infra",
        text: "Per-route rate limiting and response caching for the API surface.",
      },
    ],
  },
  {
    date: "2026-01-26",
    title: "Google Calendar + usage tracking",
    entries: [
      {
        tag: "Shipped",
        text: "Google Calendar read-only integration using a scoped API key, with event sync and attendee-to-deal matching.",
      },
      {
        tag: "Shipped",
        text: "UserPlan and UsageTracking models added so plan limits are enforceable at the data layer.",
      },
      {
        tag: "Shipped",
        text: "CRM and Calendar integration documentation published under /docs.",
      },
    ],
  },
  {
    date: "2026-01-25",
    title: "Tests + security foundation",
    entries: [
      {
        tag: "Shipped",
        text: "Playwright end-to-end tests covering the Dashboard and Deals flows.",
      },
      {
        tag: "Shipped",
        text: "Vitest set up for unit tests with coverage reporting.",
      },
      {
        tag: "Security",
        text: "Security headers hardened in next.config.ts; .env.example added and .env enforced out of version control.",
      },
    ],
  },
  {
    date: "2026-01-23",
    title: "Top Deals analytics",
    entries: [
      {
        tag: "Shipped",
        text: "/top-deals page with pipeline-weighted analytics and visualizations for deal performance.",
      },
      {
        tag: "Shipped",
        text: "Animated navigation component with keyboard focus states across the app.",
      },
    ],
  },
  {
    date: "2026-01-20",
    title: "Marketing surface",
    lede: "The first publicly reachable routes of Sentinel.",
    entries: [
      { tag: "Shipped", text: "Pricing page with authentication-aware CTAs." },
      { tag: "Shipped", text: "Privacy Policy and Terms of Service pages." },
      { tag: "Shipped", text: "Resources hub with getting-started links." },
      { tag: "Shipped", text: "Clerk-based auth wired through sign-in and sign-up." },
    ],
  },
];

const tagStyles: Record<Tag, string> = {
  Shipped: "text-emerald-300/90 bg-emerald-400/10 border-emerald-400/20",
  Fixed: "text-sky-300/90 bg-sky-400/10 border-sky-400/20",
  Security: "text-amber-300/90 bg-amber-400/10 border-amber-400/20",
  Infra: "text-white/70 bg-white/5 border-white/15",
  Preview: "text-fuchsia-300/90 bg-fuchsia-400/10 border-fuchsia-400/20",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

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
        <a
          href="https://github.com/parbhatkapila4/Sentinel/commits/main"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Full commit history →
        </a>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Changelog
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            What shipped, when, and why.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Every entry below maps back to a real commit in the Sentinel
            repository. No marketing bundles, no synthetic version numbers -
            just the dates work actually went out.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>{releases.length} updates logged</span>
            <span className="text-white/20">·</span>
            <span>Sourced from commit history on main</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto">
          <ol className="relative">
            {releases.map((release, idx) => (
              <li
                key={release.date + release.title}
                className="relative pl-8 pb-14 last:pb-0"
              >
                <span
                  aria-hidden
                  className="absolute left-[5px] top-2 h-2 w-2 rounded-full bg-white"
                />
                {idx !== releases.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[9px] top-4 bottom-0 w-px bg-white/10"
                  />
                )}

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                  <time
                    dateTime={release.date}
                    className="font-mono text-xs uppercase tracking-[0.18em] text-white/50"
                  >
                    {formatDate(release.date)}
                  </time>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">
                  {release.title}
                </h2>
                {release.lede && (
                  <p className="text-white/70 leading-relaxed max-w-2xl mb-5">
                    {release.lede}
                  </p>
                )}
                <ul className="space-y-3">
                  {release.entries.map((entry, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                    >
                      <span
                        className={`inline-flex items-center justify-center text-[10px] uppercase tracking-[0.16em] font-mono px-2 py-[3px] rounded border w-fit sm:w-[76px] flex-none ${tagStyles[entry.tag]}`}
                      >
                        {entry.tag}
                      </span>
                      <span className="text-white/80 leading-relaxed">
                        {entry.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
