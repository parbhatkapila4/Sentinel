import { formatShortMoney } from "@/lib/format-money";
import { sentenceCase } from "./format";
import { cellSubStyle, cellTitleStyle, emptyStyle } from "./ui";

interface ChannelCellProps {
  bars: Array<{ label: string; value: number; share: number }>;
}

export function ChannelCell({ bars }: ChannelCellProps) {
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  const top = sorted[0]?.value ?? 0;

  return (
    <section
      aria-label="Revenue by channel"
      className="dl-third"
      style={{ padding: "18px var(--dl-gutter) 8px" }}
    >
      <h2 style={cellTitleStyle}>Revenue by channel</h2>
      <p style={{ ...cellSubStyle, marginTop: 1 }}>Quarter to date</p>
      {sorted.length === 0 ? (
        <p style={{ ...emptyStyle, padding: "20px 0" }}>No channel data yet.</p>
      ) : (
        <ul style={{ marginTop: 12 }}>
          {sorted.map((bar, i) => {
            const lead = i === 0 && bar.value > 0;
            const width = top > 0 ? Math.round((bar.value / top) * 1000) / 10 : 0;
            return (
              <li
                key={bar.label}
                style={{
                  padding: "9px 0 10px",
                  borderTop: "1px solid var(--dl-row)",
                }}
              >
                <div className="flex items-baseline" style={{ gap: 10 }}>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 14,
                      fontWeight: lead ? 600 : 400,
                      color: lead ? "var(--dl-ink)" : "var(--dl-text-2)",
                    }}
                  >
                    {sentenceCase(bar.label)}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "var(--dl-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {(bar.share * 100).toFixed(1)}%
                  </span>
                  <span
                    style={{
                      minWidth: 46,
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: lead ? 600 : 500,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatShortMoney(bar.value)}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    marginTop: 7,
                    borderRadius: 3,
                    background: "var(--dl-track)",
                  }}
                >
                  <div
                    style={{
                      width: `${width}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: lead ? "var(--dl-ink)" : "var(--dl-bar)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
