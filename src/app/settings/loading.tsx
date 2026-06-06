import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SkeletonBox,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function SettingsLoading() {
  return (
    <EditorialSkeletonShell label="Loading settings" padding="0">
      <MastheadSkeleton />

      <div
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns:
            "minmax(140px, 160px) minmax(0, 1fr) minmax(280px, 340px)",
          gap: 48,
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SkeletonRow width={80} height={10} delay={0} />
          <SkeletonRow width={140} height={52} delay={60} />
          <SkeletonRow width={120} height={10} delay={120} />
          <SkeletonRow width={100} height={10} delay={160} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <SkeletonRow width={220} height={10} delay={80} />
          <SkeletonRow width="75%" height={60} delay={140} />
          <SkeletonRow width="65%" height={60} delay={180} />
          <SkeletonRow width="55%" height={14} delay={220} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignSelf: "center",
          }}
        >
          <SkeletonBox height={140} delay={140} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          padding: "0 32px",
          borderBottom: "1px solid var(--rule)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "16px 24px 16px 0",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <SkeletonRow width={140} height={10} delay={240} />
        </div>
        <div style={{ padding: "16px 24px" }}>
          <SkeletonRow width={260} height={14} delay={280} />
        </div>
        <div style={{ padding: "16px 0" }}>
          <SkeletonRow width={110} height={10} delay={320} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
        }}
      >
        <aside
          style={{
            borderRight: "1px solid var(--rule)",
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ padding: "0 28px 12px" }}>
            <SkeletonRow width={80} height={10} delay={0} />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "22px 1fr auto",
                gap: 14,
                alignItems: "center",
                padding: "11px 28px",
                borderLeft:
                  i === 0
                    ? "2px solid var(--signal)"
                    : "2px solid transparent",
                background: i === 0 ? "var(--ink-02)" : "transparent",
              }}
            >
              <SkeletonRow width={14} height={14} delay={i * 30} />
              <SkeletonRow
                width={`${55 + (i % 3) * 10}%`}
                height={12}
                delay={i * 30 + 20}
              />
              <SkeletonRow width={28} height={10} delay={i * 30 + 40} />
            </div>
          ))}
        </aside>

        <section style={{ padding: 32, minWidth: 0 }}>
          {Array.from({ length: 3 }).map((_, sec) => (
            <div key={sec} style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 24,
                  paddingBottom: 20,
                  borderBottom: "1px solid var(--rule)",
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 }}>
                  <SkeletonRow width={220} height={10} delay={sec * 120} />
                  <SkeletonRow width="70%" height={38} delay={sec * 120 + 40} />
                  <SkeletonRow width="90%" height={14} delay={sec * 120 + 80} />
                </div>
                <SkeletonRow width={120} height={28} delay={sec * 120 + 60} />
              </div>

              {Array.from({ length: 3 }).map((_, row) => (
                <div
                  key={row}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 20,
                    padding: "20px 0",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonRow
                      width={`${35 + row * 8}%`}
                      height={14}
                      delay={sec * 120 + row * 40}
                    />
                    <SkeletonRow
                      width={`${65 - row * 5}%`}
                      height={12}
                      delay={sec * 120 + row * 40 + 20}
                    />
                  </div>
                  <SkeletonRow width={44} height={22} delay={sec * 120 + row * 40 + 40} />
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </EditorialSkeletonShell>
  );
}
