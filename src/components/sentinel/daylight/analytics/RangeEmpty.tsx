import Link from "next/link";
import type { CSSProperties } from "react";
import { NavIcon } from "../nav";
import { cellTitleStyle } from "../ui";
import {
  RANGE_DAYS,
  RANGE_LABELS,
  widerRanges,
  type AnalyticsRange,
} from "./model";

interface RangeEmptyProps {
  range: AnalyticsRange;
  counts: Record<AnalyticsRange, number>;
  hasAnyDeals: boolean;
  unavailable: boolean;
}

const kickerStyle: CSSProperties = {
  fontFamily: "var(--dl-font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--dl-signal-d)",
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
  padding: "0 14px",
  borderRadius: 9,
  background: "var(--dl-panel)",
  border: "1px solid var(--dl-border-strong)",
  boxShadow: "var(--dl-shadow)",
  color: "var(--dl-ink)",
  fontSize: 13.5,
  fontWeight: 500,
};

const RANGE_STEPS = [
  "It picks deals by the day they were created.",
  "Every number, chart and list on this page follows it.",
  "7, 30 and 90 days also compare with the same stretch before.",
];

const FILL_STEPS = [
  "Connect HubSpot or Salesforce. Sentinel only reads; nothing is written back.",
  "Open deals sync in with their stage, value and recent activity.",
  "The numbers, the stage chart and the risk mix fill in from there.",
];

const UNAVAILABLE_STEPS = [
  "Your deals are safe. This page only reads them.",
  "The zeros above are placeholders, not your real totals.",
  "Reload the page in a moment to try again.",
];

function rangeHref(range: AnalyticsRange): string {
  return range === "all" ? "/analytics" : `/analytics?range=${range}`;
}

export function RangeEmpty({
  range,
  counts,
  hasAnyDeals,
  unavailable,
}: RangeEmptyProps) {
  const days = RANGE_DAYS[range];
  const inRange = hasAnyDeals && !unavailable;
  const wider = widerRanges(range).find((r) => r !== "all" && counts[r] > 0);

  const kicker = unavailable
    ? "Analytics unavailable"
    : inRange
      ? "Nothing in this range"
      : "Nothing on the book yet";
  const body = unavailable
    ? "The deals could not be loaded just now. Nothing has been lost; reload in a moment and the numbers come back."
    : inRange
      ? `No deals were created in the last ${days} days. Widen the range and the charts fill back in.`
      : "Connect a CRM or add a deal by hand. As soon as one lands, the numbers and charts fill in.";
  const asideTitle = unavailable
    ? "What this means"
    : inRange
      ? "How the range works"
      : "How this page fills";
  const steps = unavailable
    ? UNAVAILABLE_STEPS
    : inRange
      ? RANGE_STEPS
      : FILL_STEPS;

  return (
    <div className="dl-grid dl-grow" role="status">
      <div
        className="dl-two-thirds"
        style={{ padding: "clamp(32px, 4cqw, 46px) var(--dl-gutter) 44px" }}
      >
        <div style={kickerStyle}>{kicker}</div>
        <h2
          style={{
            marginTop: 14,
            fontFamily: "var(--dl-font-serif)",
            fontWeight: 400,
            fontSize: "clamp(34px, 4.4cqw, 46px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {unavailable ? "Deals" : "No deals"}{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
            {unavailable ? "did not load." : "to measure."}
          </em>
        </h2>
        <p
          style={{
            maxWidth: 500,
            marginTop: 14,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--dl-text-2)",
          }}
        >
          {body}
        </p>
        {!unavailable && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
            {inRange ? (
              <>
                {wider && (
                  <Link
                    href={rangeHref(wider)}
                    className="dl-btn-primary"
                    style={primaryStyle}
                  >
                    Show {RANGE_LABELS[wider]}
                  </Link>
                )}
                <Link
                  href={rangeHref("all")}
                  className={wider ? "dl-btn-secondary" : "dl-btn-primary"}
                  style={wider ? secondaryStyle : primaryStyle}
                >
                  Show all time
                </Link>
              </>
            ) : (
              <>
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
                  style={{ ...secondaryStyle, padding: "0 14px 0 12px" }}
                >
                  <NavIcon size={14} strokeWidth={2}>
                    <path d="M12 5v14M5 12h14" />
                  </NavIcon>
                  Add a deal
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <div className="dl-third" style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <h3 style={{ ...cellTitleStyle, lineHeight: "21px" }}>
          {asideTitle}
        </h3>
        <ol style={{ marginTop: 12 }}>
          {steps.map((step, i) => (
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
