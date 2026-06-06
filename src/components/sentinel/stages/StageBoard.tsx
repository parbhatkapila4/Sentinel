import Link from "next/link";

export interface StageBoardDeal {
  id: string;
  name: string;
  value: number;
  valueDisplay: string;
  riskLabel: "Low" | "Medium" | "High";
  activityNote: string;
  recommendedAction?: string | null;
}

export interface StageBoardColumn {
  stage: string;
  label: string;
  count: number;
  value: number;
  valueDisplay: string;
  avgDealDisplay: string;
  avgDays: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  conversionPct?: number;
  deals: StageBoardDeal[];
}

interface StageBoardProps {
  columns: StageBoardColumn[];
}

function stageTone(stage: string): { swatch: string; tag: string } {
  const s = stage.toLowerCase().replace(/\s+/g, "_");
  if (s === "closed_won" || s === "won") return { swatch: "var(--ivy)", tag: "WIN" };
  if (s === "closed_lost" || s === "lost") return { swatch: "var(--wine)", tag: "LOSS" };
  if (s === "negotiation" || s === "negotiate") return { swatch: "var(--signal)", tag: "HOT" };
  if (s === "proposal") return { swatch: "var(--copper)", tag: "OPEN" };
  if (s === "qualify" || s === "qualification" || s === "qualified") return { swatch: "var(--cream-2)", tag: "QUAL" };
  if (s === "discover" || s === "discovery" || s === "lead" || s === "prospect") return { swatch: "var(--cream-3)", tag: "NEW" };
  return { swatch: "var(--cream-3)", tag: "OPEN" };
}

function riskTone(level: StageBoardDeal["riskLabel"]): {
  color: string;
  label: string;
} {
  if (level === "High") return { color: "var(--wine)", label: "HIGH" };
  if (level === "Medium") return { color: "var(--copper)", label: "MED" };
  return { color: "var(--ivy)", label: "LOW" };
}

export function StageBoard({ columns }: StageBoardProps) {
  if (columns.length === 0) {
    return (
      <section
        aria-label="Stage board"
        style={{
          padding: "60px 56px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
          }}
        >
          No stages on the wire yet.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Stage board"
      style={{
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
        background: "var(--ink)",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))`,
          gap: 0,
          minWidth: columns.length * 280,
        }}
      >
        {columns.map((col, i) => (
          <StageColumn
            key={col.stage}
            column={col}
            isLast={i === columns.length - 1}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

function StageColumn({
  column,
  isLast,
  index,
}: {
  column: StageBoardColumn;
  isLast: boolean;
  index: number;
}) {
  const tone = stageTone(column.stage);
  return (
    <article
      className="anim-rise"
      style={{
        animationDelay: `${100 + index * 60}ms`,
        borderRight: isLast ? "none" : "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "var(--ink)",
      }}
    >
      <header
        style={{
          padding: "22px 22px 18px",
          borderBottom: "1px solid var(--rule)",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: tone.swatch,
          }}
        />
        <div
          className="flex items-center"
          style={{ gap: 10, marginBottom: 14 }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: tone.swatch,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: tone.swatch,
              textTransform: "uppercase",
            }}
          >
            {tone.tag}
          </span>
          <span style={{ flex: 1 }} />
          {typeof column.conversionPct === "number" && (
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
              }}
            >
              → {column.conversionPct.toFixed(0)}%
            </span>
          )}
        </div>

        <div
          className="flex items-baseline"
          style={{ gap: 12, marginBottom: 12 }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              lineHeight: 1.05,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
              textTransform: "capitalize",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {column.label}
          </h3>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              color: "var(--cream)",
              letterSpacing: "-0.02em",
            }}
          >
            {column.count}
          </span>
        </div>

        <div
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          {column.valueDisplay} ON STAGE
        </div>

        <dl
          className="grid grid-cols-2"
          style={{
            gap: 0,
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div>
            <dt
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Avg Deal
            </dt>
            <dd
              className="tabular"
              style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                color: "var(--cream)",
                letterSpacing: "-0.01em",
              }}
            >
              {column.avgDealDisplay}
            </dd>
          </div>
          <div>
            <dt
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Avg Days
            </dt>
            <dd
              className="tabular"
              style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                color: ageColor(column.avgDays),
                letterSpacing: "-0.01em",
              }}
            >
              {column.avgDays.toFixed(0)}
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                  marginLeft: 4,
                }}
              >
                D
              </span>
            </dd>
          </div>
        </dl>
      </header>

      <div
        className="flex items-center"
        style={{
          gap: 14,
          padding: "12px 22px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--ink-02)",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <RiskDot color="var(--wine)" count={column.highRisk} />
        <RiskDot color="var(--copper)" count={column.mediumRisk} />
        <RiskDot color="var(--ivy)" count={column.lowRisk} />
      </div>

      <ul
        style={{
          margin: 0,
          padding: 14,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: 540,
          overflowY: "auto",
        }}
      >
        {column.deals.length === 0 ? (
          <li
            style={{
              padding: "24px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
            }}
          >
            No deals on stage
          </li>
        ) : (
          column.deals.map((deal, i) => (
            <li key={deal.id} className="anim-rise" style={{ animationDelay: `${150 + i * 30}ms` }}>
              <BoardDealCard deal={deal} />
            </li>
          ))
        )}
      </ul>
    </article>
  );
}

function RiskDot({ color, count }: { color: string; count: number }) {
  return (
    <span
      className="inline-flex items-center"
      style={{ gap: 6 }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          background: color,
        }}
      />
      <span className="tabular" style={{ color: "var(--cream-2)" }}>
        {count}
      </span>
    </span>
  );
}

function BoardDealCard({ deal }: { deal: StageBoardDeal }) {
  const r = riskTone(deal.riskLabel);
  return (
    <Link
      href={`/deals/${deal.id}`}
      style={{
        display: "block",
        padding: "12px 14px",
        background: "var(--ink-02)",
        border: "1px solid var(--rule)",
        textDecoration: "none",
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 2,
          background: r.color,
        }}
      />
      <div
        className="flex items-baseline"
        style={{ gap: 10, marginBottom: 6 }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            color: "var(--cream)",
            lineHeight: 1.25,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {deal.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: r.color,
            textTransform: "uppercase",
          }}
        >
          {r.label}
        </span>
      </div>

      <div
        className="flex items-baseline justify-between"
        style={{
          gap: 8,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <span
          className="tabular"
          style={{
            color: "var(--cream)",
            fontFamily: "var(--font-serif)",
            fontSize: 13,
            letterSpacing: "-0.01em",
            textTransform: "none",
          }}
        >
          {deal.valueDisplay}
        </span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {deal.activityNote}
        </span>
      </div>

      {deal.recommendedAction && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "var(--signal)",
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          → {deal.recommendedAction}
        </div>
      )}
    </Link>
  );
}

function ageColor(days: number): string {
  if (days >= 30) return "var(--wine)";
  if (days >= 14) return "var(--copper)";
  return "var(--cream)";
}
