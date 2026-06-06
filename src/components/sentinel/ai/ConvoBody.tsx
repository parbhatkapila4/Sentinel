"use client";

import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import type { AIMessage } from "./types";

const MD_HEADING: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--copper)",
  margin: "18px 0 8px",
};

const MD_BODY: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  lineHeight: 1.6,
  color: "var(--cream)",
  letterSpacing: "-0.01em",
  margin: "0 0 12px",
};

const MD_LIST: React.CSSProperties = {
  listStyle: "none",
  margin: "0 0 12px",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const MD_LIST_ORDERED: React.CSSProperties = {
  ...MD_LIST,
  counterReset: "sentinel-ol",
};

const MD_LI: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16.5,
  lineHeight: 1.55,
  color: "var(--cream)",
  paddingLeft: 24,
  position: "relative",
};

const MD_LI_MARKER: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  color: "var(--cream-4)",
  fontFamily: "var(--font-mono-jb)",
  fontSize: 13,
  lineHeight: "inherit",
};

const MD_STRONG: React.CSSProperties = {
  color: "var(--cream)",
  fontWeight: 500,
};

const MD_EM: React.CSSProperties = {
  fontStyle: "italic",
  color: "var(--copper)",
};

const MD_INLINE_CODE: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 13,
  padding: "1px 5px",
  background: "var(--ink-02)",
  border: "1px solid var(--rule)",
  color: "var(--cream-2)",
  letterSpacing: 0,
};

const MD_PRE: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 12.5,
  lineHeight: 1.55,
  background: "var(--ink-02)",
  border: "1px solid var(--rule)",
  padding: "12px 14px",
  margin: "0 0 14px",
  color: "var(--cream-2)",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflow: "auto",
};

const MD_BLOCKQUOTE: React.CSSProperties = {
  borderLeft: "2px solid var(--rule-strong)",
  paddingLeft: 14,
  margin: "0 0 14px",
  color: "var(--cream-2)",
  fontStyle: "italic",
};

const MD_COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <div style={{ ...MD_HEADING, marginTop: 0 }}>{children}</div>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <div style={MD_HEADING}>{children}</div>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <div style={MD_HEADING}>{children}</div>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <div style={MD_HEADING}>{children}</div>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={MD_BODY}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={MD_LIST}>{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol style={MD_LIST_ORDERED}>{children}</ol>
  ),
  li: ({
    children,
    ordered,
    index,
  }: {
    children?: React.ReactNode;
    ordered?: boolean;
    index?: number;
  }) => (
    <li style={MD_LI}>
      <span aria-hidden style={MD_LI_MARKER}>
        {ordered ? `${(index ?? 0) + 1}.` : "—"}
      </span>
      {children}
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <span style={MD_STRONG}>{children}</span>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em style={MD_EM}>{children}</em>
  ),
  code: ({
    inline,
    children,
  }: {
    inline?: boolean;
    children?: React.ReactNode;
  }) =>
    inline ? (
      <code style={MD_INLINE_CODE}>{children}</code>
    ) : (
      <code style={{ display: "block" }}>{children}</code>
    ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre style={MD_PRE}>{children}</pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote style={MD_BLOCKQUOTE}>{children}</blockquote>
  ),
  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--rule)",
        margin: "16px 0",
      }}
    />
  ),
};

export function MessageThread({
  messages,
  isSending,
  modelLabel,
}: {
  messages: AIMessage[];
  isSending: boolean;
  modelLabel: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 820,
        padding: "32px 32px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {messages.map((m) => (
        <MessageRow key={m.id} message={m} modelLabel={modelLabel} />
      ))}
      {isSending && <TypingRow modelLabel={modelLabel} />}
    </div>
  );
}

function MessageRow({
  message,
  modelLabel,
}: {
  message: AIMessage;
  modelLabel: string;
}) {
  const isUser = message.role === "user";
  const when = (() => {
    try {
      return format(new Date(message.createdAt), "HH:mm").toUpperCase();
    } catch {
      return "";
    }
  })();
  return (
    <div
      className="sentinel-ai-msg"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderLeft: `2px solid ${isUser ? "var(--signal)" : "var(--copper)"}`,
        paddingLeft: 18,
      }}
    >
      <div
        className="flex items-baseline"
        style={{
          gap: 10,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: isUser ? "var(--signal)" : "var(--copper)",
        }}
      >
        <span>{isUser ? "You" : modelLabel}</span>
        {when && (
          <>
            <span style={{ color: "var(--rule-strong)" }}>·</span>
            <span style={{ color: "var(--cream-4)" }}>{when}</span>
          </>
        )}
      </div>
      <div
        style={{
          fontFamily: isUser
            ? "var(--font-geist-sans)"
            : "var(--font-serif)",
          fontSize: isUser ? 15 : 17,
          lineHeight: 1.6,
          color: "var(--cream)",
          letterSpacing: isUser ? "-0.005em" : "-0.01em",
          whiteSpace: isUser ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown components={MD_COMPONENTS}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function TypingRow({ modelLabel }: { modelLabel: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderLeft: "2px solid var(--copper)",
        paddingLeft: 18,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--copper)",
        }}
      >
        {modelLabel}
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          alignItems: "center",
          color: "var(--cream-3)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 16,
        }}
      >
        <span className="sentinel-ai-typing-dot" aria-hidden>
          ·
        </span>
        <span
          className="sentinel-ai-typing-dot"
          style={{ animationDelay: "160ms" }}
          aria-hidden
        >
          ·
        </span>
        <span
          className="sentinel-ai-typing-dot"
          style={{ animationDelay: "320ms" }}
          aria-hidden
        >
          ·
        </span>
        <span style={{ marginLeft: 6 }}>composing</span>
      </div>
    </div>
  );
}

export function ConvoLoading() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 760,
        padding: "80px 32px",
        textAlign: "center",
        fontFamily: "var(--font-mono-jb)",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--cream-3)",
      }}
    >
      Loading thread…
    </div>
  );
}
