export default function ReportsLoading() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading reports"
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
        <SkeletonRow width={200} height={10} delay={0} />
        <div style={{ height: 24 }} />
        <SkeletonRow width={520} height={56} delay={60} />
        <div style={{ height: 14 }} />
        <SkeletonRow width={460} height={14} delay={120} />
        <div style={{ height: 18 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 0",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <SkeletonRow width={260} height={10} delay={180} />
          <span style={{ flex: 1 }} />
          <SkeletonRow width={80} height={10} delay={220} />
          <SkeletonRow width={140} height={36} delay={260} />
        </div>

        <div style={{ height: 32 }} />

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0,
            marginTop: 16,
          }}
        >
          {[0, 1].map((col) => (
            <div
              key={col}
              style={{
                padding: 32,
                borderLeft: col === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <SkeletonRow width={120} height={10} delay={col * 80} />
              <SkeletonRow width={260} height={28} delay={col * 80 + 40} />
              <div style={{ height: 8 }} />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonRow width={200} height={12} delay={col * 80 + j * 40} />
                  <SkeletonRow width="100%" height={2} delay={col * 80 + j * 40 + 30} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ height: 48 }} />
        <SectionHeader />
        <div
          style={{
            marginTop: 16,
            border: "1px solid var(--rule)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.7fr 1fr 0.8fr 0.7fr 0.7fr",
                gap: 18,
                padding: "14px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                alignItems: "center",
              }}
            >
              <SkeletonRow width="80%" height={14} delay={i * 30} />
              <SkeletonRow width={50} height={12} delay={i * 30 + 20} />
              <SkeletonRow width={80} height={14} delay={i * 30 + 40} />
              <SkeletonRow width={60} height={12} delay={i * 30 + 60} />
              <SkeletonRow width={50} height={12} delay={i * 30 + 80} />
              <SkeletonRow width={50} height={12} delay={i * 30 + 100} />
            </div>
          ))}
        </div>

        <div style={{ height: 48 }} />
        <SectionHeader />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 0,
            marginTop: 16,
          }}
        >
          {Array.from({ length: 3 }).map((_, col) => (
            <div
              key={col}
              style={{
                padding: 32,
                borderLeft: col === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <SkeletonRow width={120} height={10} delay={col * 60} />
              <SkeletonRow width={200} height={26} delay={col * 60 + 40} />
              <div style={{ height: 8 }} />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SkeletonRow width={36} height={10} delay={col * 60 + j * 30} />
                  <SkeletonRow width={`${60 - j * 6}%`} height={12} delay={col * 60 + j * 30 + 30} />
                </div>
              ))}
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
      <SkeletonRow width={160} height={10} delay={40} />
      <span style={{ flex: 1 }} />
      <SkeletonRow width={140} height={10} delay={80} />
    </div>
  );
}

function SkeletonRow({
  width,
  height,
  delay,
}: {
  width: number | string;
  height: number;
  delay: number;
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
      }}
    />
  );
}
