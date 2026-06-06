import Link from "next/link";
import type { ShortListItem } from "../types";

interface ShortListProps {
  items: ShortListItem[];
}

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function ageColor(severity: ShortListItem["ageSeverity"]) {
  switch (severity) {
    case "high":
      return "var(--wine)";
    case "medium":
      return "var(--copper)";
    case "low":
      return "var(--ivy)";
    default:
      return "var(--cream-4)";
  }
}

function riskBarColor(label: ShortListItem["riskLabel"]) {
  if (label === "HIGH") return "var(--wine)";
  if (label === "MEDIUM") return "var(--copper)";
  return "var(--ivy)";
}

export function ShortList({ items }: ShortListProps) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "32px 0",
          textAlign: "center",
          color: "var(--cream-4)",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        No active deals on the desk.
      </div>
    );
  }
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it, i) => (
        <li
          key={it.id}
          className="anim-rise grid items-center"
          style={{
            animationDelay: `${100 + i * 60}ms`,
            gridTemplateColumns: "32px 1fr 110px",
            gap: 18,
            padding: "16px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule)",
          }}
        >
          <div
            className="tabular"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--cream-3)",
            }}
          >
            {String(it.index).padStart(2, "0")}
          </div>
          <div>
            <Link
              href={`/deals/${it.id}`}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 19,
                color: "var(--cream)",
                lineHeight: 1.2,
              }}
            >
              {it.name}{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--cream-3)",
                  fontSize: 14,
                }}
              >
                · {it.segment}
              </em>
            </Link>
            <div
              className="flex flex-wrap"
              style={{
                marginTop: 6,
                gap: 14,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream-4)",
              }}
            >
              <span>{it.stage}</span>
              <span style={{ color: ageColor(it.ageSeverity) }}>
                {it.ageNote}
              </span>
              {it.location && <span>{it.location}</span>}
            </div>
            <div
              style={{
                marginTop: 10,
                height: 3,
                background: "var(--ink-03)",
                position: "relative",
                overflow: "hidden",
              }}
              aria-label={`Risk ${it.riskLabel.toLowerCase()}`}
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${it.riskPercent}%`,
                  background: riskBarColor(it.riskLabel),
                  animationDelay: `${300 + i * 80}ms`,
                }}
              />
            </div>
          </div>
          <div
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              color: "var(--cream)",
              textAlign: "right",
              letterSpacing: "-0.01em",
            }}
          >
            {fmtCurrency(it.value)}
          </div>
        </li>
      ))}
    </ol>
  );
}
