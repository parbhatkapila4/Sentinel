import type { CSSProperties } from "react";
import { formatShortMoney } from "@/lib/format-money";
import { fullCurrency } from "../format";
import { STAGE_CHART_COLUMNS, STAGE_CHART_MIN_WIDTH } from "../table-columns";
import { StageSteps, tableHeadStyle } from "../ui";
import { SectionHead } from "./SectionHead";
import {
  ageMeter,
  axisLabel,
  valueAxis,
  type AgeMeter,
  type StageRow,
} from "./model";

const AGE_COLOR: Record<AgeMeter["tone"], string> = {
  quiet: "var(--dl-context)",
  watch: "var(--dl-amber)",
  stale: "var(--dl-signal)",
};

const BAR_COLOR: Record<StageRow["bucket"], string> = {
  open: "var(--dl-ink)",
  won: "var(--dl-green)",
};

const gridLine = "rgba(30, 41, 59, 0.08)";

const numberStyle: CSSProperties = {
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

function plural(count: number): string {
  return `${count.toLocaleString("en-US")} deal${count === 1 ? "" : "s"}`;
}

function ageText(days: number): string {
  return `${days.toLocaleString("en-US")} day${days === 1 ? "" : "s"}`;
}

function StageName({ row }: { row: StageRow }) {
  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.label}</div>
      {row.bucket === "won" ? (
        <div
          role="img"
          aria-label="Closed won"
          style={{
            width: 81,
            height: 3,
            marginTop: 5,
            borderRadius: 2,
            background: "var(--dl-green)",
          }}
        />
      ) : (
        <StageSteps stage={row.stage} marginTop={5} />
      )}
    </div>
  );
}

function Legend({ open, won }: { open: number; won: number }) {
  const items = [
    { label: `Open ${formatShortMoney(open)}`, color: BAR_COLOR.open },
    { label: `Won ${formatShortMoney(won)}`, color: BAR_COLOR.won },
  ];
  return (
    <div
      className="flex flex-wrap items-center"
      style={{ gap: "4px 14px", fontSize: 12.5, color: "var(--dl-text-2)" }}
    >
      {items.map((item) => (
        <span
          key={item.label}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: item.color,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function StageChart({ rows }: { rows: StageRow[] }) {
  const axis = valueAxis(Math.max(0, ...rows.map((r) => r.value)));
  const intervals = Math.max(1, axis.ticks.length - 1);
  const openValue = rows
    .filter((r) => r.bucket === "open")
    .reduce((sum, r) => sum + r.value, 0);
  const wonValue = rows
    .filter((r) => r.bucket === "won")
    .reduce((sum, r) => sum + r.value, 0);
  const widest = Math.max(1, ...rows.map((r) => r.value));

  return (
    <section
      aria-label="Value and age by stage"
      className="dl-two-thirds"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <SectionHead
        title="By stage"
        sub="Where the dollars are sitting"
        kicker="By stage"
        shortSub="Where the dollars sit"
        right={<Legend open={openValue} won={wonValue} />}
        narrowRight={
          <span
            style={{
              fontFamily: "var(--dl-font-mono)",
              fontSize: 11,
              color: "var(--dl-muted)",
            }}
          >
            {formatShortMoney(openValue)} open
          </span>
        }
      />

      <div className="dl-wide-only" style={{ overflowX: "auto" }}>
        <div
          role="table"
          aria-label="Value and average age by stage"
          style={{ minWidth: STAGE_CHART_MIN_WIDTH }}
        >
          <div
            role="row"
            style={{ ...tableHeadStyle, gridTemplateColumns: STAGE_CHART_COLUMNS }}
          >
            <span role="columnheader">Stage</span>
            <div
              role="columnheader"
              aria-label="Value scale"
              style={{ position: "relative", height: 16, letterSpacing: "0.02em" }}
            >
              {axis.ticks.map((tick, i) => {
                const last = i === axis.ticks.length - 1;
                const place: CSSProperties =
                  i === 0
                    ? { left: 0 }
                    : last
                      ? { right: 0 }
                      : {
                          left: `${(tick / axis.max) * 100}%`,
                          transform: "translateX(-50%)",
                        };
                return (
                  <span key={tick} style={{ position: "absolute", ...place }}>
                    {axisLabel(tick)}
                  </span>
                );
              })}
            </div>
            <span role="columnheader" style={{ textAlign: "right" }}>
              Value
            </span>
            <span role="columnheader" style={{ textAlign: "right" }}>
              Deals
            </span>
            <span role="columnheader">Average age</span>
          </div>
          {rows.map((row, i) => {
            const age = row.avgAgeDays === null ? null : ageMeter(row.avgAgeDays);
            return (
              <div
                key={row.stage}
                role="row"
                className="dl-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: STAGE_CHART_COLUMNS,
                  columnGap: 16,
                  alignItems: "center",
                  minHeight: 54,
                  padding: "0 var(--dl-gutter)",
                  borderBottom:
                    i === rows.length - 1 ? undefined : "1px solid var(--dl-row)",
                }}
              >
                <div role="cell">
                  <StageName row={row} />
                </div>
                <div
                  role="cell"
                  style={{
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    borderRight: `1px solid ${gridLine}`,
                    background: `linear-gradient(to right, ${gridLine} 1px, transparent 1px) 0 0 / ${100 / intervals}% 100%`,
                  }}
                >
                  {row.value > 0 && (
                    <span
                      title={`${row.label} · ${fullCurrency(row.value)} · ${plural(row.count)}`}
                      style={{
                        display: "block",
                        width: `${(row.value / axis.max) * 100}%`,
                        minWidth: 3,
                        height: 8,
                        borderRadius: "0 3px 3px 0",
                        background: BAR_COLOR[row.bucket],
                      }}
                    />
                  )}
                </div>
                <div
                  role="cell"
                  style={{
                    ...numberStyle,
                    fontSize: 14,
                    fontWeight: 600,
                    color: row.value > 0 ? undefined : "var(--dl-muted)",
                  }}
                >
                  {fullCurrency(row.value)}
                </div>
                <div
                  role="cell"
                  style={{ ...numberStyle, fontSize: 13, color: "var(--dl-text-2)" }}
                >
                  {row.count.toLocaleString("en-US")}
                </div>
                <div role="cell">
                  {row.bucket === "won" ? (
                    <span style={{ fontSize: 13, color: "var(--dl-muted)" }}>
                      Closed
                    </span>
                  ) : age === null || row.avgAgeDays === null ? (
                    <span style={{ fontSize: 13, color: "var(--dl-muted)" }}>
                      No deals
                    </span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        aria-hidden
                        style={{
                          flex: "0 0 48px",
                          height: 3,
                          borderRadius: 2,
                          background: "var(--dl-track)",
                        }}
                      >
                        <div
                          style={{
                            width: `${age.percent}%`,
                            height: "100%",
                            borderRadius: 2,
                            background: AGE_COLOR[age.tone],
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--dl-text-2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ageText(row.avgAgeDays)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="dl-narrow-only">
        {rows.map((row, i) => {
          const age = row.avgAgeDays === null ? null : ageMeter(row.avgAgeDays);
          return (
            <li
              key={row.stage}
              style={{
                padding: "13px var(--dl-gutter) 14px",
                borderBottom:
                  i === rows.length - 1 ? undefined : "1px solid var(--dl-row)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span>{row.label}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fullCurrency(row.value)}
                </span>
              </div>
              <div
                aria-hidden
                style={{
                  height: 8,
                  marginTop: 8,
                  borderRadius: 2,
                  background: "var(--dl-track)",
                }}
              >
                <div
                  style={{
                    width: `${(row.value / widest) * 100}%`,
                    height: "100%",
                    borderRadius: "0 3px 3px 0",
                    background: BAR_COLOR[row.bucket],
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: 8,
                  fontSize: 12.5,
                  color: "var(--dl-muted)",
                }}
              >
                <span>{plural(row.count)}</span>
                {row.bucket === "won" ? (
                  <span>Closed</span>
                ) : age === null || row.avgAgeDays === null ? (
                  <span>No deals</span>
                ) : (
                  <span
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: AGE_COLOR[age.tone],
                      }}
                    />
                    average age {ageText(row.avgAgeDays)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
