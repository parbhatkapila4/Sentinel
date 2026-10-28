"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateDealSummary } from "@/app/actions/ai";
import { CellHead } from "../blocks";
import { Bone } from "../bone";
import { parseBrief } from "./model";
import { smallSecondary } from "./sections";

type SummaryState =
  | { kind: "loading" }
  | { kind: "refreshing"; previous: string }
  | { kind: "ready"; summary: string }
  | { kind: "error"; message: string; previous: string | null };

function messageFrom(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "Sentinel AI did not answer. Try again in a moment.";
}

function previousOf(state: SummaryState): string | null {
  if (state.kind === "ready") return state.summary;
  if (state.kind === "refreshing") return state.previous;
  if (state.kind === "error") return state.previous;
  return null;
}

export function SummarySection({
  dealId,
  initialSummary,
  load = generateDealSummary,
}: {
  dealId: string;
  initialSummary?: string;
  load?: (dealId: string) => Promise<string>;
}) {
  const [state, setState] = useState<SummaryState>(() =>
    initialSummary ? { kind: "ready", summary: initialSummary } : { kind: "loading" }
  );

  const run = useCallback(async () => {
    setState((prev) => {
      const previous = previousOf(prev);
      return previous ? { kind: "refreshing", previous } : { kind: "loading" };
    });
    try {
      const summary = (await load(dealId)).trim();
      if (!summary) {
        setState((prev) => ({
          kind: "error",
          message: "Sentinel AI returned an empty brief. Try again.",
          previous: previousOf(prev),
        }));
        return;
      }
      setState({ kind: "ready", summary });
    } catch (err) {
      setState((prev) => ({ kind: "error", message: messageFrom(err), previous: previousOf(prev) }));
    }
  }, [dealId, load]);

  useEffect(() => {
    if (initialSummary) return;
    void run();
  }, [run, initialSummary]);

  const shown = state.kind === "ready" ? state.summary : state.kind === "refreshing" ? state.previous : null;
  const parts = useMemo(() => (shown ? parseBrief(shown) : []), [shown]);
  const busy = state.kind === "loading" || state.kind === "refreshing";

  return (
    <section className="dl-dd-sec" aria-label="Summary">
      <CellHead
        title="Summary"
        sub="Written by Sentinel AI from this deal's history"
        right={
          <button
            type="button"
            onClick={() => void run()}
            disabled={busy}
            aria-busy={busy || undefined}
            className="dl-btn-secondary"
            style={{ ...smallSecondary, opacity: busy ? 0.55 : 1, cursor: busy ? "not-allowed" : "pointer" }}
          >
            {state.kind === "refreshing" ? "Refreshing" : state.kind === "error" ? "Retry" : "Refresh"}
          </button>
        }
      />
      <div className="dl-dd-body">
        {state.kind === "loading" ? (
          <div role="status" aria-label="Writing the summary" className="dl-dd-brief">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <span style={{ display: "flex", alignItems: "center", height: 15.75 }}>
                  <Bone w={i === 1 ? 64 : 48} h={7} />
                </span>
                <span style={{ display: "flex", alignItems: "center", height: 22.4, marginTop: 3 }}>
                  <Bone w={i % 2 === 0 ? "96%" : "88%"} h={9} />
                </span>
                {i === 1 && (
                  <span style={{ display: "flex", alignItems: "center", height: 22.4 }}>
                    <Bone w="54%" h={9} />
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : state.kind === "error" ? (
          <div role="alert">
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dl-signal-d)" }}>
              Sentinel AI could not write a summary just now.
            </p>
            <p style={{ marginTop: 4, fontSize: 13.5, lineHeight: 1.6, color: "var(--dl-text-2)" }}>
              {state.message}
            </p>
          </div>
        ) : (
          <div
            className="dl-dd-brief"
            style={{ opacity: state.kind === "refreshing" ? 0.55 : 1, transition: "opacity 140ms ease" }}
          >
            {parts.map((part, i) => (
              <div key={i}>
                {part.label && <h3 className="dl-dd-brief-label">{part.label}</h3>}
                <p>{part.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
