import Link from "next/link";
import type { LeadHeadline } from "../derive";
import type { BriefingItem } from "../types";
import { BriefStrip } from "./BriefStrip";

interface SummaryPanelProps {
  headline: LeadHeadline;
  briefingItems: BriefingItem[];
}

interface VariantStyle {
  chip: string;
  chipBg: string;
  chipColor: string;
  dot: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

const ASK_AI = { label: "Ask Sentinel AI", href: "/insights" };

const VARIANTS: Record<LeadHeadline["variant"], VariantStyle> = {
  slipping: {
    chip: "Needs attention",
    chipBg: "var(--dl-signal-tint)",
    chipColor: "var(--dl-signal-d)",
    dot: "var(--dl-signal)",
    primary: { label: "Review at-risk deals", href: "/risk-overview" },
    secondary: ASK_AI,
  },
  winning: {
    chip: "Good news",
    chipBg: "var(--dl-green-tint)",
    chipColor: "var(--dl-green-text)",
    dot: "var(--dl-green)",
    primary: { label: "Open pipeline", href: "/deals" },
    secondary: ASK_AI,
  },
  quiet: {
    chip: "All steady",
    chipBg: "var(--dl-chip)",
    chipColor: "var(--dl-text-2)",
    dot: "var(--dl-context)",
    primary: { label: "Open pipeline", href: "/deals" },
    secondary: ASK_AI,
  },
  onboarding: {
    chip: "Getting started",
    chipBg: "var(--dl-chip)",
    chipColor: "var(--dl-text-2)",
    dot: "var(--dl-amber)",
    primary: { label: "Connect a CRM", href: "/settings?tab=integrations" },
    secondary: { label: "Add a deal", href: "/deals/new" },
  },
};

function decorate(text: string, emphases: string[]): React.ReactNode {
  if (emphases.length === 0) return text;
  let pieces: React.ReactNode[] = [text];
  for (const emp of emphases) {
    pieces = pieces.flatMap((piece, idx) => {
      if (typeof piece !== "string") return [piece];
      const parts = piece.split(emp);
      if (parts.length === 1) return [piece];
      const out: React.ReactNode[] = [];
      parts.forEach((p, i) => {
        if (i > 0) {
          out.push(
            <strong
              key={`${emp}-${idx}-${i}`}
              style={{ fontWeight: 600, color: "var(--dl-ink)" }}
            >
              {emp}
            </strong>
          );
        }
        out.push(p);
      });
      return out;
    });
  }
  return pieces;
}

export function SummaryPanel({ headline, briefingItems }: SummaryPanelProps) {
  const variant = VARIANTS[headline.variant];
  const clause = headline.hangingClause
    .replace(/^\s*-\s*/, "")
    .replace(/\s*\n\s*/g, " ")
    .trim();

  return (
    <section aria-label="Today's summary">
      <div className="dl-hero">
        <div className="dl-hero-lead">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 26,
              padding: "0 10px",
              borderRadius: 999,
              background: variant.chipBg,
              color: variant.chipColor,
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: variant.dot,
              }}
            />
            {variant.chip}
          </span>
          <h1
            className="dl-headline"
            style={{
              marginTop: 16,
              fontFamily: "var(--dl-font-serif)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {headline.prefix}{" "}
            <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
              {headline.italicWord}
            </em>
            {headline.suffix ? ` ${headline.suffix}` : ""}
          </h1>
          {clause && (
            <p
              className="dl-hero-clause"
              style={{
                marginTop: 8,
                fontFamily: "var(--dl-font-serif)",
                fontStyle: "italic",
                lineHeight: 1.2,
                color: "var(--dl-muted)",
              }}
            >
              {clause}
            </p>
          )}
        </div>
        <div className="dl-hero-side">
          <p
            style={{
              maxWidth: 560,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--dl-text-2)",
            }}
          >
            {decorate(headline.deck, headline.emphases)}
          </p>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}
          >
            <Link
              href={variant.primary.href}
              className="dl-btn-primary"
              style={{
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
              }}
            >
              {variant.primary.label}
            </Link>
            <Link
              href={variant.secondary.href}
              className="dl-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 36,
                padding: "0 14px",
                borderRadius: 9,
                background: "var(--dl-panel)",
                border: "1px solid var(--dl-border-strong)",
                boxShadow: "var(--dl-shadow)",
                color: "var(--dl-ink)",
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              {variant.secondary.label}
            </Link>
          </div>
        </div>
      </div>
      <BriefStrip items={briefingItems} />
    </section>
  );
}
