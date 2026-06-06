import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SectionRuleSkeleton,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function DealsLoading() {
  return (
    <EditorialSkeletonShell label="Loading deals" padding="0">
      <MastheadSkeleton />

      <div style={{ padding: "40px 32px 28px" }}>
        <SkeletonRow width={160} height={10} delay={0} />
        <div style={{ height: 18 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonRow width={440} height={54} delay={60} />
            <SkeletonRow width={420} height={14} delay={120} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <SkeletonRow width={110} height={34} delay={160} />
            <SkeletonRow width={130} height={34} delay={200} />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px" }}>
        <SectionRuleSkeleton labelWidth={140} metaWidth={200} delayBase={220} />
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
              <SkeletonRow width={100} height={10} delay={260 + i * 40} />
              <SkeletonRow width={160} height={40} delay={300 + i * 40} />
              <SkeletonRow width={130} height={10} delay={340 + i * 40} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <SkeletonRow width={200} height={30} delay={380} />
        <SkeletonRow width={140} height={30} delay={420} />
        <SkeletonRow width={120} height={30} delay={460} />
        <span style={{ flex: 1 }} />
        <SkeletonRow width={100} height={10} delay={500} />
        <SkeletonRow width={100} height={30} delay={520} />
      </div>

      <div style={{ padding: "0 32px", paddingBottom: 64 }}>
        <SectionRuleSkeleton labelWidth={160} metaWidth={160} delayBase={540} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 2fr 0.8fr 0.9fr 0.7fr 1fr 1fr 0.7fr 40px",
            gap: 14,
            padding: "14px 12px",
            borderBottom: "1px solid var(--rule-strong)",
            alignItems: "center",
          }}
        >
          {[
            60,
            120,
            60,
            70,
            50,
            100,
            90,
            80,
            20,
          ].map((w, i) => (
            <SkeletonRow key={i} width={w} height={10} delay={580 + i * 20} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "40px 2fr 0.8fr 0.9fr 0.7fr 1fr 1fr 0.7fr 40px",
              gap: 14,
              padding: "18px 12px",
              borderBottom: "1px solid var(--rule)",
              alignItems: "center",
            }}
          >
            <SkeletonRow width={16} height={16} delay={i * 20} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <SkeletonRow width={`${70 - (i % 3) * 8}%`} height={14} delay={i * 20} />
              <SkeletonRow width={`${50 - (i % 3) * 6}%`} height={10} delay={i * 20 + 30} />
            </div>
            <SkeletonRow width={80} height={14} delay={i * 20 + 40} />
            <SkeletonRow width={90} height={20} delay={i * 20 + 60} />
            <SkeletonRow width={60} height={18} delay={i * 20 + 80} />
            <SkeletonRow width="80%" height={12} delay={i * 20 + 100} />
            <SkeletonRow width="70%" height={12} delay={i * 20 + 120} />
            <SkeletonRow width={60} height={12} delay={i * 20 + 140} />
            <SkeletonRow width={18} height={18} delay={i * 20 + 160} />
          </div>
        ))}
      </div>
    </EditorialSkeletonShell>
  );
}
