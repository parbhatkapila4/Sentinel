"use client";

import Link from "next/link";
import { formatShortMoney as formatTotal } from "@/lib/format-money";

export interface LeaderboardRow {
  id: string;
  rank: number;
  name: string;
  stage: string;
  value: number;
  valueDisplay: string;
  shareOfPipeline: number;
  riskLabel: "Low" | "Medium" | "High";
  lastActivityNote: string;
  recommendedAction?: string | null;
}

interface LeaderboardProps {
  rows: LeaderboardRow[];
  total: number;
}

function rankAccent(rank: number): {
  badge: string;
  text: string;
  border: string;
  label: string;
} {
  if (rank === 1) {
    return {
      badge: "var(--signal)",
      text: "var(--cream)",
      border: "var(--signal)",
      label: "GOLD",
    };
  }
  if (rank === 2) {
    return {
      badge: "var(--copper)",
      text: "var(--cream)",
      border: "var(--copper)",
      label: "SILVER",
    };
  }
  if (rank === 3) {
    return {
      badge: "var(--ivy)",
      text: "var(--cream)",
      border: "var(--ivy)",
      label: "BRONZE",
    };
  }
  return {
    badge: "var(--ink-03)",
    text: "var(--cream-2)",
    border: "var(--rule-strong)",
    label: "RANK",
  };
}

function riskTone(level: LeaderboardRow["riskLabel"]): {
  color: string;
  label: string;
} {
  if (level === "High") return { color: "var(--wine)", label: "HIGH RISK" };
  if (level === "Medium") return { color: "var(--copper)", label: "MEDIUM" };
  return { color: "var(--ivy)", label: "HEALTHY" };
}

export function Leaderboard({ rows, total }: LeaderboardProps) {
  if (rows.length === 0) {
    return <LeaderboardEmpty />;
  }

  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", position: "relative" }}>
      {rows.map((row, i) => {
        const accent = rankAccent(row.rank);
        const tone = riskTone(row.riskLabel);
        const top3 = row.rank <= 3;
        return (
          <li
            key={row.id}
            className="anim-rise"
            style={{
              animationDelay: `${Math.min(i * 30, 360)}ms`,
              borderTop: i === 0 ? "1px solid var(--rule-strong)" : "1px solid var(--rule)",
              borderBottom: i === rows.length - 1 ? "1px solid var(--rule-strong)" : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {top3 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: accent.border,
                }}
              />
            )}

            <Link
              href={`/deals/${row.id}`}
              className="grid items-center"
              style={{
                gridTemplateColumns: "auto minmax(0,1fr) auto auto",
                gap: 24,
                padding: "22px 24px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  minWidth: 64,
                  padding: "10px 8px",
                  border: `1px solid ${accent.border}`,
                  background: top3 ? "rgba(0,0,0,0.18)" : "var(--ink-02)",
                }}
              >
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 28,
                    color: accent.text,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {String(row.rank).padStart(2, "0")}
                </span>
                <span
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 8.5,
                    letterSpacing: "0.2em",
                    color: top3 ? accent.badge : "var(--cream-4)",
                    textTransform: "uppercase",
                  }}
                >
                  {accent.label}
                </span>
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  className="flex items-baseline flex-wrap"
                  style={{ gap: 12, marginBottom: 6 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 22,
                      color: "var(--cream)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {row.name}
                  </span>
                  <span
                    className="inline-flex items-center"
                    style={{
                      gap: 6,
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: tone.color,
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        background: tone.color,
                      }}
                    />
                    {tone.label}
                  </span>
                </div>
                <div
                  className="flex flex-wrap items-baseline"
                  style={{
                    gap: 14,
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                  }}
                >
                  <span>{row.stage}</span>
                  <span>·</span>
                  <span>{row.lastActivityNote}</span>
                  {row.recommendedAction && (
                    <>
                      <span>·</span>
                      <span style={{ color: "var(--signal)" }}>
                        {row.recommendedAction}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  minWidth: 168,
                  textAlign: "right",
                }}
              >
                <div
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 28,
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {row.valueDisplay}
                </div>
                <div
                  style={{
                    height: 2,
                    background: "var(--ink-03)",
                    position: "relative",
                    overflow: "hidden",
                    width: "100%",
                  }}
                  aria-hidden
                >
                  <span
                    className="anim-bar-fill"
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${Math.max(Math.min(row.shareOfPipeline, 100), row.value > 0 ? 4 : 0)}%`,
                      background: top3 ? accent.border : "var(--cream-4)",
                      animationDelay: `${200 + i * 30}ms`,
                      marginLeft: "auto",
                    }}
                  />
                </div>
                <div
                  className="tabular"
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--cream-4)",
                    textTransform: "uppercase",
                  }}
                >
                  {row.shareOfPipeline.toFixed(1)}% OF BOOK
                </div>
              </div>

              <span
                aria-hidden
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: top3 ? accent.border : "var(--cream-4)",
                  paddingLeft: 8,
                }}
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
      <li
        style={{
          padding: "18px 24px",
          borderTop: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <span>{rows.length} entries</span>
        <span className="flex-1" />
        <span className="tabular" style={{ color: "var(--cream-2)" }}>
          Aggregate {formatTotal(total)}
        </span>
      </li>
    </ol>
  );
}

function LeaderboardEmpty() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        gap: 14,
        padding: "80px 24px",
        border: "1px solid var(--rule)",
      }}
      role="status"
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--signal)",
          textTransform: "uppercase",
        }}
      >
        Standings Empty
      </span>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 36,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          maxWidth: 520,
        }}
      >
        Nothing to{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          rank yet.
        </em>
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--cream-2)",
          maxWidth: 440,
          marginTop: 4,
        }}
      >
        Add a deal or connect your CRM and the leaderboard will start sorting
        your largest opportunities by value.
      </p>
      <Link
        href="/deals/new"
        style={{
          marginTop: 8,
          padding: "9px 16px",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream)",
          background: "var(--signal)",
          border: "1px solid var(--signal)",
        }}
      >
        Create the first deal
      </Link>
    </div>
  );
}
