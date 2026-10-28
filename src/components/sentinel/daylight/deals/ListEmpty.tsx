import Link from "next/link";
import type { CSSProperties } from "react";
import { NavIcon } from "../nav";
import { cellSubStyle, cellTitleStyle } from "../ui";

const kickerStyle: CSSProperties = {
  fontFamily: "var(--dl-font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--dl-signal-d)",
};

const headingStyle: CSSProperties = {
  marginTop: 14,
  fontFamily: "var(--dl-font-serif)",
  fontWeight: 400,
  fontSize: "clamp(34px, 4.4cqw, 46px)",
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

const bodyStyle: CSSProperties = {
  maxWidth: 500,
  marginTop: 14,
  fontSize: 15,
  lineHeight: 1.6,
  color: "var(--dl-text-2)",
};

const primaryStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  padding: "0 14px",
  borderRadius: 9,
  background: "var(--dl-ink)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(16, 24, 40, 0.25)",
  color: "var(--dl-panel)",
  fontSize: 13.5,
  fontWeight: 500,
};

const secondaryStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 36,
  padding: "0 14px 0 12px",
  borderRadius: 9,
  background: "var(--dl-panel)",
  border: "1px solid var(--dl-border-strong)",
  boxShadow: "var(--dl-shadow)",
  color: "var(--dl-ink)",
  fontSize: 13.5,
  fontWeight: 500,
  cursor: "pointer",
};

const STEPS = [
  "Connect HubSpot or Salesforce. Sentinel only reads; nothing is written back.",
  "Open deals sync in with their stage, value and recent activity.",
  "Each one gets a risk score and a next action, and the urgent ones rise to the top.",
];

export function ListEmpty({ unavailable }: { unavailable: boolean }) {
  return (
    <div className="dl-grid dl-grow" role="status" style={{ marginBottom: -1 }}>
      <div
        className="dl-two-thirds"
        style={{ padding: "clamp(32px, 4.4cqw, 54px) var(--dl-gutter) 44px" }}
      >
        <div style={kickerStyle}>
          {unavailable ? "List unavailable" : "Nothing on the book yet"}
        </div>
        <h2 style={headingStyle}>
          No deals{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
            to read.
          </em>
        </h2>
        <p style={bodyStyle}>
          {unavailable
            ? "The deals could not be loaded just now. Nothing has been lost; reload in a moment and the list comes back."
            : "Connect a CRM or add a deal by hand. As soon as one lands, this list fills in with its stage, its risk and what to do next."}
        </p>
        {!unavailable && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}
          >
            <Link
              href="/settings?tab=integrations"
              className="dl-btn-primary"
              style={primaryStyle}
            >
              Connect a CRM
            </Link>
            <Link
              href="/deals/new"
              className="dl-btn-secondary"
              style={secondaryStyle}
            >
              <NavIcon size={14} strokeWidth={2}>
                <path d="M12 5v14M5 12h14" />
              </NavIcon>
              Add a deal
            </Link>
          </div>
        )}
      </div>
      <div className="dl-third" style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "2px 9px", minHeight: 21 }}
        >
          <h3 style={cellTitleStyle}>How the list fills</h3>
          <span style={{ ...cellSubStyle, fontSize: 12.5 }}>
            About two minutes
          </span>
        </div>
        <ol style={{ marginTop: 12 }}>
          {STEPS.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderTop: "1px solid var(--dl-row)",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "flex",
                  flex: "0 0 22px",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--dl-ink)",
                  color: "var(--dl-panel)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function ListNoMatch({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="status"
      className="dl-grow"
      style={{ padding: "44px var(--dl-gutter) 48px", textAlign: "center" }}
    >
      <div style={kickerStyle}>Nothing in this view</div>
      <h2 style={{ ...headingStyle, fontSize: "clamp(28px, 3.4cqw, 36px)" }}>
        No deals{" "}
        <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
          match.
        </em>
      </h2>
      <p style={{ ...bodyStyle, maxWidth: 420, margin: "12px auto 0" }}>
        Try another tab, or clear the filter to see every deal on the book.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="dl-btn-secondary"
        style={{ ...secondaryStyle, marginTop: 20, padding: "0 14px" }}
      >
        Show all deals
      </button>
    </div>
  );
}
