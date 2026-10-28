import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { secondaryButtonStyle, smallButtonStyle } from "../blocks";

export const WEBHOOK_LIST_COLUMNS = {
  "--cols": "minmax(0, 1fr) 100px 110px 120px 236px",
  "--cols-n": "minmax(0, 1fr)",
} as CSSProperties;

export const DELIVERY_COLUMNS = {
  "--cols": "76px 180px minmax(0, 1fr) 140px",
  "--cols-n": "64px minmax(0, 1fr) 96px",
} as CSSProperties;

export const MASKED_SECRET = "•".repeat(24);

export const COPY = {
  heroDeck:
    "Sentinel posts each event you subscribe to and signs it with the webhook's secret. Subscribe only to what you use.",
  formSub: "Sentinel calls this URL whenever one of the picked events happens.",
  nameNote: "Just for you, so you can tell webhooks apart.",
  urlNote: "Must start with https://. webhook.site is handy for testing.",
  eventsPick: "Pick at least one.",
  activeNote: "A paused webhook keeps its settings but sends nothing.",
  configSub: "Where it sends, and what.",
  eventsNote: "Each one sends a POST with the deal's data.",
  statusNote:
    "A paused webhook keeps its settings but sends nothing. Pause or resume it under Edit.",
  secretNote: "Check each request's signature with it. Regenerating it breaks the old one.",
} as const;

export function SectionHead({
  id,
  title,
  sub,
  right,
}: {
  id: string;
  title: string;
  sub: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px 16px",
        padding: "22px var(--dl-gutter) 12px",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 id={id} style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        <p style={{ marginTop: 2, fontSize: 13, color: "var(--dl-muted)" }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

export function CodePill({
  tone,
  children,
}: {
  tone: "good" | "alert";
  children: ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        background: tone === "good" ? "var(--dl-green-tint)" : "var(--dl-signal-tint)",
        color: tone === "good" ? "var(--dl-green-text)" : "var(--dl-signal-d)",
      }}
    >
      {children}
    </span>
  );
}

export function SmallLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="dl-btn-secondary"
      style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
    >
      {children}
    </Link>
  );
}

export const lastRowStyle: CSSProperties = { borderBottom: 0 };
