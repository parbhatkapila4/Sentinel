export default function InsightsLoading() {
  return (
    <div
      className="sentinel-shell"
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "var(--cream)",
      }}
    >
      <div className="sentinel-grain" aria-hidden />
      <div className="sentinel-vignette" aria-hidden />

      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: "auto 1fr auto",
          gap: 32,
          padding: "14px 32px",
          borderBottom: "1px solid var(--rule)",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 20,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
            textTransform: "none",
          }}
        >
          Sentinel<span style={{ color: "var(--signal)" }}>.</span>
        </span>
        <span className="hidden md:block text-center">OPENING THE DESK…</span>
        <span aria-hidden style={{ width: 30, height: 30 }} />
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "280px minmax(0,1fr) 320px",
          minHeight: "calc(100vh - 48px)",
        }}
      >
        <aside
          style={{
            borderRight: "1px solid var(--rule)",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <SkeletonLine width="40%" />
          <SkeletonBlock height={54} />
          <SkeletonBlock height={14} width="70%" />
          <SkeletonBlock height={44} />
          <SkeletonBlock height={44} />
          <SkeletonBlock height={44} />
        </aside>

        <section
          className="anim-rise"
          style={{
            padding: "80px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--copper)",
            }}
          >
            The Intelligence Desk · Ready
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(48px, 7vw, 76px)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "var(--cream)",
              textAlign: "center",
            }}
          >
            Ask, and you
            <br />
            shall{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--signal)",
                fontFamily: "var(--font-serif)",
              }}
            >
              know.
            </em>
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
            }}
          >
            Loading your book and threads…
          </div>
        </section>

        <aside
          style={{
            borderLeft: "1px solid var(--rule)",
            background: "var(--ink-02)",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <SkeletonLine width="55%" />
          <SkeletonBlock height={56} />
          <SkeletonBlock height={16} width="80%" />
          <SkeletonBlock height={16} width="70%" />
          <SkeletonBlock height={16} width="60%" />
        </aside>
      </div>
    </div>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: 14,
        width,
        background: "var(--ink-03)",
        border: "1px solid var(--rule)",
      }}
    />
  );
}

function SkeletonBlock({
  height,
  width = "100%",
}: {
  height: number;
  width?: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        height,
        width,
        background: "var(--ink-02)",
        border: "1px solid var(--rule)",
      }}
    />
  );
}
