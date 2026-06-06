interface PanelProps {
  kicker: string;
  title: string;
  italicWord?: string;
  meta?: string;
  accent?: "ivy" | "wine" | "signal" | "copper";
  children: React.ReactNode;
}

function accentColor(a: PanelProps["accent"]): string {
  switch (a) {
    case "wine":
      return "var(--wine)";
    case "signal":
      return "var(--signal)";
    case "copper":
      return "var(--copper)";
    case "ivy":
    default:
      return "var(--ivy)";
  }
}

export function Panel({
  kicker,
  title,
  italicWord,
  meta,
  accent = "signal",
  children,
}: PanelProps) {
  return (
    <article
      style={{
        position: "relative",
        background: "var(--ink-02)",
        border: "1px solid var(--rule)",
        padding: "26px 26px 24px",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 2,
          background: accentColor(accent),
        }}
      />

      <header
        className="flex flex-wrap items-baseline justify-between"
        style={{ gap: 10, marginBottom: 18 }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {kicker}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              lineHeight: 1.05,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
            {italicWord && (
              <>
                {" "}
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--signal)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {italicWord}
                </em>
              </>
            )}
          </h3>
        </div>
        {meta && (
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
            }}
          >
            {meta}
          </span>
        )}
      </header>

      {children}
    </article>
  );
}
