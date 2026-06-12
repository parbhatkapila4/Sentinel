import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colophon · Sentinel",
  description:
    "The stack, typography, and people behind Sentinel. No sponsorships, no inflated credits - just the tools we actually use.",
};

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
          href="/changelog"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Changelog →
        </Link>
      </div>
    </div>
  );
}

type StackEntry = { name: string; detail: string; version?: string };

const runtime: StackEntry[] = [
  { name: "Next.js", version: "16.1.1", detail: "App Router, server components, and route handlers." },
  { name: "React", version: "19.2.3", detail: "UI layer. The React Compiler is enabled for this build." },
  { name: "TypeScript", version: "5.x", detail: "Strict mode on. No implicit any." },
  { name: "Tailwind CSS", version: "4.x", detail: "Utility styles for marketing and legal surfaces." },
];

const data: StackEntry[] = [
  { name: "PostgreSQL", detail: "Single source of truth for deals, users, teams, integrations, and webhook logs." },
  { name: "Prisma", version: "6.x", detail: "Type-safe access layer. Schema lives in the repo; migrations are committed." },
  { name: "Upstash Redis", detail: "Rate limiting on API routes and cache for expensive reads." },
];

const auth: StackEntry[] = [
  { name: "Clerk", detail: "Authentication, session management, and the Google sign-in button on the home page." },
];

const integrations: StackEntry[] = [
  { name: "Salesforce", detail: "Read-only OAuth connect for Opportunity sync. Nothing is written back to Salesforce." },
  { name: "HubSpot", detail: "Portal-scoped OAuth connect for Deals, Contacts, and Companies. Read-only." },
  { name: "Google Calendar", detail: "Read-only OAuth for event-to-deal attribution." },
  { name: "Slack", detail: "OAuth app that ingests channel messages and posts alerts and digests." },
];

const observability: StackEntry[] = [
  { name: "Sentry", detail: "Error reporting and performance tracing across the full request path." },
  { name: "Vercel Cron", detail: "Scheduled CRM and Calendar syncs, narrowed to the Hobby plan limits." },
  { name: "Resend", detail: "Transactional email for stage changes, at-risk alerts, and team invites." },
];

const ui: StackEntry[] = [
  { name: "Three.js + three-globe", detail: "The rotating globe on the landing page. Rendered with @react-three/fiber." },
  { name: "Framer Motion", detail: "Small, purposeful motion on marketing surfaces." },
  { name: "date-fns", detail: "Date math and formatting. No moment." },
  { name: "Zod", detail: "Runtime schemas for every API boundary." },
  { name: "jsPDF", detail: "PDF export for reports and deal summaries." },
];

const quality: StackEntry[] = [
  { name: "Vitest", detail: "Unit tests with v8 coverage." },
  { name: "Playwright", detail: "End-to-end tests covering the Dashboard and Deals flows." },
  { name: "ESLint 9", detail: "Custom rules guard the editorial dashboard theme against drift." },
];

const typography = [
  {
    role: "Display",
    face: "Instrument Serif",
    fallback: "Times New Roman, Georgia",
    detail: "Italic for mastheads and editorial moments. Roman for section titles.",
  },
  {
    role: "Text",
    face: "Inter",
    fallback: "Segoe UI, Roboto, Helvetica",
    detail: "Body copy and UI labels.",
  },
  {
    role: "Meta",
    face: "JetBrains Mono",
    fallback: "SF Mono, ui-monospace",
    detail: "Kickers, tabular numbers, ticker, and keyboard keys.",
  },
];

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-6 lg:px-8 pb-20">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-[96px_1fr] gap-8 items-start">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 pt-1">
              {kicker}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-8 leading-tight">
              {title}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function StackList({ items }: { items: StackEntry[] }) {
  return (
    <ul className="divide-y divide-white/5 border-y border-white/5">
      {items.map((item) => (
        <li
          key={item.name}
          className="py-4 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-white font-medium">{item.name}</span>
            {item.version && (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                {item.version}
              </span>
            )}
          </div>
          <p className="text-white/65 leading-relaxed text-[15px]">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export default function ColophonPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Colophon
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            What Sentinel is made of.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Every dependency on this page is in{" "}
            <code className="font-mono text-[13px] text-white/80">package.json</code>.
            No inflated stack, no imaginary vendors. If it&apos;s listed below,
            it&apos;s running in production right now.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Last verified against main · April 2026</span>
          </div>
        </div>
      </section>

      <Section id="runtime" kicker="01" title="Runtime">
        <StackList items={runtime} />
      </Section>

      <Section id="data" kicker="02" title="Data">
        <StackList items={data} />
      </Section>

      <Section id="auth" kicker="03" title="Authentication">
        <StackList items={auth} />
      </Section>

      <Section id="integrations" kicker="04" title="Integrations">
        <StackList items={integrations} />
        <p className="mt-5 text-sm text-white/50 leading-relaxed">
          Each integration is read-only by default. See{" "}
          <Link href="/security" className="text-white/80 underline underline-offset-2 hover:text-white">
            Security
          </Link>{" "}
          for the exact credential scopes we request.
        </p>
      </Section>

      <Section id="infra" kicker="05" title="Infrastructure &amp; delivery">
        <StackList items={observability} />
      </Section>

      <Section id="ui" kicker="06" title="UI &amp; visual">
        <StackList items={ui} />
      </Section>

      <Section id="quality" kicker="07" title="Quality">
        <StackList items={quality} />
      </Section>

      <Section id="typography" kicker="08" title="Typography">
        <ul className="divide-y divide-white/5 border-y border-white/5">
          {typography.map((t) => (
            <li
              key={t.role}
              className="py-5 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 pt-1">
                {t.role}
              </div>
              <div>
                <div
                  className={
                    t.role === "Meta"
                      ? "font-mono text-white text-lg"
                      : "text-white text-xl"
                  }
                  style={
                    t.role === "Display"
                      ? { fontFamily: "var(--font-instrument-serif)", fontStyle: "italic" }
                      : undefined
                  }
                >
                  {t.face}
                </div>
                <div className="text-white/50 text-sm mt-1">
                  Fallback: {t.fallback}
                </div>
                <p className="text-white/65 leading-relaxed text-[15px] mt-2 max-w-xl">
                  {t.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="name" kicker="09" title="The name">
        <p className="text-white/75 leading-relaxed text-[17px] mb-4">
          A sentinel is someone who keeps watch while others do the work.
          That&apos;s the job here: pull signal out of your CRM, your calendar,
          and your inbox, and surface only the things that need a human.
        </p>
        <p className="text-white/55 leading-relaxed text-[15px]">
          The editorial language (issues, desks, wires, kickers) is borrowed
          from print newsrooms because their information design problem is the
          same one a sales org has: too many signals, not enough attention,
          deadlines that don&apos;t move.
        </p>
      </Section>

      <Section id="author" kicker="10" title="Built by">
        <p className="text-white/75 leading-relaxed text-[17px] mb-6">
          Sentinel is designed, written, and operated by{" "}
          <span className="text-white font-medium">Parbhat Kapila</span>. One
          person wrote every line of code in the repository, every page on this
          site, and every commit in the changelog.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <a
            href="https://github.com/parbhatkapila4/Sentinel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white underline underline-offset-4"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/parbhat-kapila/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white underline underline-offset-4"
          >
            LinkedIn
          </a>
          <a
            href="https://x.com/Parbhat03"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white underline underline-offset-4"
          >
            Twitter / X
          </a>
          <Link
            href="/contact"
            className="text-white/70 hover:text-white underline underline-offset-4"
          >
            Email
          </Link>
        </div>
      </Section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-white/60 text-sm max-w-md">
            Noticed something on this page that doesn&apos;t match what&apos;s
            actually running? That&apos;s a bug - tell me and I&apos;ll fix it.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-md text-sm hover:border-white/30 transition-colors w-fit"
          >
            Report a discrepancy →
          </Link>
        </div>
      </section>
    </div>
  );
}
