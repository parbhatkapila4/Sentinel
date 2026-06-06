import Link from "next/link";
import type { AIPanelContent } from "../types";

interface AIPanelProps {
  content: AIPanelContent;
}

export function AIPanel({ content }: AIPanelProps) {
  return (
    <section
      className="border-y relative py-8 lg:py-11 px-6 sm:px-10 lg:px-14"
      style={{
        borderColor: "var(--rule)",
        background: "var(--ink-02)",
      }}
      aria-label="AI desk"
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 2,
          background: "var(--signal)",
        }}
      />
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr]"
        style={{ gap: 48 }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--signal)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Sentinel AI · Subject
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 30,
              lineHeight: 1.2,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
            }}
          >
            {content.subject}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
              marginTop: 22,
            }}
          >
            ANSWERED {content.answeredAt} · {content.sourceCount} SOURCES
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Question
          </div>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.55,
              color: "var(--cream-2)",
              marginBottom: 22,
            }}
          >
            {content.question}
          </p>

          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Answer
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.35,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
              marginBottom: 26,
            }}
          >
            {content.answer.map((seg, i) => {
              if (seg.kind === "italic") {
                return (
                  <em
                    key={i}
                    style={{
                      fontStyle: "italic",
                      color: "var(--signal)",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {seg.value}
                  </em>
                );
              }
              if (seg.kind === "mark") {
                return (
                  <span
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--copper)",
                      paddingBottom: 1,
                    }}
                  >
                    {seg.value}
                  </span>
                );
              }
              return <span key={i}>{seg.value}</span>;
            })}
          </p>

          <div
            className="flex flex-wrap"
            style={{
              gap: 8,
              borderTop: "1px solid var(--rule)",
              paddingTop: 16,
            }}
          >
            {content.citations.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="tabular"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  border: "1px solid var(--rule-strong)",
                  padding: "4px 8px",
                }}
              >
                [{i + 1}] {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Next actions
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {content.actions.map((a, i) => {
              const card = (
                <div
                  className="anim-rise"
                  style={{
                    animationDelay: `${100 + i * 80}ms`,
                    background: "var(--ink-03)",
                    border: "1px solid var(--rule)",
                    padding: "14px 16px",
                    transition: "border-color 120ms ease, color 120ms ease",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      lineHeight: 1.25,
                      color: "var(--cream)",
                      marginBottom: 4,
                    }}
                  >
                    <em
                      style={{
                        fontStyle: "italic",
                        color: "var(--signal)",
                        fontFamily: "var(--font-serif)",
                        marginRight: 8,
                      }}
                    >
                      →
                    </em>
                    {a.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "var(--cream-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    {a.subtitle}
                  </div>
                </div>
              );
              return (
                <li key={`${a.title}-${i}`}>
                  {a.href ? <Link href={a.href}>{card}</Link> : card}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
