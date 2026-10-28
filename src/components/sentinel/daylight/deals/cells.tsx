import type { CSSProperties } from "react";
import { initials } from "../format";
import { StageSteps } from "../ui";
import {
  closedKind,
  dueHint,
  idleMeter,
  relativeAge,
  riskTone,
  type DealRow,
  type DueHint,
  type IdleMeter,
} from "./model";

const ellipsis: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function DemoTag() {
  return (
    <span
      style={{
        flexShrink: 0,
        padding: "1px 5px",
        borderRadius: 5,
        border: "1px solid rgba(127, 82, 16, 0.45)",
        fontFamily: "var(--dl-font-mono)",
        fontSize: 9.5,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--dl-amber-text)",
      }}
    >
      Demo
    </span>
  );
}

export function RiskDot({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}

export function RiskCell({ deal }: { deal: DealRow }) {
  const tone = riskTone(deal.riskScore, deal.status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        title={deal.riskReason ?? undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 24,
          padding: "0 9px 0 8px",
          borderRadius: 7,
          background: "var(--dl-panel)",
          border: "1px solid var(--dl-border)",
          fontSize: 12.5,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <RiskDot color={tone.color} />
        {tone.label}
      </span>
      {tone.key !== "closed" && (
        <span
          className="dl-col-score"
          aria-label={`Risk score ${deal.riskScore.toFixed(2)}`}
          style={{
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11.5,
            color: "var(--dl-muted)",
          }}
        >
          {deal.riskScore.toFixed(2)}
        </span>
      )}
    </div>
  );
}

const CLOSED_BAR: Record<"won" | "lost", { color: string; label: string }> = {
  won: { color: "var(--dl-green)", label: "Closed won" },
  lost: { color: "var(--dl-context)", label: "Closed lost" },
};

export function StageMark({ stage }: { stage: string }) {
  const closed = closedKind(stage);
  if (!closed) return <StageSteps stage={stage} />;
  return (
    <div
      role="img"
      aria-label={CLOSED_BAR[closed].label}
      style={{
        width: 81,
        height: 3,
        marginTop: 6,
        borderRadius: 2,
        background: CLOSED_BAR[closed].color,
      }}
    />
  );
}

export function OwnerCell({ owner }: { owner: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      {owner ? (
        <span
          aria-hidden
          style={{
            display: "flex",
            flex: "0 0 24px",
            alignItems: "center",
            justifyContent: "center",
            height: 24,
            borderRadius: "50%",
            background: "var(--dl-track)",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--dl-text-2)",
          }}
        >
          {initials(owner)}
        </span>
      ) : (
        <span
          aria-hidden
          style={{
            flex: "0 0 24px",
            height: 24,
            borderRadius: "50%",
            border: "1px dashed rgba(30, 41, 59, 0.3)",
          }}
        />
      )}
      <span
        style={{
          ...ellipsis,
          fontSize: 13,
          color: owner ? "var(--dl-text-2)" : "var(--dl-muted)",
        }}
      >
        {owner ?? "Unassigned"}
      </span>
    </div>
  );
}

const DUE_STYLE: Record<DueHint["tone"], CSSProperties> = {
  overdue: { fontWeight: 500, color: "var(--dl-signal-d)" },
  today: { fontWeight: 500, color: "var(--dl-amber-text)" },
  upcoming: { color: "var(--dl-muted)" },
};

export function ActionCell({ deal, nowMs }: { deal: DealRow; nowMs: number }) {
  if (!deal.action) {
    return (
      <div style={{ minWidth: 0, fontSize: 13.5, color: "var(--dl-muted)" }}>
        No action needed
      </div>
    );
  }
  const due = dueHint(deal.actionDueAt, deal.overdueDays, nowMs);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...ellipsis, fontSize: 13.5 }} title={deal.action}>
        {deal.action}
      </div>
      {due && <div style={{ fontSize: 12, ...DUE_STYLE[due.tone] }}>{due.text}</div>}
    </div>
  );
}

const IDLE_COLOR: Record<IdleMeter["tone"], string> = {
  quiet: "var(--dl-context)",
  watch: "var(--dl-amber)",
  stale: "var(--dl-signal)",
};

export function ActivityCell({ deal, nowMs }: { deal: DealRow; nowMs: number }) {
  const idle = idleMeter(deal.lastActivityAt, nowMs);
  return (
    <div>
      <div
        style={{ fontSize: 13, color: "var(--dl-text-2)", whiteSpace: "nowrap" }}
      >
        {relativeAge(deal.lastActivityAt, nowMs)}
      </div>
      {deal.status !== "closed" && (
        <div
          aria-hidden
          style={{
            width: 48,
            height: 3,
            marginTop: 6,
            borderRadius: 2,
            background: "var(--dl-track)",
          }}
        >
          <div
            style={{
              width: `${idle.percent}%`,
              height: "100%",
              borderRadius: 2,
              background: IDLE_COLOR[idle.tone],
            }}
          />
        </div>
      )}
    </div>
  );
}
