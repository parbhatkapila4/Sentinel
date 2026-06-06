import type { Metadata } from "next";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Guides · Sentinel",
  description:
    "A directory of everything you need to understand, adopt, and build on top of Sentinel.",
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
          href="/docs"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Full documentation →
        </Link>
      </div>
    </div>
  );
}

type ResourceEntry = {
  href: string;
  kicker: string;
  title: string;
  description: string;
  meta: string;
  external?: boolean;
};

type ResourceGroup = {
  id: string;
  label: string;
  intro: string;
  entries: ResourceEntry[];
};

const groups: ResourceGroup[] = [
  {
    id: "start-here",
    label: "Start here",
    intro:
      "The fastest path from reading about Sentinel to running it against your own pipeline.",
    entries: [
      {
        href: "/features",
        kicker: "Overview",
        title: "What Sentinel does",
        description:
          "Eight product pillars covering risk scoring, pipeline management, activity timelines, AI assistance, and the developer surface.",
        meta: "6-7 min read",
      },
      {
        href: "/docs",
        kicker: "Docs",
        title: "Documentation",
        description:
          "Setup, concepts, and reference material for the product. The long-form manual.",
        meta: "Reference",
      },
      {
        href: "/integrations",
        kicker: "Connect",
        title: "Integrations catalog",
        description:
          "Salesforce, HubSpot, Google Calendar, Slack, and signed outbound webhooks - with exact scopes and direction per integration.",
        meta: "5 integrations",
      },
    ],
  },
  {
    id: "build-on-it",
    label: "Build on Sentinel",
    intro:
      "Everything you need to wire Sentinel into the rest of your stack, write automations, and audit what flows through.",
    entries: [
      {
        href: "/api-docs",
        kicker: "API",
        title: "API reference",
        description:
          "Interactive OpenAPI / Swagger explorer. Endpoints for deals, teams, integrations, webhooks, and notifications.",
        meta: "Interactive",
      },
      {
        href: "/integrations#webhooks",
        kicker: "Webhooks",
        title: "Outbound webhooks",
        description:
          "HMAC-SHA256 signed deliveries, retries with backoff, and a 30-day inspection log of every attempt and response.",
        meta: "HMAC-SHA256",
      },
      {
        href: "/security",
        kicker: "Trust",
        title: "Security posture",
        description:
          "How we handle tokens, what we encrypt, and what we explicitly do not claim. Written without compliance theater.",
        meta: "Plain English",
      },
    ],
  },
  {
    id: "stay-current",
    label: "Stay current",
    intro:
      "How Sentinel is evolving, where to track it, and how to reach a human when you have questions.",
    entries: [
      {
        href: "/changelog",
        kicker: "Ship log",
        title: "Changelog",
        description:
          "Every shipped change, mapped to a real commit on main. No synthetic version numbers or marketing bundles.",
        meta: "Updated continuously",
      },
      {
        href: "/about",
        kicker: "People",
        title: "About Sentinel",
        description:
          "Why this exists, the problem it's built around, and a founder's note that gets replied to.",
        meta: "Founder-written",
      },
      {
        href: "/contact",
        kicker: "Talk",
        title: "Get in touch",
        description:
          "Product questions, bug reports, integration requests, or just to say hi. Every email lands in Parbhat's inbox.",
        meta: "help@sentinels.in",
      },
    ],
  },
  {
    id: "legal",
    label: "Legal & account",
    intro:
      "The fine print, the pricing, and the switches that control your own data.",
    entries: [
      {
        href: "/pricing",
        kicker: "Plans",
        title: "Pricing",
        description:
          "Starter, Professional, and Enterprise. Monthly or annual, tax included, cancel any time via PayPal.",
        meta: "3 tiers",
      },
      {
        href: "/privacy",
        kicker: "Data",
        title: "Privacy policy",
        description:
          "What we collect, which subprocessors touch it, how long it lives, and how to delete it within 24 hours.",
        meta: "Updated Jan 2026",
      },
      {
        href: "/terms",
        kicker: "Agreement",
        title: "Terms of service",
        description:
          "The agreement between you and Sentinel, written to be read by humans and scoped to how the product actually works.",
        meta: "11 sections",
      },
    ],
  },
];

function ResourceLink({ entry }: { entry: ResourceEntry }) {
  const isExternal = entry.external || entry.href.startsWith("http");
  const Comp = isExternal ? "a" : Link;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {};

  return (
    <Comp
      href={entry.href}
      {...externalProps}
      className="group block border-t border-white/10 py-7 transition-colors hover:bg-white/2"
    >
      <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 md:gap-8 md:items-baseline">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {entry.kicker}
        </div>
        <div className="max-w-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight mb-1.5 group-hover:underline underline-offset-4 decoration-white/40">
            {entry.title}
          </h3>
          <p className="text-white/65 leading-relaxed">{entry.description}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-white/40 md:justify-end">
          <span>{entry.meta}</span>
          <span
            aria-hidden
            className="inline-block transition-transform group-hover:translate-x-0.5 text-white/50"
          >
            →
          </span>
        </div>
      </div>
    </Comp>
  );
}

export default async function ResourcesPage() {
  const user = await isAuthenticated();
  const totalEntries = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Guides
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Everything Sentinel, in one directory.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            A curated index of the pages, references, and reading material
            that actually exist in the product today. No lorem ipsum, no
            placeholder "blog posts" - just routes that go somewhere useful.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>{totalEntries} entries</span>
            <span className="text-white/20">·</span>
            <span>{groups.length} sections</span>
            <span className="text-white/20">·</span>
            <span>All routes live</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {groups.map((group) => (
            <div key={group.id} id={group.id} className="scroll-mt-24">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 mb-2">
                <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 pt-1">
                  {group.label}
                </h2>
                <p className="text-white/60 leading-relaxed max-w-xl">
                  {group.intro}
                </p>
              </div>
              <div className="mt-6 border-b border-white/10">
                {group.entries.map((entry) => (
                  <ResourceLink key={entry.href + entry.title} entry={entry} />
                ))}
              </div>
            </div>
          ))}
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
                {user
                  ? "Already signed in. Head back to what you were doing."
                  : "Want the shortest path? Start with the product."}
              </h2>
              <p className="text-white/60 leading-relaxed max-w-xl">
                {user
                  ? "Your dashboard shows today's risk distribution, deals that went quiet, and the next actions Sentinel suggests."
                  : "Starter is free and runs the same risk engine on your live pipeline. No demo data, no waitlist."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    href="/deals/new"
                    className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-5 py-2.5 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
                  >
                    Create a deal
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-5 py-2.5 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
                  >
                    See what it does
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
