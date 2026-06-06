import Link from "next/link";

export interface DealListItem {
  id: string;
  index?: number;
  name: string;
  meta: string;
  trail?: string;
  trailTone?: "ivy" | "wine" | "copper" | "neutral" | "signal";
}

interface DealListProps {
  kicker: string;
  title: string;
  italicWord?: string;
  items: DealListItem[];
  empty?: { headline: string; body?: string };
  footer?: { label: string; href: string };
  accent?: "ivy" | "wine" | "signal" | "copper";
}

function tone(t: DealListItem["trailTone"]): string {
  switch (t) {
    case "ivy":
      return "var(--ivy)";
    case "wine":
      return "var(--wine)";
    case "copper":
      return "var(--copper)";
    case "signal":
      return "var(--signal)";
    case "neutral":
    default:
      return "var(--cream-2)";
  }
}

function accentColor(a: DealListProps["accent"]): string {
  switch (a) {
    case "wine":
      return "var(--wine)";
    case "signal":
      return "var(--signal)";
    case "copper":
      return "var(--copper)";
    case "ivy":
    default:
      return "var(--ivy)";
  }
}

export function DealList({
  kicker,
  title,
  italicWord,
  items,
  empty,
  footer,
  accent = "signal",
}: DealListProps) {
  return (
    <article
      style={{
        position: "relative",
        background: "var(--ink-02)",
        border: "1px solid var(--rule)",
        padding: "26px 26px 24px",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 2,
          background: accentColor(accent),
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {kicker}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          lineHeight: 1.05,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
          marginBottom: 18,
        }}
      >
        {title}
        {italicWord && (
          <>
            {" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--signal)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {italicWord}
            </em>
          </>
        )}
      </h3>

      {items.length === 0 ? (
        <div
          style={{
            padding: "24px 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {empty?.headline ?? "No entries"}
          </div>
          {empty?.body && (
            <div
              style={{
                fontSize: 13,
                color: "var(--cream-3)",
                lineHeight: 1.5,
              }}
            >
              {empty.body}
            </div>
          )}
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {items.map((item, i) => (
            <li
              key={item.id}
              className="anim-rise"
              style={{
                animationDelay: `${100 + i * 60}ms`,
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "baseline",
                gap: 14,
                padding: "14px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--rule)",
              }}
            >
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                  minWidth: 26,
                }}
              >
                {String(item.index ?? i + 1).padStart(2, "0")}
              </span>
              <div style={{ minWidth: 0 }}>
                <Link
                  href={`/deals/${item.id}`}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                    color: "var(--cream)",
                    lineHeight: 1.25,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </Link>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {item.meta}
                </div>
              </div>
              {item.trail && (
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    color: tone(item.trailTone),
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.trail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {footer && items.length > 0 && (
        <Link
          href={footer.href}
          style={{
            display: "inline-block",
            marginTop: 18,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--signal)",
          }}
        >
          {footer.label} →
        </Link>
      )}
    </article>
  );
}
