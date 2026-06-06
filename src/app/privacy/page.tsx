import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Sentinel",
  description:
    "What Sentinel collects, how it's used, and how to delete it. Written in plain English.",
};

const lastUpdated = "January 26, 2026";

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
          href="/security"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Security page →
        </Link>
      </div>
    </div>
  );
}

type Section = {
  id: string;
  number: string;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "collect",
    number: "01",
    title: "What we collect",
    body: (
      <>
        <p>
          Sentinel collects the minimum information required to run the
          service. We group it into three categories:
        </p>
        <ul className="space-y-3 pt-2">
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              <span className="text-white font-medium">Account data.</span>{" "}
              Your name, email address, and authentication identifiers. This
              comes from Clerk, our authentication provider. We never see or
              store your password.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              <span className="text-white font-medium">Workspace data.</span>{" "}
              The deals, activity events, integration tokens, and webhook
              configurations you create in Sentinel, plus anything we sync
              from a connected CRM or calendar on your instruction.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              <span className="text-white font-medium">Operational data.</span>{" "}
              IP address, user-agent, request IDs, and timestamps tied to
              your sessions. We use this for rate limiting, error
              diagnosis, and abuse prevention.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    number: "02",
    title: "How we use it",
    body: (
      <>
        <p>Strictly to run the product and keep it working. Specifically:</p>
        <ul className="space-y-3 pt-2">
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              To deliver the features you signed up for - risk scoring,
              timelines, notifications, and integrations.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              To send transactional email you've opted into (risk alerts,
              stage-change notifications, weekly digests) and account email
              you cannot opt out of (billing, security).
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              To generate AI-powered risk scores and summaries, scoped to
              your workspace. Your data is never used to train shared or
              cross-customer models.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              To monitor reliability, debug errors, and prevent abuse
              through standard application logs and performance monitoring.
            </span>
          </li>
        </ul>
        <p className="pt-2">
          We do not sell personal data, and we don't run third-party ad
          trackers on the marketing site or in the product.
        </p>
      </>
    ),
  },
  {
    id: "subprocessors",
    number: "03",
    title: "Who we share it with",
    body: (
      <>
        <p>
          A short list of subprocessors - the vendors we rely on to operate
          Sentinel. Each one receives only the data it needs to do its job.
        </p>
        <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {[
            {
              label: "Vercel",
              detail: "Application hosting and edge delivery.",
            },
            {
              label: "Managed Postgres",
              detail:
                "Production database with daily backups and point-in-time recovery.",
            },
            {
              label: "Clerk",
              detail:
                "User authentication and session management. Passwords never touch our servers.",
            },
            {
              label: "PayPal",
              detail:
                "Subscription billing. Card details are handled by PayPal, not by us.",
            },
            {
              label: "Sentry",
              detail:
                "Application error and performance monitoring. Scrubs known secret patterns before ingestion.",
            },
            {
              label: "Upstash",
              detail:
                "Rate limiting and ephemeral storage. No durable workspace data stored here.",
            },
            {
              label: "AI providers",
              detail:
                "Scoped per-request inference. No training on your data.",
            },
          ].map((row) => (
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
      </>
    ),
  },
  {
    id: "security",
    number: "04",
    title: "Security",
    body: (
      <>
        <p>
          All traffic uses TLS 1.2+. Integration tokens and webhook secrets
          are encrypted at rest in the database. Content-Security-Policy
          and Permissions-Policy headers are set strictly on every
          response, and rate limiting runs on all mutating routes.
        </p>
        <p className="pt-3">
          No transmission or storage system is perfect. We design for
          minimal exposure: least-privilege, scoped integration credentials
          that can be rotated without a full reconnect, and deletion that
          propagates within 24 hours. Details live on the{" "}
          <Link
            href="/security"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            security
          </Link>{" "}
          page.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    number: "05",
    title: "Retention",
    body: (
      <>
        <p>
          We keep workspace data for as long as your account is active.
          When you delete your account, we:
        </p>
        <ul className="space-y-3 pt-2">
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              Revoke and delete all integration tokens and webhook secrets
              within 24 hours.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              Delete your user-scoped records and workspace content within
              30 days.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden
              className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
            />
            <span>
              Retain a minimal set of billing and audit records only for as
              long as required by law.
            </span>
          </li>
        </ul>
        <p className="pt-2">
          Webhook delivery logs are kept for 30 days regardless of account
          status so you can audit recent deliveries.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    number: "06",
    title: "Your rights",
    body: (
      <>
        <p>
          You can access, export, correct, or delete your data at any time
          - most of it from Settings inside the product. Data export is
          available in CSV or JSON. To delete your account entirely or
          request an out-of-band export, email{" "}
          <a
            href="mailto:help@sentinels.in"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            help@sentinels.in
          </a>{" "}
          and we'll handle it within 7 business days.
        </p>
        <p className="pt-3">
          You can opt out of marketing email at any time from the email
          footer or the Settings page. Transactional and security email
          cannot be opted out of while your account is active.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    number: "07",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy as the product changes. Material
          changes will be announced by email and with a banner in-product
          at least 30 days before they take effect. The{" "}
          <span className="font-mono text-xs text-white/60">Last updated</span>{" "}
          date at the top of this page always reflects the most recent
          revision.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    number: "08",
    title: "Contact",
    body: (
      <>
        <p>
          Privacy questions, deletion requests, and responsible-disclosure
          reports all go to{" "}
          <a
            href="mailto:help@sentinels.in"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            help@sentinels.in
          </a>
          . Replies come from a human, usually within one business day.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Privacy policy, written in plain English.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            What we collect, why we collect it, who touches it, and how to
            delete it. No dark patterns, no footnotes in 8pt type.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Last updated {lastUpdated}</span>
            <span className="text-white/20">·</span>
            <a
              href="mailto:help@sentinels.in"
              className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
            >
              help@sentinels.in
            </a>
          </div>

          <nav aria-label="Table of contents" className="mt-10">
            <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex items-baseline gap-2 text-white/50 hover:text-white transition-colors"
                  >
                    <span className="font-mono text-xs text-white/35">
                      {s.number}
                    </span>
                    <span>{s.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto space-y-14">
          {sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="border-t border-white/10 pt-10 scroll-mt-24"
            >
              <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 pt-2">
                  {section.number}
                </div>
                <div>
                  <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-5">
                    {section.title}
                  </h2>
                  <div className="text-white/75 leading-relaxed space-y-3 max-w-2xl">
                    {section.body}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
