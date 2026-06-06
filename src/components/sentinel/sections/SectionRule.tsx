interface SectionRuleProps {
  number: string;
  label: string;
  meta?: string;
}

export function SectionRule({ number, label, meta }: SectionRuleProps) {
  return (
    <div
      className="flex items-baseline border-y py-4 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 18,
        borderColor: "var(--rule)",
        background: "var(--ink)",
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      <span
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 24,
          color: "var(--signal)",
          letterSpacing: "-0.01em",
        }}
      >
        § {number}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "var(--cream-2)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div className="flex-1" />
      {meta && (
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}
