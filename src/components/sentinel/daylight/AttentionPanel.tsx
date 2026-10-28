import Link from "next/link";
import { formatShortMoney } from "@/lib/format-money";
import type { AIPanelContent, ShortListItem } from "../types";
import { fullCurrency, parseIdleDays, sentenceCase } from "./format";
import { FIRST_LOOK_COLUMNS, TABLE_MIN_WIDTH } from "./table-columns";
import {
  Chevron,
  CountPill,
  Monogram,
  StageSteps,
  cellSubStyle,
  cellTitleStyle,
  emptyStyle,
  tableHeadStyle,
} from "./ui";

interface AttentionPanelProps {
  shortList: ShortListItem[];
  activeCount: number;
  flaggedCount: number;
  flaggedValue: number;
  aiPanel: AIPanelContent;
}

const RISK: Record<ShortListItem["riskLabel"], { label: string; dot: string }> = {
  HIGH: { label: "High", dot: "var(--dl-signal)" },
  MEDIUM: { label: "Medium", dot: "var(--dl-amber)" },
  HEALTHY: { label: "Healthy", dot: "var(--dl-green)" },
};

function idleColor(severity: ShortListItem["ageSeverity"]): string {
  if (severity === "high") return "var(--dl-signal)";
  if (severity === "medium") return "var(--dl-amber)";
  return "var(--dl-context)";
}

function emphasisColor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("high")) return "var(--dl-signal)";
  if (t.includes("medium")) return "var(--dl-amber)";
  if (t.includes("low")) return "var(--dl-green)";
  return "var(--dl-border-strong)";
}

function FirstLookRow({ item, last }: { item: ShortListItem; last: boolean }) {
  const idle = parseIdleDays(item.ageNote);
  const risk = RISK[item.riskLabel];
  return (
    <div
      className="dl-row"
      style={{
        display: "grid",
        flex: 1,
        gridTemplateColumns: FIRST_LOOK_COLUMNS,
        columnGap: 16,
        alignItems: "center",
        minHeight: 64,
        padding: "0 var(--dl-gutter)",
        borderBottom: last ? undefined : "1px solid var(--dl-row)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Monogram name={item.name} />
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/deals/${item.id}`}
            className="dl-link"
            style={{
              display: "block",
              minHeight: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--dl-ink)",
            }}
          >
            {item.name}
          </Link>
          <div
            style={{
              ...cellSubStyle,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.location ?? item.segment}
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, color: "var(--dl-text-2)" }}>{item.stage}</div>
        <StageSteps stage={item.stage} />
      </div>
      <div>
        <div
          title={sentenceCase(item.ageNote)}
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {idle === null ? sentenceCase(item.ageNote) : `${idle}d`}
        </div>
        {idle !== null && (
          <div
            style={{
              width: 48,
              height: 3,
              marginTop: 7,
              borderRadius: 2,
              background: "var(--dl-track)",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.round((idle / 30) * 100))}%`,
                height: "100%",
                borderRadius: 2,
                background: idleColor(item.ageSeverity),
              }}
            />
          </div>
        )}
      </div>
      <div>
        <span
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
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: risk.dot,
            }}
          />
          {risk.label}
        </span>
      </div>
      <div
        style={{
          textAlign: "right",
          fontSize: 14,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fullCurrency(item.value)}
      </div>
    </div>
  );
}

function AiAnswer({ content }: { content: AIPanelContent }) {
  return (
    <section
      aria-label="Sentinel AI"
      className="dl-third"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: `18px var(--dl-gutter) ${content.actions.length > 0 ? 0 : 20}px`,
      }}
    >
      <div className="flex flex-wrap items-center" style={{ gap: "6px 10px" }}>
        <h2 style={cellTitleStyle}>Sentinel AI</h2>
        <span
          style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--dl-muted)" }}
        >
          Answered {content.answeredAt}
        </span>
      </div>
      <p
        style={{
          maxWidth: 680,
          marginTop: 14,
          padding: "10px 13px",
          borderRadius: 10,
          background: "var(--dl-chip)",
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--dl-text-2)",
        }}
      >
        {content.question}
      </p>
      <p
        style={{
          maxWidth: 680,
          marginTop: 14,
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--dl-ink)",
        }}
      >
        {content.answer.map((seg, i) => {
          if (seg.kind === "italic") {
            return (
              <span
                key={i}
                style={{
                  fontWeight: 600,
                  textDecoration: "underline",
                  textDecorationColor: emphasisColor(seg.value),
                  textDecorationThickness: 2,
                  textUnderlineOffset: 3,
                }}
              >
                {seg.value}
              </span>
            );
          }
          if (seg.kind === "mark") {
            return (
              <span key={i} style={{ fontWeight: 600 }}>
                {seg.value}
              </span>
            );
          }
          return <span key={i}>{seg.value}</span>;
        })}
      </p>
      {content.citations.length > 0 && (
        <div
          aria-label="Sources"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 12,
            fontSize: 12,
            color: "var(--dl-text-2)",
          }}
        >
          {content.citations.map((c, i) => (
            <span
              key={`${c}-${i}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 22,
                padding: "0 8px",
                borderRadius: 6,
                border: "1px solid var(--dl-border)",
              }}
            >
              {sentenceCase(c)}
            </span>
          ))}
        </div>
      )}
      {content.actions.length > 0 && (
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <div
            style={{
              margin: "0 calc(var(--dl-gutter) * -1)",
              borderTop: "1px solid var(--dl-divider)",
            }}
          >
            {content.actions.map((a, i) => {
              const rowStyle: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 44,
                padding: "6px var(--dl-gutter)",
                borderTop: i === 0 ? undefined : "1px solid var(--dl-row)",
                color: "var(--dl-ink)",
              };
              const body = (
                <>
                  <span
                    style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500 }}
                  >
                    {a.title}
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--dl-muted)" }}>
                    {a.subtitle}
                  </span>
                  {a.href && <Chevron color="var(--dl-context)" />}
                </>
              );
              return a.href ? (
                <Link
                  key={`${a.title}-${i}`}
                  href={a.href}
                  className="dl-action"
                  style={rowStyle}
                >
                  {body}
                </Link>
              ) : (
                <div key={`${a.title}-${i}`} style={rowStyle}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function AttentionPanel({
  shortList,
  activeCount,
  flaggedCount,
  flaggedValue,
  aiPanel,
}: AttentionPanelProps) {
  return (
    <div className="dl-grid">
      <section
        aria-label="Deals to look at first"
        className="dl-two-thirds"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
        >
          <div className="flex flex-wrap items-center" style={{ gap: "4px 9px" }}>
            <h2 style={cellTitleStyle}>Deals to look at first</h2>
            <CountPill>{shortList.length}</CountPill>
            <span style={cellSubStyle}>Ranked by urgency and value</span>
          </div>
          <Link
            href="/deals"
            className="dl-link inline-flex items-center"
            style={{
              gap: 3,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--dl-ink)",
            }}
          >
            All deals
            <Chevron />
          </Link>
        </div>
        {shortList.length === 0 ? (
          <div
            style={{
              ...emptyStyle,
              flex: 1,
              borderTop: "1px solid var(--dl-divider)",
            }}
          >
            No active deals on the desk.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                minWidth: TABLE_MIN_WIDTH,
              }}
            >
              <div style={{ ...tableHeadStyle, gridTemplateColumns: FIRST_LOOK_COLUMNS }}>
                <span>Deal</span>
                <span>Stage</span>
                <span>Idle</span>
                <span>Risk</span>
                <span style={{ textAlign: "right" }}>Value</span>
              </div>
              {shortList.map((item, i) => (
                <FirstLookRow
                  key={item.id}
                  item={item}
                  last={i === shortList.length - 1}
                />
              ))}
            </div>
          </div>
        )}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{
            gap: "4px 16px",
            minHeight: 44,
            padding: "8px var(--dl-gutter)",
            background: "var(--dl-tint)",
            borderTop: "1px solid var(--dl-divider)",
            fontSize: 13,
            color: "var(--dl-muted)",
          }}
        >
          <span>
            {flaggedCount === 0 ? (
              "No active deals are flagged"
            ) : (
              <>
                {flaggedCount} of {activeCount} active{" "}
                {activeCount === 1 ? "deal is" : "deals are"} flagged, worth{" "}
                <strong style={{ fontWeight: 600, color: "var(--dl-ink)" }}>
                  {formatShortMoney(flaggedValue)}
                </strong>
              </>
            )}
          </span>
          <Link
            href="/risk-overview"
            className="dl-link inline-flex items-center"
            style={{ gap: 3, fontWeight: 500, color: "var(--dl-ink)" }}
          >
            Open risk overview
            <Chevron />
          </Link>
        </div>
      </section>
      <AiAnswer content={aiPanel} />
    </div>
  );
}
