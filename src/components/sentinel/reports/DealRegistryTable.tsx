import Link from "next/link";

export interface DealRegistryRow {
  id: string;
  name: string;
  stage: string;
  stageLabel: string;
  valueDisplay: string;
  riskLevel: "Low" | "Medium" | "High";
  status: "active" | "at_risk" | "closed";
  nextAction: string | null;
}

interface DealRegistryTableProps {
  rows: DealRegistryRow[];
}

function riskTone(level: DealRegistryRow["riskLevel"]) {
  if (level === "High") return "var(--wine)";
  if (level === "Medium") return "var(--copper)";
  return "var(--ivy)";
}

function statusLabel(status: DealRegistryRow["status"]): {
  text: string;
  tone: string;
} {
  if (status === "closed") return { text: "Closed", tone: "var(--cream-3)" };
  if (status === "at_risk") return { text: "At risk", tone: "var(--wine)" };
  return { text: "Active", tone: "var(--ivy)" };
}

export function DealRegistryTable({ rows }: DealRegistryTableProps) {
  if (rows.length === 0) {
    return (
      <p
        style={{
          padding: "32px 24px",
          textAlign: "center",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.18em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        No deals on the wire.
      </p>
    );
  }

  const head = {
    fontFamily: "var(--font-mono-jb)",
    fontSize: 9.5,
    letterSpacing: "0.18em",
    color: "var(--cream-4)",
    textTransform: "uppercase" as const,
    fontWeight: 400,
    padding: "16px 18px",
    borderBottom: "1px solid var(--rule-strong)",
  };

  const cell = {
    padding: "14px 18px",
    borderBottom: "1px solid var(--rule)",
    color: "var(--cream)",
    fontFamily: "var(--font-serif)",
    fontSize: 14.5,
    letterSpacing: "-0.005em",
  } as const;

  const mono = {
    ...cell,
    fontFamily: "var(--font-mono-jb)",
    fontSize: 10.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "var(--cream-3)",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 880,
        }}
      >
        <thead>
          <tr>
            <th style={{ ...head, textAlign: "left" }}>Deal Name</th>
            <th style={{ ...head, textAlign: "left" }}>Stage</th>
            <th style={{ ...head, textAlign: "right" }}>Value</th>
            <th style={{ ...head, textAlign: "left" }}>Risk</th>
            <th style={{ ...head, textAlign: "left" }}>Status</th>
            <th style={{ ...head, textAlign: "left" }}>Next Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const status = statusLabel(r.status);
            const riskColor = riskTone(r.riskLevel);
            return (
              <tr
                key={r.id}
                className="anim-rise"
                style={{ animationDelay: `${80 + i * 25}ms` }}
              >
                <td style={cell}>
                  <Link
                    href={`/deals/${r.id}`}
                    style={{
                      color: "var(--cream)",
                      textDecoration: "none",
                      fontFamily: "var(--font-serif)",
                      fontSize: 15,
                    }}
                  >
                    {r.name}
                  </Link>
                </td>
                <td style={mono}>{r.stageLabel}</td>
                <td
                  className="tabular"
                  style={{ ...cell, textAlign: "right", fontSize: 15 }}
                >
                  {r.valueDisplay}
                </td>
                <td style={cell}>
                  <span
                    className="inline-flex items-center"
                    style={{
                      gap: 8,
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: r.status === "closed" ? "var(--cream-4)" : riskColor,
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        background:
                          r.status === "closed" ? "var(--cream-4)" : riskColor,
                      }}
                    />
                    {r.status === "closed" ? "Closed" : r.riskLevel}
                  </span>
                </td>
                <td style={cell}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: status.tone,
                      textTransform: "uppercase",
                    }}
                  >
                    {status.text}
                  </span>
                </td>
                <td
                  style={{
                    ...cell,
                    fontFamily: "var(--font-serif)",
                    fontStyle: r.nextAction ? "italic" : "normal",
                    color: r.nextAction ? "var(--cream-2)" : "var(--cream-4)",
                    fontSize: 13.5,
                  }}
                >
                  {r.nextAction || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
