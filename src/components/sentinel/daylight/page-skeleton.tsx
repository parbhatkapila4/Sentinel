import type { CSSProperties, ReactNode } from "react";
import { Bone, Line } from "./skeleton-parts";
import { tableHeadStyle } from "./ui";

const rowRule = "1px solid var(--dl-row)";

export function HeroSkeleton({ actions = [122, 111] }: { actions?: number[] }) {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        <Bone w={150} h={26} r={999} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: 16,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 8.2))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        <div
          className="dl-hero-clause"
          style={{
            display: "flex",
            alignItems: "center",
            height: "1.2em",
            marginTop: 8,
          }}
        >
          <Bone w="min(82%, calc(var(--dl-headline-size) * 5.6))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          <Line w="100%" lh={24} h={10} />
          <Line w="72%" lh={24} h={10} />
        </div>
        <div className="dl-hero-actions">
          {actions.map((w, i) => (
            <Bone key={i} w={w} h={36} r={9} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function KpiRowSkeleton({ labels = [86, 92, 118, 90] }: { labels?: number[] }) {
  return (
    <div className="dl-grid">
      {labels.map((label, i) => (
        <div key={i} className="dl-kpi">
          <Line w={label} lh={19.5} />
          <div
            className="dl-kpi-value"
            style={{
              display: "flex",
              alignItems: "center",
              height: "1.15em",
              marginTop: 4,
            }}
          >
            <Bone w={i === 2 ? 28 : 92} h="0.68em" r={6} />
          </div>
          <div style={{ display: "flex", marginTop: 11 }}>
            <Bone w={124} h={7} r={2} />
          </div>
          <Line w={132} lh={18.75} h={8} style={{ marginTop: 7 }} />
        </div>
      ))}
    </div>
  );
}

export function CellHeadSkeleton({
  title,
  sub,
  right,
  compact = false,
}: {
  title: number;
  sub?: number;
  right?: number;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px 16px",
        padding: compact ? "18px var(--dl-gutter) 4px" : "18px var(--dl-gutter) 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, height: 21 }}>
        <Bone w={title} h={11} />
        {sub !== undefined && <Bone w={sub} h={9} />}
      </div>
      {right !== undefined && <Bone w={right} h={9} />}
    </div>
  );
}

export function CellBody({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ padding: "0 var(--dl-gutter) 18px", ...style }}>{children}</div>
  );
}

export function KvSkeleton({ rows }: { rows: Array<[number, number]> }) {
  return (
    <>
      {rows.map(([label, value], i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 44,
            borderTop: rowRule,
          }}
        >
          <Bone w={label} h={9} />
          <Bone w={value} h={11} />
        </div>
      ))}
    </>
  );
}

export function ListRowsSkeleton({
  rows,
  height = 46,
  lead = false,
}: {
  rows: number[];
  height?: number;
  lead?: boolean;
}) {
  return (
    <>
      {rows.map((w, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            height,
            borderTop: rowRule,
          }}
        >
          {lead && <Bone w={8} h={8} r={2} />}
          <span style={{ flex: "1 1 auto" }}>
            <Bone w={w} h={10} />
          </span>
          <Bone w={44} h={11} />
        </div>
      ))}
    </>
  );
}

export function BigFigureSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 37 }}>
      <Bone w={96} h={24} r={6} />
    </div>
  );
}

export function HBarSkeleton({
  rows,
  columns = "104px minmax(0, 1fr) 44px",
}: {
  rows: number[];
  columns?: string;
}) {
  return (
    <>
      {rows.map((w, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: columns,
            alignItems: "center",
            gap: 12,
            height: 38,
          }}
        >
          <Bone w={Math.min(w, 96)} h={9} />
          <Bone w={`${Math.max(18, 100 - i * 14)}%`} h={8} r={2} />
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <Bone w={22} h={11} />
          </span>
        </div>
      ))}
    </>
  );
}

export function TableSkeleton({
  columns,
  narrowColumns,
  minWidth,
  head,
  rows,
  rowHeight = 56,
  wide,
}: {
  columns: string;
  narrowColumns: string;
  minWidth: string;
  head: number[];
  rows: number;
  rowHeight?: number;
  wide: boolean[];
}) {
  const vars = {
    "--cols": columns,
    "--cols-n": narrowColumns,
    "--minw": minWidth,
  } as CSSProperties;
  return (
    <div style={{ overflowX: "hidden" }}>
      <div className="dl-table" style={vars}>
        <div className="dl-table-grid" style={tableHeadStyle}>
          {head.map((w, i) => (
            <span key={i} className={wide[i] ? "dl-c-wide" : undefined}>
              {w > 0 && <Bone w={w} h={8} />}
            </span>
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div
            key={r}
            className="dl-table-grid"
            style={{ height: rowHeight, borderBottom: r === rows - 1 ? undefined : rowRule }}
          >
            {head.map((w, i) => (
              <span key={i} className={wide[i] ? "dl-c-wide" : undefined}>
                <Bone w={i === 1 ? `${70 - (r % 4) * 8}%` : Math.max(18, w)} h={i === 1 ? 11 : 9} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
