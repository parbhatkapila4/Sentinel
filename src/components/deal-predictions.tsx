"use client";

import Link from "next/link";

import {
  calculateWinProbability,
  findSimilarDeals,
  predictDaysToClose,
  type DealForPrediction,
} from "@/lib/predictions";

interface DealPredictionsProps {
  deal: DealForPrediction;
  allDeals: DealForPrediction[];
}

function toDeal(d: unknown): DealForPrediction {
  const x = d as Record<string, unknown>;
  return {
    id: String(x.id),
    name: String(x.name),
    stage: String(x.stage),
    value: Number(x.value),
    createdAt: x.createdAt instanceof Date ? x.createdAt : new Date(String(x.createdAt)),
    lastActivityAt:
      x.lastActivityAt instanceof Date
        ? x.lastActivityAt
        : new Date(String(x.lastActivityAt ?? x.createdAt)),
    riskScore: Number(x.riskScore ?? 0),
    riskLevel: x.riskLevel != null ? String(x.riskLevel) : undefined,
    status: x.status != null ? String(x.status) : undefined,
  };
}

const isClosed = (s: string) => s === "closed_won" || s === "closed_lost";

export function DealPredictions({ deal, allDeals }: DealPredictionsProps) {
  const d = toDeal(deal);
  const deals = allDeals.map(toDeal);
  const closed = isClosed(d.stage);
  const daysPred = closed ? null : predictDaysToClose(d, deals);
  const winProb = closed ? null : calculateWinProbability(d, deals);
  const similar = findSimilarDeals(d, deals);

  const trendLabel = winProb
    ? winProb.trend === "up"
      ? "Improving"
      : winProb.trend === "down"
        ? "Declining"
        : "Stable"
    : null;

  const trendColor = winProb
    ? winProb.trend === "up"
      ? "var(--ivy)"
      : winProb.trend === "down"
        ? "var(--copper)"
        : "var(--cream-3)"
    : "var(--cream-3)";

  return (
    <section
      className="sentinel-deal-forecast"
      style={{
        border: "1px solid var(--rule)",
        background: "var(--ink-02)",
        padding: "28px 26px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          § - FORECAST
        </span>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 400,
            color: "var(--cream)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          The house&apos;s{" "}
          <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
            prediction
          </em>
          .
        </h2>
      </div>

      {closed ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 18px",
            border: "1px solid var(--rule)",
            background: "var(--ink)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "4px 12px",
              color: d.stage === "closed_won" ? "var(--ivy)" : "var(--wine)",
              border: `1px solid ${d.stage === "closed_won" ? "var(--ivy)" : "var(--wine)"}`,
              background:
                d.stage === "closed_won"
                  ? "rgba(116, 125, 79, 0.08)"
                  : "rgba(119, 47, 47, 0.08)",
            }}
          >
            {d.stage === "closed_won" ? "WON" : "LOST"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--cream-2)",
            }}
          >
            Deal closed. The book is shut on this one.
          </span>
        </div>
      ) : (
        <>
          <div
            className="sentinel-deal-forecast-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  margin: "0 0 8px",
                }}
              >
                Win probability
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: "var(--rule)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${winProb!.probability}%`,
                      background: "var(--signal)",
                      transition: "width 420ms ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    color: "var(--cream)",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 52,
                    textAlign: "right",
                  }}
                >
                  {winProb!.probability}%
                </span>
              </div>
              {trendLabel && (
                <p
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: trendColor,
                    margin: 0,
                  }}
                >
                  {trendLabel}
                </p>
              )}
            </div>

            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  margin: "0 0 8px",
                }}
              >
                Est. days to close
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 34,
                  color: "var(--cream)",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {daysPred!.estimatedDays}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  margin: "4px 0 0",
                }}
              >
                {daysPred!.confidence} confidence
              </p>
            </div>
          </div>

          {winProb!.factors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  margin: "0 0 10px",
                }}
              >
                Factors
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {winProb!.factors.slice(0, 4).map((f, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--cream-2)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ color: "var(--signal)", fontStyle: "italic", fontSize: 14, marginTop: 1 }}
                    >
                      -
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {similar.similar.length > 0 && (
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
              margin: "0 0 6px",
            }}
          >
            Similar entries
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--cream-3)",
              margin: "0 0 14px",
            }}
          >
            Win rate {Math.round(similar.winRate * 100)}% · avg {similar.avgDaysToClose} days to close.
          </p>
          <ul
            className="sentinel-deal-forecast-similar-list"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              border: "1px solid var(--rule)",
              borderBottom: "none",
            }}
          >
            {similar.similar.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="sentinel-deal-forecast-similar-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 14,
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <Link
                  href={`/deals/${s.id}`}
                  className="sentinel-link-signal"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </Link>
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "3px 9px",
                    color: s.outcome === "won" ? "var(--ivy)" : "var(--wine)",
                    border: `1px solid ${s.outcome === "won" ? "var(--ivy)" : "var(--wine)"}`,
                    background:
                      s.outcome === "won"
                        ? "rgba(116, 125, 79, 0.08)"
                        : "rgba(119, 47, 47, 0.08)",
                  }}
                >
                  {s.outcome}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    color: "var(--cream-3)",
                    minWidth: 36,
                    textAlign: "right",
                  }}
                >
                  {s.daysToClose != null ? `${s.daysToClose}d` : "-"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {similar.similar.length === 0 &&
        !deals.some((x) => x.stage === "closed_won" || x.stage === "closed_lost") && (
          <p
            style={{
              marginTop: 18,
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--cream-3)",
            }}
          >
            Close a few more deals and the house will have comparisons to draw from.
          </p>
        )}
    </section>
  );
}
