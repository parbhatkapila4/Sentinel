import {
  EditorialSkeletonShell,
  MastheadSkeleton,
  SkeletonBox,
  SkeletonRow,
} from "@/components/sentinel/skeleton/EditorialSkeleton";

export default function NewDealLoading() {
  return (
    <EditorialSkeletonShell
      label="Loading new deal form"
      padding="0"
      maxWidth="100%"
    >
      <MastheadSkeleton />

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "56px 32px 80px",
        }}
      >
        <SkeletonRow width={180} height={10} delay={0} />
        <div style={{ height: 18 }} />
        <SkeletonRow width={420} height={54} delay={60} />
        <div style={{ height: 14 }} />
        <SkeletonRow width={360} height={14} delay={120} />

        <div
          style={{
            marginTop: 36,
            padding: 28,
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <SkeletonRow width={100} height={10} delay={160 + i * 40} />
              <SkeletonBox height={42} delay={180 + i * 40} />
            </div>
          ))}

          <div
            style={{
              marginTop: 12,
              paddingTop: 18,
              borderTop: "1px solid var(--rule)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <SkeletonRow width={100} height={36} delay={420} />
            <SkeletonRow width={140} height={36} delay={460} />
          </div>
        </div>
      </div>
    </EditorialSkeletonShell>
  );
}
