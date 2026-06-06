export default function NotificationsLoading() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading notifications"
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
          padding: "44px 56px 80px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <SkeletonRow width={260} height={10} delay={0} />
        <div style={{ height: 20 }} />
        <SkeletonRow width={620} height={60} delay={60} />
        <div style={{ height: 14 }} />
        <SkeletonRow width={520} height={14} delay={120} />
        <div style={{ height: 18 }} />
        <SkeletonRow width={420} height={10} delay={160} />

        <div style={{ height: 32 }} />

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
          <SkeletonRow width={220} height={14} delay={200} />
          <SkeletonRow width={280} height={30} delay={240} />
          <span style={{ flex: 1 }} />
          <SkeletonRow width={80} height={10} delay={280} />
          <SkeletonRow width={130} height={30} delay={320} />
        </div>

        <div style={{ height: 28 }} />

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
                padding: "22px 26px 24px",
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <SkeletonRow width={100} height={10} delay={i * 50} />
              <SkeletonRow width={100} height={40} delay={i * 50 + 40} />
              <SkeletonRow width={120} height={10} delay={i * 50 + 80} />
            </div>
          ))}
        </div>

        <div style={{ height: 40 }} />

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            padding: "14px 0",
            borderTop: "1px solid var(--rule-strong)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <SkeletonRow width={32} height={10} delay={0} />
          <SkeletonRow width={200} height={12} delay={40} />
          <span style={{ flex: 1 }} />
          <SkeletonRow width={120} height={10} delay={80} />
        </div>

        <div
          style={{
            borderBottom: "1px solid var(--rule-strong)",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "40px minmax(0,1fr) 120px",
                gap: 18,
                padding: "20px 4px",
                paddingLeft: 18,
                borderBottom:
                  i === 4 ? "none" : "1px solid var(--rule)",
                borderLeft: "2px solid transparent",
                alignItems: "flex-start",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--ink-02)",
                  border: "1px solid var(--rule)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SkeletonRow width={160} height={10} delay={i * 40} />
                <SkeletonRow
                  width={`${60 - (i % 3) * 6}%`}
                  height={20}
                  delay={i * 40 + 40}
                />
                <SkeletonRow width="80%" height={12} delay={i * 40 + 80} />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <SkeletonRow width={54} height={22} delay={i * 40 + 120} />
                <SkeletonRow width={22} height={22} delay={i * 40 + 160} />
              </div>
            </div>
          ))}
        </div>
      </div>
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
