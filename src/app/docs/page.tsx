import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-y-auto">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
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
            Back
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/api-docs"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              API Reference
            </Link>
            <Link
              href="/docs/developers"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Developer Docs
            </Link>
            <Link
              href="/shortcuts"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Shortcuts
            </Link>
          </div>
        </div>
      </div>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-[1700px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Documentation
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel is a revenue-intelligence workspace built around one idea:
            risk should be derived from activity, not assigned by a forecast
            committee. This page covers the model and the day-to-day workflow.
            For API specs, see the{" "}
            <Link href="/api-docs" className="text-white underline">
              reference
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-12">
        <div className="max-w-[1700px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickLink
            href="#concepts"
            title="Core concepts"
            sub="Risk score, stages, and timeline events"
          />
          <QuickLink
            href="#workflow"
            title="Daily workflow"
            sub="From morning brief to deal review"
          />
          <QuickLink
            href="#stages"
            title="Pipeline stages"
            sub="Discovery → Closed-won/lost"
          />
          <QuickLink
            href="#events"
            title="Timeline events"
            sub="What feeds the risk engine"
          />
          <QuickLink
            href="#integrations"
            title="Integrations"
            sub="HubSpot, Salesforce, Calendar, Slack"
          />
          <QuickLink
            href="#faq"
            title="FAQ"
            sub="Privacy, data handling, deletions"
          />
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto space-y-16">
          <DocSection id="concepts" title="Core concepts">
            <p>
              Every deal carries a risk score from 0 to 1. The score is
              recomputed on read from three signals: time-in-stage, recent
              activity, and engagement decay. Nothing is stored as a black-box
              prediction — open any deal and the reasoning is cited inline.
            </p>
            <p>
              Risk lives separately from stage. A deal in <code>negotiation</code>{" "}
              with no activity for two weeks reads <em>high risk</em> even
              though the stage looks healthy. That gap is what Sentinel is for.
            </p>
            <Bullets
              items={[
                "Risk score: 0–1 composite, recomputed on every read.",
                "Risk reasons: human-readable strings explaining each contribution.",
                "Activity decay: scored against the deal's own baseline, not a global rule.",
                "Source data: timeline events you log + integration sync.",
              ]}
            />
          </DocSection>

          <DocSection id="workflow" title="Daily workflow">
            <p>
              Open <Link href="/dashboard" className="text-white underline">
                /dashboard
              </Link>
              . The Morning Brief surfaces deals that crossed a risk threshold
              overnight, scheduled meetings, and outstanding actions. Click any
              deal to see its timeline, last activity, and the reasons behind
              its score.
            </p>
            <Bullets
              items={[
                "Triage at-risk deals first — they're sorted to the top of the desk.",
                "Add a timeline event after every call, email, or proposal.",
                "Use ⌘+K to jump anywhere; full shortcut list at /shortcuts.",
                "Ask the AI workspace at /insights for cross-deal patterns.",
              ]}
            />
          </DocSection>

          <DocSection id="stages" title="Pipeline stages">
            <p>
              Sentinel uses a six-stage canonical model. Integration syncs map
              provider-specific stages into this set, so reports work across
              CRMs.
            </p>
            <StageList />
          </DocSection>

          <DocSection id="events" title="Timeline events">
            <p>
              Events are the input the risk engine reads from. Anything missing
              from a deal&apos;s timeline is missing from its score, so log
              promptly — memory degrades fast.
            </p>
            <Bullets
              items={[
                "Meeting scheduled / completed — strong forward signal.",
                "Email sent / received — recurring engagement signal.",
                "Proposal sent — milestone marker before negotiation.",
                "Note / call summary — narrative the AI can reason over.",
                "Stage changed — recorded automatically with timestamp.",
              ]}
            />
          </DocSection>

          <DocSection id="integrations" title="Integrations">
            <p>
              Sentinel is read-only against every integrated system — it never
              writes back into your CRM or calendar. Connect from{" "}
              <Link
                href="/settings?tab=integrations"
                className="text-white underline"
              >
                /settings → Integrations
              </Link>
              .
            </p>
            <IntegrationGrid />
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <Faq
              q="Where is my data stored?"
              a="Postgres database under your account. Integration credentials are encrypted at rest with AES-256-GCM. Deletion runs immediately when requested — no retention period."
            />
            <Faq
              q="Does Sentinel train on my data?"
              a="No. Pipeline data is never used to train shared models. AI requests go through OpenRouter with per-deal context only."
            />
            <Faq
              q="Is there a phone number for support?"
              a="No. Sentinel is run by one person, so synchronous channels would be closed more often than open. Email and GitHub issues are the support paths — both get answered."
            />
            <Faq
              q="What's the SLA?"
              a="No contractual SLA. Response targets on the support page are what we hit in practice; we don't promise tiers we can't honor."
            />
            <Faq
              q="How do I delete my account?"
              a="/settings → Danger zone → Delete account. Removes everything, revokes integration tokens, runs immediately."
            />
          </DocSection>

          <div className="border-t border-white/10 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                Need something more specific?
              </h3>
              <p className="text-white/60">
                The API reference and developer docs cover everything below the
                UI.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/api-docs"
                className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
              >
                API reference →
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 border border-white/20 text-white rounded-md text-sm font-medium hover:border-white/40 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 border border-white/10 hover:border-white/30 transition-colors rounded-md"
    >
      <div className="text-white font-medium text-sm mb-1">{title}</div>
      <div className="text-white/55 text-xs leading-relaxed">{sub}</div>
    </Link>
  );
}

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
        {title}
      </h2>
      <div className="space-y-4 text-white/75 leading-relaxed">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-white/70 text-[15px] leading-relaxed list-none pl-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            aria-hidden
            className="text-white/30 mt-1 text-xs font-mono shrink-0"
          >
            ─
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StageList() {
  const stages = [
    { name: "Discovery", note: "Initial fit assessment, qualifying questions." },
    { name: "Qualify", note: "Budget, authority, need, timeline confirmed." },
    { name: "Proposal", note: "Quote or proposal delivered." },
    { name: "Negotiation", note: "Active terms / pricing discussion." },
    { name: "Closed-won", note: "Contract signed." },
    { name: "Closed-lost", note: "Deal will not close." },
  ];
  return (
    <ol className="space-y-2 text-[15px]">
      {stages.map((s, i) => (
        <li
          key={s.name}
          className="grid grid-cols-[24px_140px_1fr] gap-3 items-baseline"
        >
          <span className="text-white/30 font-mono text-xs">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-white font-medium">{s.name}</span>
          <span className="text-white/60">{s.note}</span>
        </li>
      ))}
    </ol>
  );
}

function IntegrationGrid() {
  const items = [
    {
      name: "HubSpot",
      mode: "Private app token",
      note: "Sync deals, contacts, and stage history.",
    },
    {
      name: "Salesforce",
      mode: "API key + instance URL",
      note: "Opportunities and account context.",
    },
    {
      name: "Google Calendar",
      mode: "API key (public calendar)",
      note: "Auto-link meetings to deals by attendee or title.",
    },
    {
      name: "Gmail",
      mode: "OAuth (read-only)",
      note: "Thread-level engagement signals + sentiment.",
    },
    {
      name: "Slack",
      mode: "Incoming webhook",
      note: "Outbound notifications only — at-risk, won, stage changes.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.name}
          className="p-4 border border-white/10 rounded-md"
        >
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-white font-medium">{it.name}</div>
            <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
              {it.mode}
            </div>
          </div>
          <div className="text-white/60 text-sm">{it.note}</div>
        </div>
      ))}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="border-b border-white/10 py-4 group">
      <summary className="cursor-pointer text-white font-medium text-[15px] flex items-center justify-between gap-4 list-none">
        <span>{q}</span>
        <span
          aria-hidden
          className="text-white/40 group-open:rotate-45 transition-transform"
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-white/65 text-[15px] leading-relaxed">{a}</p>
    </details>
  );
}
