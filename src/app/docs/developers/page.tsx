import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer docs · Sentinel",
  description:
    "Authentication, deal API, webhook events, and signed payloads - everything you need to build on top of Sentinel.",
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
          href="/api-docs"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          API reference →
        </Link>
      </div>
    </div>
  );
}

const surfaces = [
  {
    href: "/api-docs",
    label: "API reference",
    description:
      "Interactive OpenAPI explorer. Hit endpoints, see schemas, copy curl.",
    meta: "OpenAPI 3.0",
  },
  {
    href: "#webhooks",
    label: "Webhooks",
    description:
      "Real-time, HMAC-signed event deliveries with retries and a 30-day inspection log.",
    meta: "HMAC-SHA256",
  },
] as const;

type CodeBlock = { language: "bash" | "json" | "javascript"; body: string };
type EventRow = { event: string; description: string };

type GuideSection = {
  kicker: string;
  title: string;
  lede: string;
  meta?: { label: string; value: string }[];
  blocks: Array<
    | { kind: "code"; block: CodeBlock }
    | { kind: "events"; rows: EventRow[] }
  >;
  id?: string;
};

const guides: GuideSection[] = [
  {
    kicker: "01",
    title: "Authentication",
    lede:
      "Every request needs a Bearer token in the Authorization header. Tokens are workspace-scoped - they read and write only the workspace they were issued for.",
    meta: [
      { label: "Header", value: "Authorization: Bearer <token>" },
      { label: "Scope", value: "Workspace" },
      { label: "Rotation", value: "Manual via settings" },
    ],
    blocks: [
      {
        kind: "code",
        block: {
          language: "bash",
          body: `curl -X GET "https://api.sentinel.dev/api/deals" \\
  -H "Authorization: Bearer your_api_token" \\
  -H "Content-Type: application/json"`,
        },
      },
    ],
  },
  {
    kicker: "02",
    title: "List deals",
    lede:
      "GET /api/deals returns paginated deals scoped to the token's workspace. Filter by stage, owner, or risk band via query params. Risk score and reasons are computed on read.",
    meta: [
      { label: "Method", value: "GET" },
      { label: "Path", value: "/api/deals" },
      { label: "Pagination", value: "limit + cursor" },
    ],
    blocks: [
      {
        kind: "code",
        block: {
          language: "json",
          body: `{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "name": "Acme Corp",
      "stage": "negotiation",
      "value": 50000,
      "riskLevel": "Low",
      "riskScore": 0.25
    }
  ],
  "nextCursor": null
}`,
        },
      },
    ],
  },
  {
    kicker: "03",
    title: "Webhook events",
    lede:
      "Configure outbound webhooks to receive real-time notifications when deals change. Each delivery is signed with HMAC-SHA256 over the JSON body using your webhook secret.",
    id: "webhooks",
    meta: [
      { label: "Signature", value: "X-Webhook-Signature" },
      { label: "Algorithm", value: "HMAC-SHA256" },
      { label: "Retry", value: "Exponential backoff" },
    ],
    blocks: [
      {
        kind: "events",
        rows: [
          { event: "deal.created", description: "New deal added to pipeline." },
          { event: "deal.updated", description: "Deal fields changed." },
          {
            event: "deal.stage_changed",
            description: "Deal moved to a different stage.",
          },
          {
            event: "deal.at_risk",
            description: "Deal crossed the at-risk threshold.",
          },
          { event: "deal.closed_won", description: "Deal successfully closed." },
          { event: "deal.closed_lost", description: "Deal lost." },
          {
            event: "team.member_added",
            description: "Member added to a team.",
          },
          {
            event: "team.member_removed",
            description: "Member removed from a team.",
          },
        ],
      },
    ],
  },
  {
    kicker: "04",
    title: "Webhook payload",
    lede:
      "Every webhook delivery has a stable envelope: id, event, timestamp, and a typed data block. Always verify the X-Webhook-Signature header before trusting the body.",
    blocks: [
      {
        kind: "code",
        block: {
          language: "json",
          body: `{
  "id": "evt_abc123",
  "event": "deal.stage_changed",
  "timestamp": "2026-05-10T12:00:00Z",
  "data": {
    "id": "clx123abc",
    "name": "Acme Corp",
    "oldStage": "proposal",
    "newStage": "negotiation",
    "value": 50000
  }
}`,
        },
      },
      {
        kind: "code",
        block: {
          language: "javascript",
          body: `import crypto from "node:crypto";

const signature = req.headers["x-webhook-signature"];
const expected = crypto
  .createHmac("sha256", webhookSecret)
  .update(JSON.stringify(req.body))
  .digest("hex");

const valid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);

if (!valid) {
  return res.status(401).end();
}`,
        },
      },
    ],
  },
];

function CodeBlockView({ block }: { block: CodeBlock }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        <span>{block.language}</span>
        <span className="text-white/25">example</span>
      </div>
      <pre className="px-4 py-4 overflow-x-auto">
        <code className="text-[13px] leading-relaxed text-white/85 font-mono whitespace-pre">
          {block.body}
        </code>
      </pre>
    </div>
  );
}

function EventTable({ rows }: { rows: EventRow[] }) {
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 font-normal">
              Event
            </th>
            <th className="text-left py-3 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 font-normal">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.event}
              className={
                idx === rows.length - 1
                  ? ""
                  : "border-b border-white/5"
              }
            >
              <td className="py-3 px-4 font-mono text-[13px] text-emerald-400/90 whitespace-nowrap">
                {row.event}
              </td>
              <td className="py-3 px-4 text-white/70 leading-relaxed">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DeveloperDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Developer docs
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Build on Sentinel.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            A typed REST surface, signed webhooks, and an interactive OpenAPI
            explorer. The API reads and writes the same workspace your team
            uses - risk scores included on every read.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Bearer token auth</span>
            <span className="text-white/20">·</span>
            <span>HMAC-SHA256 webhook signing</span>
            <span className="text-white/20">·</span>
            <span>OpenAPI 3.0 spec</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-12">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
            Surfaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surfaces.map((s) => {
              const isInternal = s.href.startsWith("/");
              const Comp = isInternal ? Link : "a";
              return (
                <Comp
                  key={s.label}
                  href={s.href}
                  className="group block rounded-md border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:underline underline-offset-4 decoration-white/40">
                      {s.label}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                      {s.meta}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {s.description}
                  </p>
                </Comp>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {guides.map((guide) => (
            <article
              key={guide.kicker}
              id={guide.id}
              className="border-t border-white/10 pt-10 scroll-mt-24"
            >
              <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 pt-2">
                  {guide.kicker}
                </div>

                <div>
                  <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-3">
                    {guide.title}
                  </h2>
                  <p className="text-white/70 leading-relaxed max-w-2xl mb-6">
                    {guide.lede}
                  </p>

                  {guide.meta && (
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mb-8 font-mono text-xs">
                      {guide.meta.map((m) => (
                        <div key={m.label}>
                          <dt className="text-white/40 uppercase tracking-[0.18em] mb-1">
                            {m.label}
                          </dt>
                          <dd className="text-white/80 leading-snug">
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <div className="space-y-4">
                    {guide.blocks.map((b, i) =>
                      b.kind === "code" ? (
                        <CodeBlockView key={i} block={b.block} />
                      ) : (
                        <EventTable key={i} rows={b.rows} />
                      )
                    )}
                  </div>
                </div>
              </div>
            </article>
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
                Try a request against your workspace.
              </h2>
              <p className="text-white/60 leading-relaxed max-w-xl">
                The API reference embeds your token-aware Swagger UI. Hit any
                endpoint live, copy the curl, and ship.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link
                href="/api-docs"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Open API reference
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-5 py-2.5 rounded-md text-sm hover:border-white/30 hover:text-white transition-colors"
              >
                Get help
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
