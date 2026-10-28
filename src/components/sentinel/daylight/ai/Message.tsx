"use client";

import type { CSSProperties, ReactNode } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import type { AIMessage } from "@/components/sentinel/ai/types";
import { Bone } from "../bone";

const bodyStyle: CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.65,
  color: "var(--dl-text-2)",
};

const headingStyle: CSSProperties = {
  margin: "18px 0 8px",
  fontSize: 14.5,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "var(--dl-ink)",
};

type Children = { children?: ReactNode };

const MD_COMPONENTS = {
  h1: ({ children }: Children) => <p style={{ ...headingStyle, marginTop: 0 }}>{children}</p>,
  h2: ({ children }: Children) => <p style={headingStyle}>{children}</p>,
  h3: ({ children }: Children) => <p style={headingStyle}>{children}</p>,
  h4: ({ children }: Children) => <p style={headingStyle}>{children}</p>,
  p: ({ children }: Children) => <p style={{ margin: "0 0 12px" }}>{children}</p>,
  ul: ({ children }: Children) => (
    <ul style={{ margin: "0 0 12px", paddingLeft: 20, listStyle: "disc" }}>{children}</ul>
  ),
  ol: ({ children }: Children) => (
    <ol
      style={{
        margin: "0 0 12px",
        borderTop: "1px solid var(--dl-divider)",
        listStyle: "none",
        counterReset: "dl-answer",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }: Children) => (
    <li className="dl-ai-li" style={{ padding: "8px 0" }}>
      {children}
    </li>
  ),
  strong: ({ children }: Children) => (
    <b style={{ fontWeight: 600, color: "var(--dl-ink)" }}>{children}</b>
  ),
  em: ({ children }: Children) => <em style={{ fontStyle: "italic" }}>{children}</em>,
  a: ({ children, href }: Children & { href?: string }) => (
    <a
      href={href}
      target={href?.startsWith("/") ? undefined : "_blank"}
      rel={href?.startsWith("/") ? undefined : "noreferrer"}
      className="dl-link"
      style={{ fontWeight: 600, color: "var(--dl-ink)", textDecoration: "underline", minHeight: 0 }}
    >
      {children}
    </a>
  ),
  code: ({ children }: Children) => (
    <code
      style={{
        padding: "1px 5px",
        borderRadius: 5,
        background: "var(--dl-chip)",
        fontFamily: "var(--dl-font-mono)",
        fontSize: 12.5,
        color: "var(--dl-ink)",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }: Children) => (
    <pre
      style={{
        margin: "0 0 14px",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid var(--dl-border)",
        background: "var(--dl-panel)",
        fontFamily: "var(--dl-font-mono)",
        fontSize: 12.5,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "auto",
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }: Children) => (
    <blockquote
      style={{
        margin: "0 0 14px",
        paddingLeft: 14,
        borderLeft: "2px solid var(--dl-border-strong)",
        color: "var(--dl-muted)",
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ margin: "16px 0", border: 0, borderTop: "1px solid var(--dl-divider)" }} />
  ),
};

function timeOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : format(date, "HH:mm");
}

function Who({ when }: { when?: string }) {
  return (
    <p style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 12.5, color: "var(--dl-muted)" }}>
      <b
        style={{
          fontFamily: "var(--dl-font-serif)",
          fontStyle: "italic",
          fontSize: 17,
          fontWeight: 400,
          color: "var(--dl-ink)",
        }}
      >
        Sentinel
      </b>
      {when && <span>{when}</span>}
    </p>
  );
}

export function MessageItem({ message }: { message: AIMessage }) {
  if (message.role === "user") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          padding: "11px 14px",
          borderRadius: 12,
          border: "1px solid var(--dl-border)",
          background: "var(--dl-panel)",
          boxShadow: "var(--dl-shadow)",
          fontSize: 14.5,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    );
  }
  return (
    <div style={{ ...bodyStyle, maxWidth: 680, wordBreak: "break-word" }}>
      <Who when={timeOf(message.createdAt)} />
      <div className="dl-ai-answer" style={{ marginTop: 12 }}>
        <ReactMarkdown components={MD_COMPONENTS}>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export function AnswerPending() {
  return (
    <div role="status" aria-label="Sentinel is writing an answer" style={{ maxWidth: 680 }}>
      <Who when="writing" />
      <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        <Bone w="92%" h={11} />
        <Bone w="84%" h={11} />
        <Bone w="58%" h={11} />
      </div>
    </div>
  );
}

export function ThreadLoading() {
  return (
    <div role="status" aria-label="Loading thread" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {[
        { ask: "48%", answer: ["94%", "88%", "62%"] },
        { ask: "36%", answer: ["90%", "52%"] },
      ].map((turn, i) => (
        <div key={i} aria-hidden style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Bone w={turn.ask} h={42} r={12} style={{ alignSelf: "flex-end" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
            <Bone w={96} h={12} />
            {turn.answer.map((w, j) => (
              <Bone key={j} w={w} h={11} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
