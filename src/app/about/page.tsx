import type { Metadata } from "next";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "About · Sentinel",
  description:
    "Why Sentinel exists, what problem it solves, and who's building it. Written by the founder, not marketing.",
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
          Get in touch →
        </Link>
      </div>
    </div>
  );
}

const principles = [
  {
    label: "Act early, not after",
    body:
      "Most CRMs are rear-view mirrors. They tell you what happened, not what's about to. Sentinel reads the same signals your team is already generating and surfaces the risk while you can still do something about it.",
  },
  {
    label: "Explainable by default",
    body:
      "Every risk score carries plain-English reasons. No opaque AI black box. If Sentinel flags a deal, it tells you exactly which signals triggered the flag, and you can override it.",
  },
  {
    label: "Read-mostly by design",
    body:
      "We don't want to own your CRM. Sentinel reads pipeline state, keeps the risk context it generates inside the Sentinel workspace, and never writes back to your CRM, sends mail from your domain, or changes your pipeline structure.",
  },
  {
    label: "Paid, not venture-priced",
    body:
      "Sentinel charges because it should. No investors to grow out of, no quarterly board targets chasing your usage up. The price reflects the cost to run the software well.",
  },
];

export default async function AboutPage() {
  const user = await isAuthenticated();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            About
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            A revenue tool that actually reads the signals your pipeline is
            already sending.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel is a small, independent product built for revenue teams
            who are tired of learning about lost deals in the postmortem. It
            lives next to your CRM, not on top of it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Independent, bootstrapped</span>
            <span className="text-white/20">·</span>
            <span>Shipping since Jan 2026</span>
            <span className="text-white/20">·</span>
            <span>Written end-to-end by one engineer</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40">
              What Sentinel does
            </h2>
            <div className="text-white/75 leading-relaxed space-y-4 max-w-2xl">
              <p>
                Sentinel is a revenue-ops layer that sits between your CRM and
                your team. It ingests the activity you&apos;re already tracking -
                emails, meetings, stage transitions - and turns it into two
                things revenue leaders actually need: a composite risk score
                per deal, and a short list of what to do about the ones that
                are slipping.
              </p>
              <p>
                It connects to Salesforce, HubSpot, Google Calendar, and Slack
                out of the box as a read-only layer - nothing is written back
                to your CRM or calendar. The AI that powers it runs scoped to
                your workspace, not trained across customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40">
              The problem
            </h2>
            <div className="text-white/75 leading-relaxed space-y-4 max-w-2xl">
              <p>
                Revenue teams lose deals every day - not because the product
                is wrong or the price is too high, but because the warning
                signs were visible three weeks earlier and nobody was looking
                at them.
              </p>
              <p>
                This is silent decay. A champion goes quiet. A stakeholder
                stops replying. A deal that was in Proposal two months ago
                still is. Traditional CRMs are reactive; they tell you what
                happened yesterday, last week, last month. By the time the
                stall is visible in a dashboard, the relationship has
                typically already cooled and a competitor has stepped in.
              </p>
              <p>
                Sentinel exists to close that gap. Same signals, same data,
                but surfaced while you can still act on them.
              </p>
            </div>
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
              <div key={p.label} className="flex gap-5">
                <span className="font-mono text-xs text-white/30 pt-1 w-6 flex-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-lg tracking-tight mb-2">
                    {p.label}
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
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40">
              Founder&apos;s note
            </h2>
            <div className="max-w-2xl">
              <div className="text-white/80 leading-relaxed space-y-4 text-[17px]">
                <p>
                  Sentinel started after the third time I watched a friend lose
                  a deal that had been clearly cooling for two weeks. The
                  signals were all in the CRM. Nobody was reading them.
                </p>
                <p>
                  So the bet is small and specific: pull the activity that&apos;s
                  already there, score it, surface what&apos;s going quiet. No
                  new data to enter, no separate workflow, no AI that pretends
                  to forecast quarters. Just the gap between &ldquo;the data
                  exists&rdquo; and &ldquo;someone notices in time&rdquo;.
                </p>
                <p>
                  Bugs, feature requests, or anything that broke for you -{" "}
                  <a
                    href="mailto:help@sentinels.in"
                    className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors"
                  >
                    help@sentinels.in
                  </a>{" "}
                  reaches me directly.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/70">
                  PK
                </div>
                <div>
                  <div className="text-sm text-white font-medium">
                    Parbhat Kapila
                  </div>
                  <div className="text-xs text-white/50">
                    Founder & engineer, Sentinel
                  </div>
                </div>
              </div>
            </div>
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
                {user
                  ? "Jump back in and see what moved today."
                  : "Try it against your real pipeline."}
              </h2>
              <p className="text-white/60 leading-relaxed max-w-xl">
                {user
                  ? "Your dashboard shows current risk distribution, deals that went quiet, and the next actions Sentinel suggests."
                  : "Starter is free. It runs the same risk engine on your live data, so evaluation isn't a demo - it's the product."}
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
                    href="/features"
                    className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-5 py-2.5 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
                  >
                    View features
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
  