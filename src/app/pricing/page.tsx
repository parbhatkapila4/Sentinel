import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";

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
          See features →
        </Link>
      </div>
    </div>
  );
}

const principles = [
  {
    label: "Free stays free",
    body:
      "Starter is free and usable, not a crippled demo. 5 active deals, real risk scoring, one integration, one webhook - enough to run a small book or evaluate the product against live data.",
  },
  {
    label: "One price, tax included",
    body:
      "What you see is what your card is charged. No onboarding fees, no per-seat add-ons sneaking in at renewal. Monthly billing, cancel any time.",
  },
  {
    label: "No lock-in",
    body:
      "Cancel whenever. Your deals, timeline, and notes are yours and exportable to CSV or JSON at any time. Deleting the account revokes integration tokens within 24 hours.",
  },
  {
    label: "Paid via PayPal",
    body:
      "Payments run through PayPal so we never store your card. Subscriptions are managed in your PayPal account with standard cancellation controls.",
  },
];

const faqs = [
  {
    q: "What happens when I hit a plan limit?",
    a: "You'll see a clear banner before you hit it and a block when you're over - never a silent overage charge. You can upgrade in place, and your deals and history come with you.",
  },
  {
    q: "Can I try Professional before subscribing?",
    a: "The Starter plan already runs the same risk engine against your real pipeline. If you need Professional features for evaluation, email us and we'll enable them on your workspace while you decide.",
  },
  {
    q: "How does Enterprise actually work?",
    a: "For teams that need custom scopes, larger sync windows, or contractual terms beyond the standard agreement, we handle those case-by-case. The listed Enterprise price is a starting point - real scoping happens over a short call.",
  },
  {
    q: "Do you offer discounts?",
    a: "We don't run public coupon codes. For nonprofits, academic use, and early-stage startups, reach out and we'll do right by you.",
  },
];

export default function PricingPage() {
  return (
      <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <BackLink />

        <section className="px-6 lg:px-8 pt-20 pb-12">
          <div className="max-w-[1700px] mx-auto">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
              Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
              Priced to be used, not to be negotiated.
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              Three plans. One honest price per tier with tax included. Start
              free, upgrade when the book grows, cancel whenever you like.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
              <span>Starter · Professional · Enterprise</span>
              <span className="text-white/20">·</span>
              <span>Monthly billing</span>
              <span className="text-white/20">·</span>
              <span>No lock-in, cancel anytime</span>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
            <PricingCards />
          </div>
        </section>

        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-14">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
              How we think about pricing
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
                    <p className="text-white/65 leading-relaxed max-w-md">
                      {p.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 pb-20">
          <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-14">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
              Common questions
            </h2>
            <dl className="divide-y divide-white/10 border-y border-white/10">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-10 py-6"
                >
                  <dt className="text-white font-semibold tracking-tight leading-snug">
                    {faq.q}
                  </dt>
                  <dd className="text-white/70 leading-relaxed">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
  );
}
