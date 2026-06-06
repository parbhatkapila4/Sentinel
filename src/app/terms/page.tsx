import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · Sentinel",
  description:
    "The agreement between you and Sentinel. Readable, scoped to how the product actually works.",
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
          href="/privacy"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Privacy policy →
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
    id: "agreement",
    number: "01",
    title: "Agreement",
    body: (
      <>
        <p>
          By accessing or using Sentinel (the "Service"), you agree to
          these Terms of Service ("Terms"). If you don't agree, don't use
          the Service. These Terms apply to every user of every plan,
          including the free Starter plan.
        </p>
        <p className="pt-3">
          If you're using Sentinel on behalf of a company or team, you
          represent that you have the authority to bind that organization
          to these Terms.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    number: "02",
    title: "Accounts",
    body: (
      <>
        <p>
          Account information you provide must be accurate and current.
          You're responsible for maintaining the confidentiality of your
          credentials (managed by Clerk) and for any activity that
          happens under your account.
        </p>
        <p className="pt-3">
          Notify us at{" "}
          <a
            href="mailto:help@sentinels.in"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            help@sentinels.in
          </a>{" "}
          immediately if you suspect unauthorized access. We can disable a
          compromised account while you regain control.
        </p>
      </>
    ),
  },
  {
    id: "license",
    number: "03",
    title: "License to use Sentinel",
    body: (
      <>
        <p>
          We grant you a limited, non-exclusive, non-transferable,
          revocable license to access and use Sentinel for your internal
          business purposes, subject to these Terms and your plan's
          limits.
        </p>
        <p className="pt-3">Under this license you may not:</p>
        <ul className="space-y-3 pt-2">
          {[
            "Reverse engineer, decompile, or attempt to extract the source code of any Sentinel software.",
            "Use the Service to build a directly competing product.",
            "Resell, sublicense, or redistribute access to the Service.",
            "Remove proprietary notices or copyright marks from the Service or its output.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    number: "04",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to use the Service to:</p>
        <ul className="space-y-3 pt-2">
          {[
            "Violate any applicable law, regulation, or third-party right.",
            "Send unsolicited commercial communications or otherwise spam anyone through integrations or webhooks we deliver on your behalf.",
            "Upload malware, probe, scan, or interfere with the Service's security or integrity.",
            "Impersonate another person, team, or organization.",
            "Scrape or harvest data from the Service beyond what the API explicitly supports.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/60"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "your-data",
    number: "05",
    title: "Your data",
    body: (
      <>
        <p>
          You retain all rights to the deals, events, and configuration
          you put into Sentinel (collectively, "Customer Data"). Sentinel
          doesn't claim ownership. You grant us a limited license to
          process Customer Data solely to operate and improve the Service
          for you.
        </p>
        <p className="pt-3">
          How we actually handle Customer Data - storage, security,
          retention, deletion - is described in the{" "}
          <Link
            href="/privacy"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link
            href="/security"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            Security
          </Link>{" "}
          page. Those documents are part of this agreement.
        </p>
      </>
    ),
  },
  {
    id: "subscriptions",
    number: "06",
    title: "Subscriptions and billing",
    body: (
      <>
        <p>
          Paid plans are billed in advance on the billing cycle you
          choose (monthly or annual). Billing is handled by PayPal; we
          don't store your card details.
        </p>
        <p className="pt-3">
          Subscriptions auto-renew at the end of each cycle unless
          cancelled. You can cancel any time from your PayPal account
          or by emailing us; cancellation stops future renewals and
          doesn't refund the current period except where required by
          law.
        </p>
        <p className="pt-3">
          Prices shown on the Pricing page include applicable tax. If
          tax rates or rules change, we may update published prices for
          new cycles with reasonable notice.
        </p>
      </>
    ),
  },
  {
    id: "service-levels",
    number: "07",
    title: "Service levels",
    body: (
      <>
        <p>
          We work hard to keep Sentinel reliable, but the Service is
          provided on an "as-is, as-available" basis. We don't currently
          offer a contractual uptime SLA on the Starter or Professional
          plans. Enterprise customers can request SLA terms as part of
          their agreement.
        </p>
        <p className="pt-3">
          Incidents affecting the Service will be posted to our status
          communication channel and - for material issues - emailed to
          active account holders.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    number: "08",
    title: "Termination",
    body: (
      <>
        <p>
          You can stop using the Service and delete your account at any
          time from Settings, or by emailing{" "}
          <a
            href="mailto:help@sentinels.in"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            help@sentinels.in
          </a>
          . Deletion revokes integration tokens within 24 hours and
          removes workspace data within 30 days.
        </p>
        <p className="pt-3">
          We may suspend or terminate access if you materially breach
          these Terms, if payment fails and isn't resolved, or if
          continuing to provide the Service would violate the law. We'll
          give notice and a reasonable opportunity to cure where
          practical.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    number: "09",
    title: "Disclaimer and liability",
    body: (
      <>
        <p>
          The Service is provided "as is" and "as available" without
          warranties of any kind, whether express or implied, to the
          fullest extent permitted by law. Sentinel does not warrant that
          the Service will be uninterrupted, error-free, or that any risk
          scores or recommendations will be accurate for every deal.
        </p>
        <p className="pt-3">
          To the maximum extent permitted by law, Sentinel's aggregate
          liability arising out of or relating to the Service will not
          exceed the greater of (a) the amount you paid Sentinel in the
          twelve months preceding the claim, or (b) US$100. Sentinel will
          not be liable for indirect, incidental, special, consequential,
          or punitive damages, including lost profits, revenue, or data.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    number: "10",
    title: "Changes to these Terms",
    body: (
      <>
        <p>
          We may update these Terms as the product evolves. Material
          changes will be announced by email and with a banner in-product
          at least 30 days before they take effect. Continued use of
          Sentinel after the effective date means you accept the revised
          Terms.
        </p>
      </>
    ),
  },
  {
    id: "governing",
    number: "11",
    title: "Governing law and contact",
    body: (
      <>
        <p>
          These Terms are governed by the laws of India, excluding
          conflict-of-laws rules. Disputes will be handled in the courts
          of competent jurisdiction where Sentinel is registered.
        </p>
        <p className="pt-3">
          Questions, legal notices, and contract requests:{" "}
          <a
            href="mailto:help@sentinels.in"
            className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            help@sentinels.in
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Terms of service
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            The agreement between you and Sentinel.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Readable on purpose. Scoped to how the product actually works,
            not a generic template. If anything here is unclear, email us
            and we'll explain it in human terms.
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
