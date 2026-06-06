export interface ActivityByDayItem {
  label: string;
  count: number;
}

interface ActivityByDayProps {
  items: ActivityByDayItem[];
}

export function ActivityByDay({ items }: ActivityByDayProps) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {items.map((it, i) => {
        const pct = (it.count / max) * 100;
        const barTone =
          pct >= 75
            ? "var(--signal)"
            : pct >= 40
              ? "var(--cream-2)"
              : "var(--cream-3)";
        return (
          <li
            key={it.label}
            className="anim-rise flex items-center"
            style={{
              animationDelay: `${100 + i * 40}ms`,
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.18em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
                width: 36,
                flexShrink: 0,
              }}
            >
              {it.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 14,
                background: "var(--ink-03)",
                position: "relative",
              }}
              aria-hidden
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.max(pct, it.count > 0 ? 4 : 0)}%`,
                  background: barTone,
                  opacity: 0.4 + (it.count / max) * 0.6,
                }}
              />
            </div>
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                color: "var(--cream)",
                letterSpacing: "-0.01em",
                width: 36,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {it.count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
