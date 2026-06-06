"use client";

import type { AIPromptCard } from "./types";

export function IntroSection({
  promptCards,
  suggestedPrompts,
  onPromptCard,
  onSuggested,
}: {
  promptCards: AIPromptCard[];
  suggestedPrompts: string[];
  onPromptCard: (c: AIPromptCard) => void;
  onSuggested: (p: string) => void;
}) {
  return (
    <>
      <div
        className="sentinel-ai-intro"
        style={{
          width: "100%",
          maxWidth: 760,
          padding: "80px 32px 40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          className="flex items-center"
          style={{
            gap: 10,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--copper)",
          }}
        >
          <span
            aria-hidden
            className="sentinel-ai-ping"
            style={{
              width: 7,
              height: 7,
              background: "var(--ivy)",
              color: "var(--ivy)",
              borderRadius: "50%",
            }}
          />
          The Intelligence Desk · Ready
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 76px)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: "var(--cream)",
            maxWidth: 660,
          }}
        >
          Ask, and you
          <br />
          shall{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            know.
          </em>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.45,
            color: "var(--cream-2)",
            maxWidth: 540,
            letterSpacing: "-0.005em",
          }}
        >
          Sentinel reads every <InlineTag>call</InlineTag>, every{" "}
          <InlineTag>email</InlineTag>, every <InlineTag>signal</InlineTag> in
          your book - then answers in plain English. Start with one of the
          prompts below or write your own.
        </p>
      </div>

      <PromptGrid cards={promptCards} onCardClick={onPromptCard} />

      <div style={{ width: "100%", maxWidth: 760, padding: "0 32px 48px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          - Or Try One Of These -
        </div>
        <div className="flex flex-wrap justify-center" style={{ gap: 8 }}>
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggested(p)}
              className="sentinel-ai-chip"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 12.5,
                color: "var(--cream-2)",
                background: "var(--ink-02)",
                border: "1px solid var(--rule-strong)",
                padding: "8px 14px",
                cursor: "pointer",
                letterSpacing: "-0.005em",
                transition: "all 160ms",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--signal)",
                  marginRight: 4,
                }}
              >
                ›
              </span>
              {p}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function InlineTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: "var(--cream)",
        fontStyle: "normal",
        fontFamily: "var(--font-geist-sans)",
        fontSize: 14.5,
        fontWeight: 500,
        padding: "0 4px",
        borderBottom: "1px solid var(--signal)",
        letterSpacing: 0,
      }}
    >
      {children}
    </span>
  );
}

function PromptGrid({
  cards,
  onCardClick,
}: {
  cards: AIPromptCard[];
  onCardClick: (c: AIPromptCard) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "8px 32px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        border: "1px solid var(--rule)",
        background: "var(--ink-02)",
      }}
    >
      {cards.map((card, i) => {
        const rightEdge = (i + 1) % 2 === 0;
        const bottomEdge = i >= cards.length - 2;
        return (
          <button
            key={card.index}
            type="button"
            onClick={() => onCardClick(card)}
            className="sentinel-ai-prompt-card"
            style={{
              padding: "22px 22px 20px",
              borderRight: rightEdge ? "none" : "1px solid var(--rule)",
              borderBottom: bottomEdge ? "none" : "1px solid var(--rule)",
              cursor: "pointer",
              transition: "all 160ms",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              textAlign: "left",
              background: "transparent",
              color: "var(--cream)",
              position: "relative",
            }}
          >
            <div
              className="flex items-start justify-between"
              style={{ gap: 12 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--signal)",
                  fontWeight: 500,
                }}
              >
                № {card.index}
              </span>
              <span
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid var(--rule-strong)",
                  background: "var(--ink)",
                  color: toneColor(card.tone),
                }}
              >
                <PromptIcon icon={card.icon} />
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 400,
                color: "var(--cream)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginTop: 14,
              }}
            >
              {card.title}{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--signal)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                {card.italicWord}
              </em>
            </h3>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--cream-2)",
                lineHeight: 1.5,
                maxWidth: 280,
              }}
            >
              {card.sub}
            </p>
            <div
              className="flex items-center justify-between"
              style={{ marginTop: 8 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                }}
              >
                {card.tag}
              </span>
              <span
                aria-hidden
                className="sentinel-ai-pc-arrow"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "var(--cream-3)",
                  transition: "all 200ms",
                  display: "inline-block",
                }}
              >
                →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function toneColor(t: AIPromptCard["tone"]): string {
  if (t === "copper") return "var(--copper)";
  if (t === "ivy") return "var(--ivy)";
  if (t === "signal") return "var(--signal)";
  return "var(--cream-2)";
}

function PromptIcon({ icon }: { icon: AIPromptCard["icon"] }) {
  const c = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "check":
      return (
        <svg {...c} aria-hidden>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "dollar":
      return (
        <svg {...c} aria-hidden>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...c} aria-hidden>
          <path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...c} aria-hidden>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
  }
}
