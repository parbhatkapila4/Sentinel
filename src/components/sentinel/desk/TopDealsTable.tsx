import Link from "next/link";

interface TopDealsTableProps {
  deals: Array<{
    id: string;
    name: string;
    segment?: string;
    stage: string;
    value: number;
  }>;
}

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function TopDealsTable({ deals }: TopDealsTableProps) {
  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 26,
          color: "var(--cream)",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        Top{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          deals
        </em>
      </h3>
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        BY VALUE · ACTIVE
      </p>

      <div
        className="grid grid-cols-[1fr_64px_84px] gap-2 lg:grid-cols-[1fr_100px_110px] lg:gap-3"
        style={{
          padding: "0 0 10px",
          borderBottom: "1px solid var(--rule-strong)",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <span>Deal</span>
        <span>Stage</span>
        <span style={{ textAlign: "right" }}>Value</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {deals.length === 0 && (
          <li
            style={{
              padding: "20px 0",
              color: "var(--cream-4)",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            No active deals.
          </li>
        )}
        {deals.map((d, i) => (
          <li
            key={d.id}
            className="anim-rise grid items-baseline grid-cols-[1fr_64px_84px] gap-2 lg:grid-cols-[1fr_100px_110px] lg:gap-3"
            style={{
              animationDelay: `${100 + i * 60}ms`,
              padding: "14px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
            }}
          >
            <Link
              href={`/deals/${d.id}`}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                color: "var(--cream)",
                lineHeight: 1.25,
              }}
            >
              {d.name}
              {d.segment && (
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--cream-3)",
                    fontSize: 13,
                    marginLeft: 4,
                  }}
                >
                  · {d.segment}
                </em>
              )}
            </Link>
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
              }}
            >
              {d.stage}
            </span>
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                color: "var(--cream)",
                textAlign: "right",
                letterSpacing: "-0.01em",
              }}
            >
              {fmtCurrency(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
