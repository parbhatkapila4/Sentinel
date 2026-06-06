import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SectionRuleSkeleton,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function TeamSettingsLoading() {
  return (
    <EditorialSkeletonShell label="Loading team settings" padding="0">
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
        <SkeletonRow width={70} height={10} delay={0} />
        <span
          aria-hidden
          style={{ color: "var(--cream-4)", fontFamily: "var(--font-mono-jb)", fontSize: 10 }}
        >
          /
        </span>
        <SkeletonRow width={90} height={10} delay={40} />
      </div>

      <div style={{ padding: "40px 32px 28px" }}>
        <SkeletonRow width={180} height={10} delay={80} />
        <div style={{ height: 18 }} />
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonRow width={460} height={54} delay={120} />
            <SkeletonRow width={420} height={14} delay={180} />
          </div>
          <SkeletonRow width={150} height={36} delay={220} />
        </div>
      </div>

      <div style={{ padding: "0 32px" }}>
        <SectionRuleSkeleton labelWidth={200} metaWidth={160} delayBase={260} />
      </div>

      <div style={{ padding: "8px 32px 64px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr auto auto",
              gap: 16,
              alignItems: "center",
              padding: "18px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div
              aria-hidden
              className="anim-rise"
              style={{
                width: 44,
                height: 44,
                background:
                  "linear-gradient(135deg, var(--ink-02), var(--ink-03))",
                border: "1px solid var(--rule-strong)",
                borderRadius: "50%",
                animationDelay: `${i * 40}ms`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <SkeletonRow
                width={`${40 - (i % 3) * 4}%`}
                height={14}
                delay={i * 40 + 20}
              />
              <SkeletonRow
                width={`${26 - (i % 3) * 3}%`}
                height={10}
                delay={i * 40 + 40}
              />
            </div>
            <SkeletonRow width={80} height={22} delay={i * 40 + 60} />
            <SkeletonRow width={60} height={28} delay={i * 40 + 80} />
          </div>
        ))}
      </div>
    </EditorialSkeletonShell>
  );
}
