import type { ReactNode } from "react";
import { cellSubStyle, cellTitleStyle } from "../ui";

interface SectionHeadProps {
  title: string;
  sub: string;
  kicker: string;
  shortSub: string;
  pill?: ReactNode;
  right?: ReactNode;
  narrowRight?: ReactNode;
}

export function SectionHead({
  title,
  sub,
  kicker,
  shortSub,
  pill,
  right,
  narrowRight,
}: SectionHeadProps) {
  return (
    <>
      <div
        className="dl-wide-only flex flex-wrap items-center justify-between"
        style={{ gap: "6px 16px", padding: "18px var(--dl-gutter) 14px" }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: "4px 9px" }}>
          <h2 style={cellTitleStyle}>{title}</h2>
          {pill}
          <span style={cellSubStyle}>{sub}</span>
        </div>
        {right}
      </div>
      <div
        className="dl-narrow-only flex flex-wrap items-center"
        style={{
          gap: "2px 12px",
          minHeight: 42,
          padding: "10px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--dl-signal-d)",
          }}
        >
          {kicker}
        </h2>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{shortSub}</span>
        {narrowRight && <span style={{ marginLeft: "auto" }}>{narrowRight}</span>}
      </div>
    </>
  );
}
