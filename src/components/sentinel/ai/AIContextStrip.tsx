import type { AIShellMeta } from "./types";

interface AIContextStripProps {
  meta: AIShellMeta;
  currentThreadLabel: string;
}

export function AIContextStrip({
  meta,
  currentThreadLabel,
}: AIContextStripProps) {
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        gap: 24,
        padding: "10px 32px",
        borderBottom: "1px solid var(--rule)",
        background: "var(--ink)",
        fontFamily: "var(--font-mono-jb)",
        fontSize: 10,
        letterSpacing: "0.14em",
        color: "var(--cream-3)",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--cream)",
          letterSpacing: "-0.005em",
          textTransform: "none",
        }}
      >
        › INTELLIGENCE DESK
      </span>
      <div className="hidden md:flex justify-center" style={{ gap: 26 }}>
        <span>
          SESSION{" "}
          <strong
            className="tabular"
            style={{ color: "var(--cream)", fontWeight: 500 }}
          >
            {meta.sessionOrdinal}
          </strong>
        </span>
        <span>
          MODEL{" "}
          <strong style={{ color: "var(--cream)", fontWeight: 500 }}>
            {meta.modelLabel}
          </strong>
        </span>
        <span>
          CTX{" "}
          <strong
            className="tabular"
            style={{ color: "var(--cream)", fontWeight: 500 }}
          >
            {meta.ctxLabel}
          </strong>
        </span>
      </div>
      <span
        className="tabular"
        style={{
          color: "var(--cream-3)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 260,
        }}
      >
        {currentThreadLabel}
      </span>
    </div>
  );
}
