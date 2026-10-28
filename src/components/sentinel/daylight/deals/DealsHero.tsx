import Link from "next/link";
import { NavIcon } from "../nav";
import { ExportMenu } from "../ExportMenu";
import {
  attentionChip,
  bookClause,
  type AttentionChip,
  type DealsScope,
} from "./model";

interface DealsHeroProps {
  scope: DealsScope;
  teamId: string | null;
  total: number;
  atRisk: number;
  unavailable: boolean;
}

const CHIP_STYLE: Record<
  AttentionChip["tone"],
  { background: string; color: string; dot: string }
> = {
  alert: {
    background: "var(--dl-signal-tint)",
    color: "var(--dl-signal-d)",
    dot: "var(--dl-signal)",
  },
  steady: {
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

export function DealsHero({
  scope,
  teamId,
  total,
  atRisk,
  unavailable,
}: DealsHeroProps) {
  const chip: AttentionChip = unavailable
    ? { label: "Data unavailable", tone: "start" }
    : attentionChip(total, atRisk);
  const chipStyle = CHIP_STYLE[chip.tone];

  return (
    <section aria-label="The book" className="dl-hero">
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
          Every deal on the{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
            {scope === "all" ? "desk." : "book."}
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
          {unavailable ? "it could not be read just now." : bookClause(total, atRisk)}
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
          Read across the book with one eye on risk and the other on what&apos;s
          next. The list is sorted so the deals that need you sit at the top.
        </p>
        <div className="dl-hero-actions">
          <Link
            href="/deals/new"
            className="dl-btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 14px 0 12px",
              borderRadius: 9,
              background: "var(--dl-ink)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(16, 24, 40, 0.25)",
              color: "var(--dl-panel)",
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            <NavIcon size={14} strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </NavIcon>
            New deal
          </Link>
          <ExportMenu teamId={teamId} includeTeamDeals={scope === "all"} />
        </div>
      </div>
    </section>
  );
}
