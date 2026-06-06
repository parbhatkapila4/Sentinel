export interface PipelineByStageRow {
  stage: string;
  label: string;
  count: number;
  value: number;
  valueDisplay: string;
  avgValueDisplay: string;
  pctOfTotal: number;
  conversionPct: number | null;
}

interface PipelineByStageTableProps {
  rows: PipelineByStageRow[];
  totals: {
    count: number;
    valueDisplay: string;
    avgValueDisplay: string;
  };
}

export function PipelineByStageTable({
  rows,
  totals,
}: PipelineByStageTableProps) {
  const headStyle = {
    fontFamily: "var(--font-mono-jb)",
    fontSize: 9.5,
    letterSpacing: "0.18em",
    color: "var(--cream-4)",
    textTransform: "uppercase" as const,
    fontWeight: 400,
    padding: "16px 18px",
    borderBottom: "1px solid var(--rule-strong)",
  };

  const cellStyle = {
    fontFamily: "var(--font-serif)",
    fontSize: 15,
    color: "var(--cream)",
    padding: "16px 18px",
    borderBottom: "1px solid var(--rule)",
    letterSpacing: "-0.005em",
  } as const;

  const monoCell = {
    ...cellStyle,
    fontFamily: "var(--font-mono-jb)",
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "var(--cream-3)",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 720,
        }}
      >
        <thead>
          <tr>
            <th style={{ ...headStyle, textAlign: "left" }}>Stage</th>
            <th style={{ ...headStyle, textAlign: "right" }}>Deals</th>
            <th style={{ ...headStyle, textAlign: "right" }}>Total Value</th>
            <th style={{ ...headStyle, textAlign: "right" }}>Avg Value</th>
            <th style={{ ...headStyle, textAlign: "right" }}>% of Total</th>
            <th style={{ ...headStyle, textAlign: "right" }}>Conversion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.stage}
              className="anim-rise"
              style={{ animationDelay: `${100 + i * 40}ms` }}
            >
              <td style={cellStyle}>
                <div
                  className="flex items-center"
                  style={{ gap: 10 }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 4,
                      height: 16,
                      background: "var(--cream-3)",
                    }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{r.label}</span>
                </div>
              </td>
              <td
                className="tabular"
                style={{ ...cellStyle, textAlign: "right" }}
              >
                {r.count}
              </td>
              <td
                className="tabular"
                style={{
                  ...cellStyle,
                  textAlign: "right",
                  fontSize: 16,
                }}
              >
                {r.valueDisplay}
              </td>
              <td
                className="tabular"
                style={{ ...monoCell, textAlign: "right" }}
              >
                {r.avgValueDisplay}
              </td>
              <td
                className="tabular"
                style={{ ...monoCell, textAlign: "right" }}
              >
                {r.pctOfTotal.toFixed(1)}%
              </td>
              <td
                className="tabular"
                style={{
                  ...monoCell,
                  textAlign: "right",
                  color:
                    r.conversionPct === null
                      ? "var(--cream-4)"
                      : r.conversionPct >= 50
                        ? "var(--ivy)"
                        : r.conversionPct >= 25
                          ? "var(--copper)"
                          : "var(--wine)",
                }}
              >
                {r.conversionPct === null
                  ? "-"
                  : `${r.conversionPct.toFixed(0)}%`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              style={{
                ...cellStyle,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream)",
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              Total
            </td>
            <td
              className="tabular"
              style={{
                ...cellStyle,
                textAlign: "right",
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              {totals.count}
            </td>
            <td
              className="tabular"
              style={{
                ...cellStyle,
                textAlign: "right",
                fontSize: 16,
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              {totals.valueDisplay}
            </td>
            <td
              className="tabular"
              style={{
                ...monoCell,
                textAlign: "right",
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              {totals.avgValueDisplay}
            </td>
            <td
              className="tabular"
              style={{
                ...monoCell,
                textAlign: "right",
                color: "var(--cream-2)",
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              100%
            </td>
            <td
              className="tabular"
              style={{
                ...monoCell,
                textAlign: "right",
                borderTop: "1px solid var(--rule-strong)",
                borderBottom: "none",
              }}
            >
              -
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
