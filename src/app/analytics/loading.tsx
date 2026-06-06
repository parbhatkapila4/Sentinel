import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SectionRuleSkeleton,
  SkeletonBox,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function AnalyticsLoading() {
  return (
    <EditorialSkeletonShell label="Loading analytics" padding="0">
      <MastheadSkeleton />

      <div style={{ padding: "40px 32px 32px" }}>
        <SkeletonRow width={160} height={10} delay={0} />
        <div style={{ height: 18 }} />
        <SkeletonRow width={520} height={54} delay={60} />
        <div style={{ height: 14 }} />
        <SkeletonRow width={460} height={14} delay={120} />
      </div>

      <div style={{ padding: "0 32px" }}>
        <SectionRuleSkeleton labelWidth={160} metaWidth={160} delayBase={160} />
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
                padding: "26px 26px 28px",
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <SkeletonRow width={120} height={10} delay={200 + i * 40} />
              <SkeletonRow width={180} height={42} delay={240 + i * 40} />
              <SkeletonRow width={140} height={10} delay={280 + i * 40} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 32px", marginTop: 32 }}>
        <SectionRuleSkeleton labelWidth={200} metaWidth={180} delayBase={320} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div style={{ padding: 32, borderRight: "1px solid var(--rule)" }}>
            <SkeletonRow width={180} height={10} delay={360} />
            <div style={{ height: 14 }} />
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
              <SkeletonBox width={208} height={208} delay={400} style={{ borderRadius: "50%" }} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 16,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBox key={i} height={64} delay={440 + i * 30} />
              ))}
            </div>
          </div>

          <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonRow width={220} height={10} delay={380} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  border: "1px solid var(--rule)",
                }}
              >
                <SkeletonRow width={8} height={8} delay={420 + i * 40} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonRow width="70%" height={12} delay={440 + i * 40} />
                  <SkeletonRow width="40%" height={10} delay={460 + i * 40} />
                </div>
                <SkeletonRow width={52} height={20} delay={480 + i * 40} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px", marginTop: 32, paddingBottom: 64 }}>
        <SectionRuleSkeleton labelWidth={180} metaWidth={200} delayBase={560} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 32,
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <SkeletonRow width={160} height={10} delay={600 + i * 40} />
              <SkeletonBox height={200} delay={640 + i * 40} />
            </div>
          ))}
        </div>
      </div>
    </EditorialSkeletonShell>
  );
}
