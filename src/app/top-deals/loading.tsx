export default function TopDealsLoading() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading top deals"
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "var(--cream)",
        position: "relative",
      }}
      className="sentinel-grain sentinel-vignette"
    >
      <div
        style={{
          padding: "48px 56px 64px",
          maxWidth: 1600,
          margin: "0 auto",
        }}
      >
        <SkeletonRow width={180} height={10} delay={0} />
        <div style={{ height: 24 }} />
        <SkeletonRow width={520} height={56} delay={60} />
        <div style={{ height: 14 }} />
        <SkeletonRow width={420} height={14} delay={120} />
        <div style={{ height: 56 }} />

        <SectionHeader />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            borderTop: "1px solid var(--rule-strong)",
            borderBottom: "1px solid var(--rule-strong)",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "26px 24px 28px",
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
              }}
            >
              <SkeletonRow width={120} height={10} delay={i * 60} />
              <div style={{ height: 16 }} />
              <SkeletonRow width={180} height={42} delay={i * 60 + 40} />
              <div style={{ height: 12 }} />
              <SkeletonRow width={140} height={10} delay={i * 60 + 80} />
            </div>
          ))}
        </div>

        <div style={{ height: 48 }} />
        <SectionHeader />
        <div style={{ marginTop: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 24,
                alignItems: "center",
                padding: "22px 24px",
                borderTop:
                  i === 0
                    ? "1px solid var(--rule-strong)"
                    : "1px solid var(--rule)",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 56,
                  border: "1px solid var(--rule-strong)",
                  background: "var(--ink-02)",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <SkeletonRow
                  width={Math.min(280 + i * 8, 460)}
                  height={20}
                  delay={i * 30}
                />
                <div style={{ height: 8 }} />
                <SkeletonRow width={220} height={10} delay={i * 30 + 40} />
              </div>
              <div style={{ minWidth: 168, textAlign: "right" }}>
                <SkeletonRow
                  width={120}
                  height={26}
                  delay={i * 30 + 60}
                  align="right"
                />
                <div style={{ height: 8 }} />
                <SkeletonRow
                  width={168}
                  height={2}
                  delay={i * 30 + 100}
                  align="right"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        padding: "16px 0",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <SkeletonRow width={28} height={10} delay={0} />
      <SkeletonRow width={140} height={10} delay={40} />
      <span style={{ flex: 1 }} />
      <SkeletonRow width={120} height={10} delay={80} />
    </div>
  );
}

function SkeletonRow({
  width,
  height,
  delay,
  align,
}: {
  width: number;
  height: number;
  delay: number;
  align?: "right";
}) {
  return (
    <span
      aria-hidden
      className="anim-rise"
      style={{
        display: "block",
        width,
        height,
        background:
          "linear-gradient(90deg, var(--ink-02) 0%, var(--ink-03) 50%, var(--ink-02) 100%)",
        animationDelay: `${delay}ms`,
        marginLeft: align === "right" ? "auto" : undefined,
      }}
    />
  );
}
