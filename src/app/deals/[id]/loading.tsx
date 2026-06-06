import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SectionRuleSkeleton,
  SkeletonBox,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function DealDetailLoading() {
  return (
    <EditorialSkeletonShell label="Loading deal" padding="0">
      <MastheadSkeleton />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 32px",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <SkeletonRow width={60} height={10} delay={0} />
        <span
          aria-hidden
          style={{ color: "var(--cream-4)", fontFamily: "var(--font-mono-jb)", fontSize: 10 }}
        >
          /
        </span>
        <SkeletonRow width={120} height={10} delay={40} />
      </div>

      <div
        style={{
          padding: "40px 32px 28px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: 24,
          alignItems: "flex-end",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SkeletonRow width={160} height={10} delay={80} />
          <SkeletonRow width={520} height={56} delay={120} />
          <div style={{ display: "flex", gap: 10 }}>
            <SkeletonRow width={80} height={22} delay={180} />
            <SkeletonRow width={70} height={22} delay={220} />
            <SkeletonRow width={90} height={22} delay={260} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <SkeletonRow width={90} height={34} delay={160} />
          <SkeletonRow width={120} height={34} delay={200} />
        </div>
      </div>

      <div style={{ padding: "0 32px" }}>
        <SectionRuleSkeleton labelWidth={160} metaWidth={140} delayBase={240} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            borderBottom: "1px solid var(--rule-strong)",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "24px 24px 26px",
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <SkeletonRow width={90} height={10} delay={280 + i * 40} />
              <SkeletonRow width={140} height={34} delay={320 + i * 40} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          padding: "0 32px",
          paddingBottom: 64,
        }}
      >
        <div
          style={{
            padding: "32px 32px 32px 0",
            borderRight: "1px solid var(--rule)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonRow width={160} height={10} delay={400} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <SkeletonRow width={140} height={12} delay={420 + i * 30} />
                <SkeletonRow width={180} height={12} delay={440 + i * 30} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonRow width={140} height={10} delay={620} />
            <SkeletonBox height={160} delay={660} />
          </div>
        </div>

        <div style={{ padding: "32px 0 32px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
          <SkeletonRow width={160} height={10} delay={480} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "8px 1fr",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--ink-03)",
                  borderRadius: "50%",
                  marginTop: 6,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <SkeletonRow width="90%" height={12} delay={520 + i * 40} />
                <SkeletonRow width="40%" height={10} delay={540 + i * 40} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditorialSkeletonShell>
  );
}
