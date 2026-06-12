"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateDealSummary } from "@/app/actions/ai";
import { logError } from "@/lib/logger";

interface DealSummaryCardProps {
  dealId: string;
}

const MD_SECTION_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--signal)",
  margin: "22px 0 10px",
};

const MD_BODY: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  lineHeight: 1.65,
  color: "var(--cream-2)",
  margin: "0 0 14px",
};

const MD_LIST: React.CSSProperties = {
  listStyle: "none",
  margin: "0 0 14px",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const MD_LIST_ITEM: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 15.5,
  lineHeight: 1.6,
  color: "var(--cream-2)",
  paddingLeft: 22,
  position: "relative",
};

const MD_LIST_MARKER: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  color: "var(--cream-4)",
  fontFamily: "var(--font-mono-jb)",
  fontSize: 12,
  lineHeight: "inherit",
};

const MD_STRONG: React.CSSProperties = {
  color: "var(--cream)",
  fontWeight: 500,
};

const MD_EM: React.CSSProperties = {
  fontStyle: "italic",
  color: "var(--signal)",
};

const MD_COMPONENTS = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <div style={{ ...MD_SECTION_LABEL, marginTop: 0 }}>{children}</div>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <div style={MD_SECTION_LABEL}>{children}</div>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <div style={MD_SECTION_LABEL}>{children}</div>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={MD_BODY}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={MD_LIST}>{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ul style={MD_LIST}>{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={MD_LIST_ITEM}>
      <span aria-hidden style={MD_LIST_MARKER}>
        -
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
  code: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  hr: () => null,
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "refreshing"; previous: string }
  | { kind: "ready"; summary: string }
  | { kind: "error"; message: string; hadPrevious: string | null };

function messageFromError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e.length > 0) return e;
  return "The AI service did not respond. Please try again.";
}

function normalizeForMarkdown(text: string): string {
  return text.replace(/^([A-Z][A-Z\s·&-]{1,28})$/gm, "## $1");
}

export function DealSummaryCard({ dealId }: DealSummaryCardProps) {
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  const load = useCallback(async () => {
    setState((prev) => {
      if (prev.kind === "ready") {
        return { kind: "refreshing", previous: prev.summary };
      }
      if (prev.kind === "error" && prev.hadPrevious) {
        return { kind: "refreshing", previous: prev.hadPrevious };
      }
      return { kind: "loading" };
    });
    try {
      const s = await generateDealSummary(dealId);
      const trimmed = s.trim();
      if (!trimmed) {
        setState({
          kind: "error",
          message: "The AI service returned an empty response. Please try again.",
          hadPrevious: null,
        });
        return;
      }
      setState({ kind: "ready", summary: trimmed });
    } catch (e) {
      logError("Failed to load deal summary", e, { dealId });
      setState((prev) => ({
        kind: "error",
        message: messageFromError(e),
        hadPrevious:
          prev.kind === "ready"
            ? prev.summary
            : prev.kind === "refreshing"
              ? prev.previous
              : prev.kind === "error"
                ? prev.hadPrevious
                : null,
      }));
    }
  }, [dealId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isLoading = state.kind === "loading";
  const isRefreshing = state.kind === "refreshing";
  const isError = state.kind === "error";
  const busy = isLoading || isRefreshing;

  const buttonLabel = isRefreshing
    ? "Refreshing…"
    : isLoading
      ? "Loading…"
      : isError
        ? "Retry"
        : "Refresh";

  return (
    <section
      style={{
        border: "1px solid var(--rule)",
        background: "var(--ink-02)",
        padding: "28px 26px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
            }}
          >
            § - SUMMARY
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
            The{" "}
            <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
              brief
            </em>
            .
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "7px 12px",
            border: `1px solid ${isError ? "var(--signal)" : "var(--rule-strong)"}`,
            background: "transparent",
            color: isError ? "var(--signal)" : "var(--cream-2)",
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.55 : 1,
          }}
        >
          {buttonLabel}
        </button>
      </div>

      {isLoading ? (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--cream-3)",
            margin: 0,
          }}
        >
          Drafting a summary…
        </p>
      ) : isError ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--signal)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--signal)",
              }}
            >
              Unable to draft a summary
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--cream-2)",
              margin: 0,
            }}
          >
            {state.message}
          </p>
          {state.hadPrevious && (
            <details
              style={{
                marginTop: 4,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "var(--cream-3)",
              }}
            >
              <summary style={{ cursor: "pointer" }}>
                Show last successful brief
              </summary>
              <div style={{ marginTop: 10 }}>
                <ReactMarkdown components={MD_COMPONENTS}>
                  {normalizeForMarkdown(state.hadPrevious)}
                </ReactMarkdown>
              </div>
            </details>
          )}
        </div>
      ) : (
        <div
          style={{
            opacity: isRefreshing ? 0.6 : 1,
            transition: "opacity 180ms ease",
          }}
        >
          <ReactMarkdown components={MD_COMPONENTS}>
            {normalizeForMarkdown(
              state.kind === "ready"
                ? state.summary
                : state.kind === "refreshing"
                  ? state.previous
                  : "-"
            )}
          </ReactMarkdown>
        </div>
      )}
    </section>
  );
}
