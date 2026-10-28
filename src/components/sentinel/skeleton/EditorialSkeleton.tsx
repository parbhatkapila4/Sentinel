import type { CSSProperties, ReactNode } from "react";
interface EditorialSkeletonShellProps {
  label: string;
  children: ReactNode;
  maxWidth?: number | string;
  padding?: string;
}

export function EditorialSkeletonShell({
  label,
  children,
  maxWidth = 1600,
  padding = "48px 56px 64px",
}: EditorialSkeletonShellProps) {
  return (
    <div
      aria-live="polite"
      aria-label={label}
      className="sentinel-shell"
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "var(--cream)",
        position: "relative",
      }}
    >
      <div className="sentinel-grain" aria-hidden />
      <div className="sentinel-vignette" aria-hidden />
      <div style={{ maxWidth, margin: "0 auto", padding }}>{children}</div>
    </div>
  );
}

interface SkeletonRowProps {
  width: number | string;
  height: number;
  delay?: number;
  align?: "right";
  style?: CSSProperties;
}

export function SkeletonRow({
  width,
  height,
  delay = 0,
  align,
  style,
}: SkeletonRowProps) {
  return (
    <span
      aria-hidden
      className="sentinel-skel"
      style={{
        display: "block",
        width,
        height,
        animationDelay: `${delay}ms`,
        marginLeft: align === "right" ? "auto" : undefined,
        ...style,
      }}
    />
  );
}

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  delay?: number;
  style?: CSSProperties;
  bg?: "ink-02" | "ink-03";
}

export function SkeletonBox({
  width = "100%",
  height,
  delay = 0,
  style,
  bg = "ink-02",
}: SkeletonBoxProps) {
  return (
    <div
      aria-hidden
      className="sentinel-skel"
      style={{
        width,
        height,
        border: `1px solid ${bg === "ink-03" ? "var(--rule-strong)" : "var(--rule)"}`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    />
  );
}

export function SectionRuleSkeleton({
  labelWidth = 160,
  metaWidth = 140,
  delayBase = 0,
}: {
  labelWidth?: number;
  metaWidth?: number;
  delayBase?: number;
}) {
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
      <SkeletonRow width={28} height={10} delay={delayBase} />
      <SkeletonRow width={labelWidth} height={10} delay={delayBase + 40} />
      <span style={{ flex: 1 }} />
      <SkeletonRow width={metaWidth} height={10} delay={delayBase + 80} />
    </div>
  );
}

export function MastheadSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 32,
        padding: "14px 32px",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 20,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
        }}
      >
        Sentinel<span style={{ color: "var(--signal)" }}>.</span>
      </span>
      <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
        <SkeletonRow width={180} height={10} delay={40} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <SkeletonRow width={22} height={22} delay={80} />
        <SkeletonRow width={22} height={22} delay={120} />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div
      style={{
        padding: "44px 0 40px",
        borderBottom: "1px solid var(--rule)",
        display: "grid",
        gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) minmax(260px, 320px)",
        gap: 40,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingRight: 24, borderRight: "1px solid var(--rule)" }}>
        <SkeletonRow width={80} height={10} delay={0} />
        <SkeletonRow width={140} height={52} delay={60} />
        <SkeletonRow width={120} height={10} delay={120} />
        <SkeletonRow width={100} height={10} delay={160} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
        <SkeletonRow width={220} height={10} delay={80} />
        <SkeletonRow width="80%" height={60} delay={140} />
        <SkeletonRow width="70%" height={60} delay={180} />
        <SkeletonRow width="55%" height={14} delay={220} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
        <SkeletonBox height={120} delay={120} />
        <SkeletonRow width="60%" height={10} delay={200} />
      </div>
    </div>
  );
}

const LIST_TITLE_WIDTHS = [132, 104, 148, 96, 120, 88];
const LIST_DETAIL_WIDTHS = [224, 248, 196, 232, 208, 240];

export function ListRowsSkeleton({
  label,
  rows = 3,
  padding = "18px 0",
}: {
  label: string;
  rows?: number;
  padding?: string;
}) {
  return (
    <div role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "44px minmax(0, 1fr) auto",
            gap: 16,
            alignItems: "center",
            padding,
            borderBottom: i === rows - 1 ? "none" : "1px solid var(--rule)",
          }}
        >
          <SkeletonBox width={44} height={44} delay={i * 60} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minWidth: 0,
            }}
          >
            <SkeletonRow
              width={LIST_TITLE_WIDTHS[i % LIST_TITLE_WIDTHS.length]}
              height={14}
              delay={i * 60 + 30}
              style={{ maxWidth: "100%" }}
            />
            <SkeletonRow
              width={LIST_DETAIL_WIDTHS[i % LIST_DETAIL_WIDTHS.length]}
              height={9}
              delay={i * 60 + 60}
              style={{ maxWidth: "100%" }}
            />
          </div>
          <SkeletonRow width={84} height={30} delay={i * 60 + 90} />
        </div>
      ))}
    </div>
  );
}
