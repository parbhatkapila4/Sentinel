import Link from "next/link";
import { ExportMenu } from "../ExportMenu";

export interface HeroChip {
  label: string;
  tone: "alert" | "good" | "neutral" | "start";
}

interface AnalyticsHeroProps {
  chip: HeroChip;
  clause: string;
}

const CHIP_STYLE: Record<
  HeroChip["tone"],
  { background: string; color: string; dot: string }
> = {
  alert: {
    background: "var(--dl-signal-tint)",
    color: "var(--dl-signal-d)",
    dot: "var(--dl-signal)",
  },
  good: {
    background: "var(--dl-green-tint)",
    color: "var(--dl-green-text)",
    dot: "var(--dl-green)",
  },
  neutral: {
    background: "var(--dl-chip)",
    color: "var(--dl-text-2)",
    dot: "var(--dl-context)",
  },
  start: {
    background: "var(--dl-chip)",
    color: "var(--dl-text-2)",
    dot: "var(--dl-amber)",
  },
};

export function AnalyticsHero({ chip, clause }: AnalyticsHeroProps) {
  const chipStyle = CHIP_STYLE[chip.tone];

  return (
    <section aria-label="Summary" className="dl-hero">
      <div className="dl-hero-lead">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 26,
            padding: "0 10px",
            borderRadius: 999,
            background: chipStyle.background,
            color: chipStyle.color,
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
              background: chipStyle.dot,
            }}
          />
          {chip.label}
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
          Read the desk&apos;s{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
            appetite.
          </em>
        </h1>
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
          Where revenue is forming, what risk is brewing and where attention is
          best spent.
          <span className="dl-wide-only">
            {" "}
            Pick a range to read less or more of the book.
          </span>
        </p>
        <div className="dl-hero-actions">
          <Link
            href="/deals"
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
            Open pipeline
          </Link>
          <ExportMenu teamId={null} includeTeamDeals={false} />
        </div>
      </div>
    </section>
  );
}
