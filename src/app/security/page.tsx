import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security · Sentinel",
  description:
    "How Sentinel handles your data: least-privilege credentials, encryption at rest, signed webhooks, and the things we deliberately don't do.",
};

const lastReviewed = "April 19, 2026";

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
          href="/privacy"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Privacy policy →
        </Link>
      </div>
    </div>
  );
}

type Principle = { title: string; body: string };

const principles: Principle[] = [
  {
    title: "Least-privilege integrations",
    body:
      "Integrations connect through OAuth: you authorize Sentinel from a provider redirect and it receives scoped tokens - there are no keys to paste. HubSpot, Salesforce, Gmail, and Google Calendar are read-only; Slack runs as a scoped app that reads the channels its bot is added to and posts alerts. Each token is used only for the specific paths the product exercises - if a feature doesn't need a permission, we don't ask for it.",
  },
  {
    title: "Read-only by default",
    body:
      "Sentinel is a reporting layer over your source systems. We only read from connected CRMs and calendars; we do not write back to Salesforce, HubSpot, or Google Calendar. We do not send email from your domain, create meetings, or delete anything in a connected system.",
  },
  {
    title: "Encryption at rest and in transit",
    body:
      "All traffic uses TLS 1.2+. Integration tokens and webhook secrets are encrypted at rest in the database. The application itself is served over HTTPS with HSTS, a strict Content-Security-Policy, and a locked-down Permissions-Policy.",
  },
  {
    title: "Signed, auditable webhooks",
    body:
      "Outbound webhooks are signed with HMAC-SHA256 using a per-webhook secret. Every delivery attempt is logged with its response status, retried with backoff on failure, and visible in the dashboard for 30 days.",
  },
  {
    title: "Deletion means deletion",
    body:
      "Disconnecting an integration revokes and deletes its tokens from our database within 24 hours. Account deletion removes user-scoped records and triggers token revocation on connected providers where the API supports it.",
  },
];

type Practice = { label: string; detail: string };

const platform: Practice[] = [
  {
    label: "Hosting",
    detail:
      "Vercel (edge + serverless). Regional failover handled at the platform layer.",
  },
  {
    label: "Database",
    detail:
      "Managed Postgres with daily backups and point-in-time recovery enabled.",
  },
  {
    label: "Authentication",
    detail:
      "Clerk handles identity. Email/password, Google, and SSO flows are managed by Clerk; we never see your password.",
  },
  {
    label: "Monitoring",
    detail:
      "Sentry for application errors and performance. Structured logs carry a request ID from edge to database.",
  },
  {
    label: "Rate limiting",
    detail:
      "Upstash-backed token bucket limiting on mutating routes to protect against abuse and runaway integrations.",
  },
  {
    label: "Secret handling",
    detail:
      "Environment secrets are stored in the hosting platform's encrypted vault and rotated on a documented cadence.",
  },
];

const dataHandling = [
  {
    q: "What data does Sentinel store?",
    a: "The minimum needed to do the job: your profile from Clerk, your connected integrations' tokens and sync metadata, and the deal/event records we sync from connected CRMs and calendars. We keep AI-generated risk scores and short text summaries attached to those records.",
  },
  {
    q: "Is my data used to train shared AI models?",
    a: "No. Your data is never used to train shared or cross-customer models. Inference requests run against scoped provider APIs, and we send only the fields each call needs.",
  },
  {
    q: "Who on the Sentinel team can access my data?",
    a: "Sentinel is currently built and operated by one engineer. Production access is gated behind hardware-backed SSO and is used only to debug issues you report or to recover from an outage.",
  },
  {
    q: "Where is data stored?",
    a: "Production Postgres runs in a single managed region. All access is over TLS from the application layer; there are no public database endpoints.",
  },
];

const honest = [
  "Sentinel is not SOC 2 certified. The audit is planned for later in 2026, and we will not claim it before the letter is in hand.",
  "Sentinel is not HIPAA compliant. Do not use it to process protected health information.",
  "Sentinel does not sign BAAs today. Enterprise agreements with custom terms are handled case-by-case - reach out if you need one.",
  "Sentinel is operated by a small team. We optimize for transparency and fast response, not for having a 50-page trust center.",
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Security
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            How we handle the data you trust us with.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            This page describes what Sentinel does today, written plainly. It
            avoids certifications we don't hold and claims we can't back. If
            something you need isn't here, write in and we'll answer directly.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Last reviewed {lastReviewed}</span>
            <span className="text-white/20">·</span>
            <Link
              href="mailto:help@sentinels.in"
              className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
            >
              help@sentinels.in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
            Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            {principles.map((p, i) => (
              <div key={p.title} className="flex gap-5">
                <span className="font-mono text-xs text-white/30 pt-1 w-6 flex-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-lg tracking-tight mb-2">
                    {p.title}
                  </h3>
                  <p className="text-white/65 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
            Platform
          </h2>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {platform.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-8 py-4"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.18em] text-white/50 pt-[2px]">
                  {row.label}
                </dt>
                <dd className="text-white/80 leading-relaxed">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
            Data handling
          </h2>
          <div className="space-y-8">
            {dataHandling.map((item) => (
              <div key={item.q}>
                <h3 className="text-white font-semibold text-lg tracking-tight mb-2">
                  {item.q}
                </h3>
                <p className="text-white/65 leading-relaxed max-w-3xl">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
            What we don't claim
          </h2>
          <p className="text-white/60 leading-relaxed max-w-2xl mb-6">
            It's easy to paste a compliance badge on a site. We'd rather say
            what we actually have.
          </p>
          <ul className="space-y-3 max-w-3xl">
            {honest.map((line) => (
              <li key={line} className="flex gap-3 text-white/80 leading-relaxed">
                <span
                  aria-hidden
                  className="mt-[10px] h-[2px] w-[10px] flex-none bg-white/40"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
