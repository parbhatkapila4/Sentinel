interface DealsMastheadProps {
  kicker: string;
  headline: string;
  italicWord: string;
  deck: string;
  meta: Array<{ label: string; value: string }>;
}

export function DealsMasthead({
  kicker,
  headline,
  italicWord,
  deck,
  meta,
}: DealsMastheadProps) {
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.4fr)_minmax(260px,1fr)] gap-10 lg:gap-14 px-6 sm:px-10 lg:px-14 py-12 lg:py-14 border-b"
      style={{ borderColor: "var(--rule)" }}
      aria-label="Deals masthead"
    >
      <div className="anim-rise">
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--signal)",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          {kicker}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(44px, 6vw, 72px)",
            lineHeight: 0.98,
            color: "var(--cream)",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          {headline}{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {italicWord}
          </em>
        </h1>
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "var(--cream-2)",
            maxWidth: 620,
          }}
        >
          {deck}
        </p>
      </div>

      <aside
        className="anim-rise"
        style={{
          animationDelay: "120ms",
          background: "var(--ink-02)",
          border: "1px solid var(--rule-strong)",
          padding: "26px 24px",
          position: "relative",
        }}
        aria-label="Desk meta"
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: "var(--signal)",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--signal)",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Desk Index
        </div>
        <dl style={{ margin: 0 }}>
          {meta.map((m, i) => (
            <div
              key={m.label}
              className="flex items-baseline justify-between"
              style={{
                gap: 12,
                padding: "12px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--rule)",
              }}
            >
              <dt
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--cream-3)",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </dt>
              <dd
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: "var(--cream)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
