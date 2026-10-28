import type { CSSProperties, ReactNode } from "react";
import { Bone } from "./bone";
import { DaylightMobileBar, DaylightSidebar } from "./DaylightShell";
import { daylightFontClass } from "./fonts";
import { tableHeadStyle } from "./ui";

export { Bone, Line } from "./bone";

export function TableHeadSkeleton({
  columns,
  widths,
  style,
}: {
  columns: string;
  widths: number[];
  style?: CSSProperties;
}) {
  return (
    <div style={{ ...tableHeadStyle, gridTemplateColumns: columns, ...style }}>
      {widths.map((w, i) => (
        <span
          key={i}
          style={{
            display: "flex",
            justifyContent: i === widths.length - 1 ? "flex-end" : undefined,
          }}
        >
          {w > 0 && <Bone w={w} h={8} />}
        </span>
      ))}
    </div>
  );
}

function TopBarSkeleton({ title }: { title: string }) {
  return (
    <header
      aria-hidden
      className="flex flex-wrap items-center justify-between"
      style={{
        gap: "10px 20px",
        minHeight: 61,
        padding: "12px var(--dl-gutter)",
        borderBottom: "1px solid var(--dl-divider)",
      }}
    >
      <div className="flex flex-wrap items-center" style={{ gap: "2px 12px" }}>
        <span
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          {title}
        </span>
        <Bone w={132} h={10} />
      </div>
      <div className="dl-top-tools">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            flex: "0 1 300px",
            minWidth: 0,
            height: 36,
            padding: "0 8px 0 11px",
            borderRadius: 10,
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border)",
            boxShadow: "var(--dl-shadow)",
            color: "var(--dl-muted)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={15}
            height={15}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.8-3.8" />
          </svg>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: 13.5,
            }}
          >
            Search deals or ask anything
          </span>
          <kbd
            className="dl-top-kbd"
            style={{
              padding: "2px 6px",
              borderRadius: 6,
              background: "var(--dl-ground)",
              border: "1px solid var(--dl-border)",
              fontFamily: "var(--dl-font-mono)",
              fontSize: 10.5,
              whiteSpace: "nowrap",
            }}
          >
            Ctrl K
          </kbd>
        </div>
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border)",
            boxShadow: "var(--dl-shadow)",
            color: "var(--dl-text-2)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
          </svg>
        </div>
        <Bone w={34} h={34} r="50%" />
      </div>
    </header>
  );
}

export function DaylightSkeletonFrame({
  label,
  title,
  pageNav,
  children,
}: {
  label: string;
  title: string;
  pageNav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`sentinel-daylight ${daylightFontClass}`}>
      <span className="sr-only" role="status">
        {label}
      </span>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DaylightMobileBar alertCount={0} />
        <DaylightSidebar alertCount={0} status={null} pageNav={pageNav} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBarSkeleton title={title} />
          <div className="dl-main w-full flex-1" aria-hidden>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
