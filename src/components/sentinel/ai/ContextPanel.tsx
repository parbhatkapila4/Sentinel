import type {
  AIBookFact,
  AIConnectedSource,
  AIRecentAnswer,
} from "./types";

interface ContextPanelProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  syncTime: string;
  connectedCount: number;
  bookFacts: AIBookFact[];
  sources: AIConnectedSource[];
  recentAnswers: AIRecentAnswer[];
}

export function ContextPanel({
  collapsed = false,
  onToggleCollapse,
  syncTime,
  connectedCount,
  bookFacts,
  sources,
  recentAnswers,
}: ContextPanelProps) {
  return (
    <aside
      aria-label="Context"
      style={{
        borderLeft: "1px solid var(--rule)",
        background: "var(--ink-02)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          padding: collapsed ? "12px 8px" : "28px 24px 18px",
          borderBottom: "1px solid var(--rule)",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            right: collapsed ? 8 : 24,
            width: 32,
            height: 2,
            background: "var(--copper)",
          }}
        />
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              aria-label="Expand context panel"
              onClick={onToggleCollapse}
              style={{
                width: 34,
                height: 34,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--rule-strong)",
                background: "var(--ink)",
                color: "var(--cream)",
                cursor: "pointer",
                lineHeight: 1,
                fontSize: 16,
              }}
            >
              →
            </button>
          </div>
        ) : (
          <div
            className="flex items-baseline justify-between"
            style={{
              gap: 10,
              marginBottom: 10,
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
            }}
          >
            <span>§ The Context</span>
            <div className="inline-flex items-center" style={{ gap: 8 }}>
              <span
                className="inline-flex items-center"
                style={{ gap: 6, color: "var(--ivy)" }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    background: "var(--ivy)",
                    borderRadius: "50%",
                  }}
                />
                LIVE
              </span>
              <button
                type="button"
                aria-label="Collapse context panel"
                onClick={onToggleCollapse}
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  border: "1px solid var(--rule-strong)",
                  background: "var(--ink)",
                  color: "var(--cream-2)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ←
              </button>
            </div>
          </div>
        )}
        {!collapsed && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: "var(--cream)",
              }}
            >
              What Sentinel
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--copper)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                knows
              </em>{" "}
              right now.
            </h2>
            <div
              className="tabular"
              style={{
                marginTop: 6,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.08em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
              }}
            >
              SYNCED {syncTime} · {connectedCount}{" "}
              {connectedCount === 1 ? "SOURCE" : "SOURCES"}
            </div>
          </>
        )}
        {collapsed && null}
      </div>

      {collapsed ? null : (
        <>
          <CtxSection label="Your Book" suffix="LIVE">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {bookFacts.length === 0 ? (
                <li
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.16em",
                    color: "var(--cream-4)",
                    textTransform: "uppercase",
                  }}
                >
                  No book data yet - create a deal to begin.
                </li>
              ) : (
                bookFacts.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      position: "relative",
                      paddingLeft: 14,
                      fontSize: 13,
                      color: "var(--cream-2)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        width: 5,
                        height: 5,
                        background: "var(--ivy)",
                        borderRadius: "50%",
                      }}
                    />
                    <strong style={{ color: "var(--cream)", fontWeight: 500 }}>
                      {f.highlight}
                    </strong>{" "}
                    {f.rest}
                  </li>
                ))
              )}
            </ul>
          </CtxSection>

          <CtxSection label="Connected Sources" suffix={String(connectedCount)}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sources.map((s, i) => (
                <li
                  key={s.name}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "22px 1fr auto",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i === sources.length - 1 ? "none" : "1px solid var(--rule)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "grid",
                      placeItems: "center",
                      color: s.connected ? "var(--copper)" : "var(--cream-4)",
                    }}
                  >
                    <SourceIcon kind={s.kind} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--cream)",
                        fontWeight: 450,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.08em",
                        color: "var(--cream-3)",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.metaLine}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: s.connected ? "var(--ivy)" : "var(--cream-4)",
                      padding: "2px 6px",
                      border: `1px solid ${s.connected ? "var(--ivy)" : "var(--rule-strong)"}`,
                    }}
                  >
                    {s.connected ? "SYNCED" : "OFF"}
                  </span>
                </li>
              ))}
            </ul>
          </CtxSection>

          <CtxSection
            label="Recent Answers"
            suffix={String(recentAnswers.length)}
          >
            {recentAnswers.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                }}
              >
                No questions answered yet.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {recentAnswers.map((a) => (
                  <li
                    key={a.id}
                    style={{
                      padding: "10px 12px",
                      margin: "0 -12px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 14.5,
                        color: "var(--cream)",
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        marginBottom: 6,
                      }}
                    >
                      &ldquo;{a.question}&rdquo;
                    </div>
                    <div
                      className="flex"
                      style={{
                        gap: 8,
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.08em",
                        color: "var(--cream-3)",
                        textTransform: "uppercase",
                      }}
                    >
                      <span>{a.when}</span>
                      {a.meta && (
                        <>
                          <span style={{ color: "var(--rule-strong)" }}>·</span>
                          <span>{a.meta}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CtxSection>

          <CtxSection label="A Note From The Desk" noBorder>
            <div
              style={{
                background: "var(--ink-03)",
                borderLeft: "2px solid var(--copper)",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.16em",
                  color: "var(--copper)",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                ↯ Tip
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 14.5,
                  color: "var(--cream)",
                  lineHeight: 1.4,
                }}
              >
                Ask follow-ups in the same thread to keep context. Sentinel remembers
                everything in the session and can{" "}
                <em
                  style={{
                    fontStyle: "normal",
                    fontFamily: "var(--font-geist-sans)",
                    color: "var(--copper)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  cross-reference
                </em>{" "}
                earlier answers.
              </p>
            </div>
          </CtxSection>
        </>
      )}
    </aside>
  );
}

function CtxSection({
  label,
  suffix,
  children,
  noBorder,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <section
      style={{
        padding: "22px 24px",
        borderBottom: noBorder ? "none" : "1px solid var(--rule)",
      }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{
          gap: 10,
          marginBottom: 14,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        {suffix && (
          <span
            className="tabular"
            style={{ color: "var(--signal)", fontWeight: 500 }}
          >
            {suffix}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SourceIcon({ kind }: { kind: AIConnectedSource["kind"] }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "CRM":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    case "CALLS":
      return (
        <svg {...common} aria-hidden>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case "EMAIL":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "SLACK":
      return (
        <svg {...common} aria-hidden>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "CALENDAR":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="1" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
