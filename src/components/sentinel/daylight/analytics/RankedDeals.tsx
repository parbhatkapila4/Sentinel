import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { RiskDot, StageMark } from "../deals/cells";
import { closedKind, riskTone, stageLabel } from "../deals/model";
import { fullCurrency } from "../format";
import {
  HEALTHIEST_COLUMNS,
  RANKED_MIN_WIDTH,
  SECOND_LOOK_COLUMNS,
} from "../table-columns";
import { Chevron, CountPill, Monogram, emptyStyle, tableHeadStyle } from "../ui";
import { SectionHead } from "./SectionHead";
import type { HealthyRow, SecondLookRow } from "./model";

const ellipsis: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const rowStyle: CSSProperties = {
  display: "grid",
  columnGap: 16,
  alignItems: "center",
  minHeight: 62,
  padding: "0 var(--dl-gutter)",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) auto",
  columnGap: 11,
  rowGap: 4,
  alignItems: "center",
  padding: "13px var(--dl-gutter) 14px",
  color: "inherit",
};

const rankStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--dl-muted)",
  fontVariantNumeric: "tabular-nums",
};

const valueStyle: CSSProperties = {
  textAlign: "right",
  fontSize: 14,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
};

const noteStyle: CSSProperties = {
  padding: "16px var(--dl-gutter) 20px",
  fontSize: 13,
  color: "var(--dl-muted)",
};

function DealName({
  id,
  name,
  sub,
}: {
  id: string;
  name: string;
  sub: string | null;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
      <Monogram name={name} />
      <div style={{ minWidth: 0 }}>
        <Link
          href={`/deals/${id}`}
          className="dl-link"
          style={{
            ...ellipsis,
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--dl-ink)",
          }}
        >
          {name}
        </Link>
        {sub && (
          <div
            title={sub}
            style={{ ...ellipsis, fontSize: 13, color: "var(--dl-muted)" }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function StageCell({ stage }: { stage: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...ellipsis, fontSize: 13, color: "var(--dl-text-2)" }}>
        {stageLabel(stage)}
      </div>
      <StageMark stage={stage} />
    </div>
  );
}

function RiskBar({ score, width = 44 }: { score: number; width?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        fontFamily: "var(--dl-font-mono)",
        fontSize: 11.5,
        color: "var(--dl-text-2)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "block",
          flex: `0 0 ${width}px`,
          height: 5,
          borderRadius: 3,
          background: "var(--dl-track)",
        }}
      >
        <span
          style={{
            display: "block",
            width: `${Math.max(0, Math.min(100, score * 100))}%`,
            height: "100%",
            borderRadius: 3,
            background: "var(--dl-signal)",
          }}
        />
      </span>
      <span aria-label={`Risk score ${score.toFixed(2)}`}>{score.toFixed(2)}</span>
    </span>
  );
}

function Ranked({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className="dl-half"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {children}
    </section>
  );
}

const alertsLink = (
  <Link
    href="/risk-overview"
    className="dl-link inline-flex items-center"
    style={{ gap: 3, fontSize: 13, fontWeight: 500, color: "var(--dl-ink)" }}
  >
    Open alerts
    <Chevron />
  </Link>
);

export function SecondLook({
  rows,
  total,
}: {
  rows: SecondLookRow[];
  total: number;
}) {
  return (
    <Ranked label="Needs a second look">
      <SectionHead
        title="Needs a second look"
        sub="High risk, most fragile first"
        kicker="Second look"
        shortSub="Most fragile first"
        pill={
          total > 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 20,
                padding: "0 7px",
                borderRadius: 6,
                background: "var(--dl-signal-tint)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--dl-signal-d)",
              }}
            >
              {total.toLocaleString("en-US")}
            </span>
          ) : (
            <CountPill>0</CountPill>
          )
        }
        right={alertsLink}
        narrowRight={
          <Link
            href="/risk-overview"
            className="dl-link dl-tap inline-flex items-center"
            style={{ gap: 3, fontSize: 13, fontWeight: 500, color: "var(--dl-ink)" }}
          >
            Alerts
            <Chevron />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p style={{ ...emptyStyle, borderTop: "1px solid var(--dl-divider)" }}>
          No high-risk deals in this range.
        </p>
      ) : (
        <>
          <div className="dl-wide-only" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: RANKED_MIN_WIDTH }}>
              <div style={{ ...tableHeadStyle, gridTemplateColumns: SECOND_LOOK_COLUMNS }}>
                <span>#</span>
                <span>Deal</span>
                <span>Stage</span>
                <span>Risk</span>
                <span style={{ textAlign: "right" }}>Value</span>
              </div>
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="dl-row"
                  style={{
                    ...rowStyle,
                    gridTemplateColumns: SECOND_LOOK_COLUMNS,
                    borderBottom: "1px solid var(--dl-row)",
                  }}
                >
                  <span style={rankStyle}>{i + 1}</span>
                  <DealName id={row.id} name={row.name} sub={row.action} />
                  <StageCell stage={row.stage} />
                  <RiskBar score={row.riskScore} />
                  <div style={valueStyle}>{fullCurrency(row.value)}</div>
                </div>
              ))}
            </div>
          </div>
          <ul className="dl-narrow-only">
            {rows.map((row) => (
              <li key={row.id} style={{ borderBottom: "1px solid var(--dl-row)" }}>
                <Link href={`/deals/${row.id}`} className="dl-row" style={cardStyle}>
                  <Monogram name={row.name} />
                  <span style={{ ...ellipsis, fontSize: 14.5, fontWeight: 600 }}>
                    {row.name}
                  </span>
                  <span style={{ ...valueStyle, fontSize: 14.5 }}>
                    {fullCurrency(row.value)}
                  </span>
                  <span
                    style={{ gridColumn: 2, fontSize: 13, color: "var(--dl-muted)" }}
                  >
                    {stageLabel(row.stage)}
                  </span>
                  <span style={{ justifySelf: "end" }}>
                    <RiskBar score={row.riskScore} width={36} />
                  </span>
                  {row.action && (
                    <span
                      style={{
                        ...ellipsis,
                        gridColumn: "2 / 4",
                        fontSize: 13,
                        color: "var(--dl-text-2)",
                      }}
                    >
                      {row.action}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p style={noteStyle}>
            {total > rows.length
              ? `Showing ${rows.length} of ${total.toLocaleString("en-US")} high-risk deals. Open alerts for the rest.`
              : "That is every high-risk deal in this range."}
          </p>
        </>
      )}
    </Ranked>
  );
}

export function Healthiest({
  rows,
  total,
}: {
  rows: HealthyRow[];
  total: number;
}) {
  const top = rows.reduce((max, r) => Math.max(max, r.value), 0);

  return (
    <Ranked label="Healthiest deals">
      <SectionHead
        title="Healthiest deals"
        sub="Low risk, largest first"
        kicker="Healthiest"
        shortSub="Low risk, largest first"
        pill={<CountPill>{total.toLocaleString("en-US")}</CountPill>}
      />
      {rows.length === 0 ? (
        <p style={{ ...emptyStyle, borderTop: "1px solid var(--dl-divider)" }}>
          No low-risk deals in this range yet.
        </p>
      ) : (
        <>
          <div className="dl-wide-only" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: RANKED_MIN_WIDTH }}>
              <div style={{ ...tableHeadStyle, gridTemplateColumns: HEALTHIEST_COLUMNS }}>
                <span>#</span>
                <span>Deal</span>
                <span>Stage</span>
                <span>Size</span>
                <span style={{ textAlign: "right" }}>Value</span>
              </div>
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="dl-row"
                  style={{
                    ...rowStyle,
                    gridTemplateColumns: HEALTHIEST_COLUMNS,
                    borderBottom:
                      i === rows.length - 1 && total <= rows.length
                        ? undefined
                        : "1px solid var(--dl-row)",
                  }}
                >
                  <span style={rankStyle}>{i + 1}</span>
                  <DealName id={row.id} name={row.name} sub={row.location} />
                  <StageCell stage={row.stage} />
                  <div
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: "var(--dl-track)",
                    }}
                  >
                    <div
                      style={{
                        width: `${top > 0 ? Math.max(2, Math.round((row.value / top) * 100)) : 0}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: i === 0 ? "var(--dl-ink)" : "var(--dl-bar)",
                      }}
                    />
                  </div>
                  <div style={valueStyle}>{fullCurrency(row.value)}</div>
                </div>
              ))}
            </div>
          </div>
          <ul className="dl-narrow-only">
            {rows.map((row, i) => {
              const tone = riskTone(0, closedKind(row.stage) ? "closed" : "active");
              const place = [stageLabel(row.stage), row.location]
                .filter(Boolean)
                .join(" · ");
              return (
                <li
                  key={row.id}
                  style={{
                    borderBottom:
                      i === rows.length - 1 && total <= rows.length
                        ? undefined
                        : "1px solid var(--dl-row)",
                  }}
                >
                  <Link href={`/deals/${row.id}`} className="dl-row" style={cardStyle}>
                    <Monogram name={row.name} />
                    <span style={{ ...ellipsis, fontSize: 14.5, fontWeight: 600 }}>
                      {row.name}
                    </span>
                    <span style={{ ...valueStyle, fontSize: 14.5 }}>
                      {fullCurrency(row.value)}
                    </span>
                    <span
                      style={{
                        ...ellipsis,
                        gridColumn: 2,
                        fontSize: 13,
                        color: "var(--dl-muted)",
                      }}
                    >
                      {place}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifySelf: "end",
                        gap: 6,
                        fontSize: 12.5,
                        fontWeight: 500,
                      }}
                    >
                      <RiskDot color={tone.color} />
                      {tone.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {total > rows.length && (
            <p style={noteStyle}>
              Showing the {rows.length} largest of {total.toLocaleString("en-US")}{" "}
              low-risk deals.
            </p>
          )}
        </>
      )}
    </Ranked>
  );
}
