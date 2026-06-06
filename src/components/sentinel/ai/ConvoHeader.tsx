"use client";

import type { AISession } from "./types";

export function ConvoHeader({
  activeSession,
  isSending,
  ctxLabel,
}: {
  activeSession: AISession | null;
  isSending: boolean;
  ctxLabel: string;
}) {
  const status = isSending ? "THINKING" : "READY · LISTENING";
  const dotColor = isSending ? "var(--copper)" : "var(--ivy)";
  const title = activeSession ? activeSession.title : "A new thread.";

  return (
    <div
      style={{
        padding: "14px 32px",
        borderBottom: "1px solid var(--rule)",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) auto",
        alignItems: "center",
        gap: 16,
        background: "var(--ink)",
      }}
    >
      <div className="flex items-center" style={{ gap: 14, minWidth: 0 }}>
        <div
          className="flex items-center"
          style={{
            gap: 8,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: dotColor,
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            className="sentinel-ai-ping"
            style={{
              width: 6,
              height: 6,
              background: dotColor,
              borderRadius: "50%",
            }}
          />
          {status}
        </div>
        <span
          aria-hidden
          style={{
            width: 1,
            height: 14,
            background: "var(--rule)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          color: "var(--cream-3)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        CTX · {ctxLabel}
      </div>
    </div>
  );
}
