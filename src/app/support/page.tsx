import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support · Sentinel",
  description:
    "How to get help with Sentinel. No tiers, no SLAs we can't honor - just the real channels and what to expect from each one.",
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
          href="/contact"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Contact →
        </Link>
      </div>
    </div>
  );
}

type Channel = {
  title: string;
  href: string;
  external?: boolean;
  label: string;
  best: string;
  responseTime: string;
  detail: string;
};

const channels: Channel[] = [
  {
    title: "Email the author",
    href: "/contact",
    label: "Open contact form",
    best: "Anything - feature requests, account issues, invoicing questions, feedback on copy.",
    responseTime: "Within 1-2 business days.",
    detail:
      "The contact form opens your mail client with a pre-written draft. It reaches the same inbox as everything else, so please use it unless you specifically need GitHub.",
  },
  {
    title: "File a GitHub issue",
    href: "https://github.com/parbhatkapila4/Sentinel/issues/new",
    external: true,
    label: "Open new issue",
    best: "Reproducible bugs with steps, stack traces, or screenshots. Regressions against the latest main.",
    responseTime: "Triaged within a few days.",
    detail:
      "Public issues are easiest because other people can search them later. If your report contains account IDs or anything sensitive, email instead.",
  },
  {
    title: "Security disclosure",
    href: "/security",
    label: "Read the security page",
    best: "Vulnerabilities, suspected token leaks, anything you would rather not post publicly.",
    responseTime: "Acknowledged within 72 hours.",
    detail:
      "Please do not open a public GitHub issue for security reports. Use the contact form with the subject line [security] and a brief description. We coordinate a fix before any public write-up.",
  },
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "Is there a support phone number or chat?",
    a: "No. Sentinel is run by one person, so realtime channels would be closed more often than they were open. Email and GitHub get answered; a phone that goes to voicemail wouldn't.",
  },
  {
    q: "Do you have an SLA?",
    a: "Not a contractual one. Response targets on this page are what we hit in practice, but we won't promise uptime tiers or credit schedules we can't back up.",
  },
  {
    q: "Where do I check if Sentinel is down?",
    a: "We don't run a status page yet. If the app isn't responding, it usually means Vercel, Clerk, or the database provider is having an incident - check their status pages. Outages get logged in the changelog once they're resolved.",
  },
  {
    q: "Where's the documentation?",
    a: "Product documentation lives under /docs. The /api-docs page has an interactive Swagger view of the REST API. Keyboard shortcuts are on /shortcuts. Everything else is on /resources.",
  },
  {
    q: "How do I cancel or delete my account?",
    a: "Paid plans cancel from /settings · Billing. Account deletion (including revocation of integration tokens) is handled from /settings · Account. Email us if anything gets stuck.",
  },
  {
    q: "You replied and then went silent for a week.",
    a: "That's on me. Nudge the same thread - you won't be annoying. Dropped replies are almost always accidental.",
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
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-7 leading-tight">
              {title}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  const linkProps = channel.external
    ? {
      href: channel.href,
      target: "_blank",
      rel: "noopener noreferrer",
    }
    : { href: channel.href };

  return (
    <div className="border border-white/10 rounded-lg p-6 flex flex-col gap-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          {channel.title}
        </h3>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-y-3 gap-x-5 text-sm">
        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 pt-1">
          Best for
        </dt>
        <dd className="text-white/75 leading-relaxed">{channel.best}</dd>

        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 pt-1">
          Response
        </dt>
        <dd className="text-white/75 leading-relaxed">{channel.responseTime}</dd>

        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 pt-1">
          Notes
        </dt>
        <dd className="text-white/60 leading-relaxed">{channel.detail}</dd>
      </dl>

      {channel.external ? (
        <a
          {...linkProps}
          className="inline-flex w-fit items-center gap-2 mt-1 text-sm text-white/85 border-b border-white/30 hover:border-white pb-[2px] transition-colors"
        >
          {channel.label} →
        </a>
      ) : (
        <Link
          href={channel.href}
          className="inline-flex w-fit items-center gap-2 mt-1 text-sm text-white/85 border-b border-white/30 hover:border-white pb-[2px] transition-colors"
        >
          {channel.label} →
        </Link>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Support
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Real channels. Real response times.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel doesn&apos;t have a support org behind it - it has one
            person. This page is an honest inventory of how to get help and
            what you can actually expect back.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Business days · Europe / Asia timezones</span>
            <span className="text-white/20">·</span>
            <span>No paid support tiers</span>
          </div>
        </div>
      </section>

      <Section id="channels" kicker="01" title="How to reach us">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {channels.map((c) => (
            <ChannelCard key={c.title} channel={c} />
          ))}
        </div>
      </Section>

      <Section id="before" kicker="02" title="Before you write in">
        <p className="text-white/70 leading-relaxed text-[16px] mb-6 max-w-2xl">
          Most questions have a faster answer than an email round-trip. Worth
          checking first:
        </p>
        <ul className="divide-y divide-white/5 border-y border-white/5">
          {[
            {
              label: "Docs",
              href: "/docs",
              detail: "Walkthroughs for integrations, deal lifecycle, teams, and webhooks.",
            },
            {
              label: "API reference",
              href: "/api-docs",
              detail: "Interactive Swagger UI with every endpoint, its params, and response shape.",
            },
            {
              label: "Shortcuts",
              href: "/shortcuts",
              detail: "Every keyboard binding, verified against the source.",
            },
            {
              label: "Changelog",
              href: "/changelog",
              detail: "What shipped, when - in case your bug was already fixed in a recent release.",
            },
            {
              label: "Security",
              href: "/security",
              detail: "Credential scopes, encryption, deletion, and things we deliberately don&apos;t do.",
            },
          ].map((r) => (
            <li
              key={r.label}
              className="py-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-6"
            >
              <Link
                href={r.href}
                className="text-white font-medium hover:underline underline-offset-4"
              >
                {r.label} →
              </Link>
              <p className="text-white/65 leading-relaxed text-[15px]">
                {r.detail}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="faq" kicker="03" title="Honest answers to obvious questions">
        <ul className="divide-y divide-white/5 border-y border-white/5">
          {faqs.map((f) => (
            <li key={f.q} className="py-6">
              <h3 className="text-white font-medium text-[17px] mb-2 tracking-tight">
                {f.q}
              </h3>
              <p className="text-white/65 leading-relaxed max-w-2xl">{f.a}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="community" kicker="04" title="Public repositories">
        <p className="text-white/70 leading-relaxed text-[16px] mb-5 max-w-2xl">
          Sentinel is developed in the open. You can watch changes land in real
          time, open pull requests, or fork it for your own internal tools.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/parbhatkapila4/Sentinel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-md text-sm hover:border-white/30 transition-colors"
          >
            GitHub repository →
          </a>
          <a
            href="https://github.com/parbhatkapila4/Sentinel/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-md text-sm hover:border-white/30 transition-colors"
          >
            Open issues →
          </a>
          <a
            href="https://github.com/parbhatkapila4/Sentinel/commits/main"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-md text-sm hover:border-white/30 transition-colors"
          >
            Commit history →
          </a>
        </div>
      </Section>
    </div>
  );
}
