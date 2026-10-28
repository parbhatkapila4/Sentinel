import type { CSSProperties } from "react";

export const barStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "8px 10px",
  minHeight: 56,
  padding: "10px var(--dl-gutter)",
  borderBottom: "1px solid var(--dl-divider)",
};

export const tagStyle: CSSProperties = {
  fontFamily: "var(--dl-font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--dl-text-2)",
};

export const groupStyle: CSSProperties = {
  padding: "16px var(--dl-gutter) 6px",
  fontFamily: "var(--dl-font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--dl-muted)",
};

export const sectionTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "-0.01em",
};
