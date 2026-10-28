import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatShortMoney } from "@/lib/format-money";
import { Chevron, CountPill } from "./ui";

export type HeroTone = "alert" | "good" | "neutral" | "start";

export interface HeroChip {
  label: string;
  tone: HeroTone;
}

const CHIP_STYLE: Record<
  HeroTone,
  { background: string; color: string; dot: string }
> = {
  alert: {
    background: "var(--dl-signal-tint)",
    color: "var(--dl-signal-d)",
    dot: "var(--dl-signal)",
  },
  good: {
    background: "var(--dl-green-tint)",
    color: "var(--dl-green-text)",
    dot: "var(--dl-green)",
  },
  neutral: {
    background: "var(--dl-chip)",
    color: "var(--dl-text-2)",
    dot: "var(--dl-context)",
  },
  start: {
    background: "var(--dl-chip)",
    color: "var(--dl-text-2)",
    dot: "var(--dl-amber)",
  },
};

export const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 36,
  padding: "0 14px",
  borderRadius: 9,
  border: 0,
  background: "var(--dl-ink)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(16, 24, 40, 0.25)",
  color: "var(--dl-panel)",
  fontSize: 13.5,
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 36,
  padding: "0 14px",
  borderRadius: 9,
  background: "var(--dl-panel)",
  border: "1px solid var(--dl-border-strong)",
  boxShadow: "var(--dl-shadow)",
  color: "var(--dl-ink)",
  fontSize: 13.5,
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

export const smallButtonStyle: CSSProperties = {
  height: 30,
  padding: "0 11px",
  borderRadius: 8,
  fontSize: 13,
  minHeight: 0,
};

export const dangerButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  border: "1px solid rgba(200, 71, 46, 0.45)",
  boxShadow: "none",
  color: "var(--dl-signal-d)",
};

export function PlusIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HeroLink({
  href,
  tone,
  icon,
  children,
}: {
  href: string;
  tone: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={tone === "primary" ? "dl-btn-primary" : "dl-btn-secondary"}
      style={{
        ...(tone === "primary" ? primaryButtonStyle : secondaryButtonStyle),
        ...(icon ? { paddingLeft: 12 } : null),
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

interface PageHeroProps {
  label?: string;
  back?: { href: string; label: string };
  chip?: HeroChip | HeroChip[];
  headline: string;
  emphasis?: string;
  clause: string;
  deck: ReactNode;
  actions?: ReactNode;
}

export function WideOnly({ children }: { children: ReactNode }) {
  return <span className="dl-wide-only">{children}</span>;
}

export function ChevronLeft({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="dl-back">
      <ChevronLeft />
      {children}
    </Link>
  );
}

function HeroChipMark({ chip, block }: { chip: HeroChip; block: boolean }) {
  const chipStyle = CHIP_STYLE[chip.tone];
  return (
    <span
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "max-content" : undefined,
        alignItems: "center",
        gap: 7,
        height: 26,
        padding: "0 10px",
        borderRadius: 999,
        background: chipStyle.background,
        color: chipStyle.color,
        fontSize: 12.5,
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: chipStyle.dot,
        }}
      />
      {chip.label}
    </span>
  );
}

export function PageHero({
  label = "Summary",
  back,
  chip,
  headline,
  emphasis,
  clause,
  deck,
  actions,
}: PageHeroProps) {
  const chips = chip === undefined ? [] : Array.isArray(chip) ? chip : [chip];

  return (
    <section aria-label={label} className="dl-hero">
      <div className="dl-hero-lead">
        {back && <BackLink href={back.href}>{back.label}</BackLink>}
        {chips.length === 1 && <HeroChipMark chip={chips[0]} block={Boolean(back)} />}
        {chips.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {chips.map((c) => (
              <HeroChipMark key={c.label} chip={c} block={false} />
            ))}
          </div>
        )}
        <h1
          className="dl-headline"
          style={{
            marginTop: chips.length > 0 ? 16 : 0,
            fontFamily: "var(--dl-font-serif)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            overflowWrap: "anywhere",
          }}
        >
          {emphasis === undefined ? (
            <>
              {headline}
              <span style={{ color: "var(--dl-signal)" }}>.</span>
            </>
          ) : (
            <>
              {headline}{" "}
              <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
                {emphasis}
              </em>
            </>
          )}
        </h1>
        <p
          className="dl-hero-clause"
          style={{
            marginTop: 8,
            fontFamily: "var(--dl-font-serif)",
            fontStyle: "italic",
            lineHeight: 1.2,
            color: "var(--dl-muted)",
          }}
        >
          {clause}
        </p>
      </div>
      <div className="dl-hero-side">
        <p
          style={{
            maxWidth: 560,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--dl-text-2)",
          }}
        >
          {deck}
        </p>
        {actions && <div className="dl-hero-actions">{actions}</div>}
      </div>
    </section>
  );
}

export function DataErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px var(--dl-gutter)",
        background: "var(--dl-signal-tint)",
        borderBottom: "1px solid var(--dl-divider)",
        color: "var(--dl-signal-d)",
        fontSize: 13.5,
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: "50%",
          background: "var(--dl-signal)",
        }}
      />
      {children}
    </div>
  );
}

export const kpiLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--dl-muted)",
};

export const kpiValueStyle: CSSProperties = {
  marginTop: 4,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.035em",
  fontVariantNumeric: "tabular-nums",
};

export const captionStyle: CSSProperties = {
  fontSize: 12.5,
  color: "var(--dl-muted)",
};

export const unitStyle: CSSProperties = {
  fontWeight: 500,
  color: "var(--dl-unit)",
};

export function KpiTile({
  label,
  value,
  visual,
  caption,
  empty = false,
}: {
  label: string;
  value: ReactNode;
  visual: ReactNode;
  caption: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="dl-kpi">
      <div style={kpiLabelStyle}>{label}</div>
      <div
        className="dl-kpi-value"
        style={{ ...kpiValueStyle, color: empty ? "var(--dl-unit)" : undefined }}
      >
        {value}
      </div>
      <div style={{ display: "flex", marginTop: 11 }}>{visual}</div>
      <div style={{ ...captionStyle, marginTop: 7 }}>{caption}</div>
    </div>
  );
}

export function Percent({ value, digits = 0 }: { value: number; digits?: number }) {
  return (
    <>
      {value.toFixed(digits)}
      <span style={unitStyle}>%</span>
    </>
  );
}

export const subStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--dl-muted)",
};

export function CellHead({
  title,
  pill,
  sub,
  right,
  compact = false,
  danger = false,
}: {
  title: string;
  pill?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px 16px",
        padding: compact
          ? "18px var(--dl-gutter) 4px"
          : "18px var(--dl-gutter) 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px 9px",
          minWidth: 0,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: danger ? "var(--dl-signal-d)" : undefined,
          }}
        >
          {title}
        </h2>
        {pill}
        {sub && <span style={subStyle}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export type PillTone = "neutral" | "alert" | "good" | "warn";

const PILL_TONES: Record<PillTone, CSSProperties> = {
  neutral: {},
  alert: { background: "var(--dl-signal-tint)", color: "var(--dl-signal-d)" },
  good: { background: "var(--dl-green-tint)", color: "var(--dl-green-text)" },
  warn: { background: "var(--dl-amber-tint)", color: "var(--dl-amber-text)" },
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  if (tone === "neutral") return <CountPill>{children}</CountPill>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...PILL_TONES[tone],
      }}
    >
      {children}
    </span>
  );
}

export function CellLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="dl-link dl-tap"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--dl-ink)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      <Chevron />
    </Link>
  );
}

export function DealLink({
  id,
  name,
  style,
}: {
  id: string;
  name: string;
  style?: CSSProperties;
}) {
  return (
    <Link
      href={`/deals/${id}`}
      className="dl-link"
      style={{
        display: "block",
        minHeight: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: "var(--dl-ink)",
        ...style,
      }}
    >
      {name}
    </Link>
  );
}

export const cellBodyStyle: CSSProperties = {
  padding: "0 var(--dl-gutter) 18px",
};

export function KeyValue({
  label,
  children,
  first = false,
}: {
  label: ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        padding: "11px 0",
        borderTop: first ? undefined : "1px solid var(--dl-row)",
        fontSize: 13.5,
        color: "var(--dl-text-2)",
      }}
    >
      <span style={{ minWidth: 0 }}>{label}</span>
      <b
        style={{
          flexShrink: 0,
          fontSize: 15,
          fontWeight: 600,
          color: "var(--dl-ink)",
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        }}
      >
        {children}
      </b>
    </div>
  );
}

export function BigFigure({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 34,
        fontWeight: 600,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </p>
  );
}

export function Track({
  percent,
  color = "var(--dl-ink)",
  width,
  height = 7,
  label,
  style,
}: {
  percent: number;
  color?: string;
  width?: number | string;
  height?: number;
  label?: string;
  style?: CSSProperties;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        position: "relative",
        flexShrink: 0,
        width,
        maxWidth: "100%",
        height,
        borderRadius: 2,
        background: "var(--dl-track)",
        overflow: "hidden",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: `${clamped}%`,
          borderRadius: 2,
          background: color,
        }}
      />
    </div>
  );
}

export function Square({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 2,
        background: color,
      }}
    />
  );
}

export type TierKey = "high" | "medium" | "low" | "won" | "lost" | "closed";

export const TIER_COLOR: Record<TierKey, string> = {
  high: "var(--dl-signal)",
  medium: "var(--dl-amber)",
  low: "var(--dl-ink)",
  won: "var(--dl-green)",
  lost: "var(--dl-seg)",
  closed: "var(--dl-seg)",
};

export const TIER_LABEL: Record<TierKey, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  won: "Won",
  lost: "Lost",
  closed: "Closed",
};

export function RiskMark({
  tier,
  label,
  fontSize = 13,
}: {
  tier: TierKey;
  label?: string;
  fontSize?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize,
        color: "var(--dl-text-2)",
        whiteSpace: "nowrap",
      }}
    >
      <Square color={TIER_COLOR[tier]} />
      {label ?? TIER_LABEL[tier]}
    </span>
  );
}

export function Legend({
  items,
  className,
  style,
}: {
  items: Array<{ label: string; color: string }>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 14px",
        fontSize: 12.5,
        color: "var(--dl-text-2)",
        ...style,
      }}
    >
      {items.map((item) => (
        <span
          key={item.label}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Square color={item.color} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export const RISK_LEGEND = [
  { label: "High risk", color: TIER_COLOR.high },
  { label: "Medium", color: TIER_COLOR.medium },
  { label: "Low", color: TIER_COLOR.low },
];

export function HBar({
  label,
  percent,
  color,
  value,
  columns = "104px minmax(0, 1fr) 44px",
  valueStyle,
}: {
  label: ReactNode;
  percent: number;
  color?: string;
  value: ReactNode;
  columns?: string;
  valueStyle?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        alignItems: "center",
        gap: 12,
        minHeight: 38,
        fontSize: 13.5,
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <Track percent={percent} color={color} height={8} />
      <span
        style={{
          justifySelf: "end",
          fontSize: 14.5,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          ...valueStyle,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export const listRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minHeight: 46,
  padding: "9px 0",
  borderTop: "1px solid var(--dl-row)",
  fontSize: 13.5,
};

export const valueTextStyle: CSSProperties = {
  fontSize: 14.5,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

export const metaTextStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--dl-text-2)",
};

export const lateStyle: CSSProperties = { color: "var(--dl-signal-d)" };

export const ellipsisStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const tableRowStyle: CSSProperties = {
  minHeight: 56,
  paddingTop: 10,
  paddingBottom: 10,
  borderBottom: "1px solid var(--dl-row)",
};

export function DividerRow({ children }: { children: ReactNode }) {
  return (
    <div
      role="presentation"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 30,
        padding: "0 var(--dl-gutter)",
        background: "var(--dl-tint)",
        borderBottom: "1px solid var(--dl-row)",
        fontFamily: "var(--dl-font-mono)",
        fontSize: 10.5,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--dl-muted)",
      }}
    >
      {children}
    </div>
  );
}

export const FILL_STEPS = [
  "Connect HubSpot or Salesforce. Sentinel only reads; nothing is written back.",
  "Open deals sync in with their stage, value and recent activity.",
  "Every number and list on this page fills in from there.",
];

export const UNAVAILABLE_STEPS = [
  "Your deals are safe. This page only reads them.",
  "The zeros above are placeholders, not your real totals.",
  "Reload the page in a moment to try again.",
];

export function BookEmpty({
  unavailable,
  title,
  emphasis,
  body,
}: {
  unavailable: boolean;
  title: string;
  emphasis: string;
  body: string;
}) {
  const steps = unavailable ? UNAVAILABLE_STEPS : FILL_STEPS;
  return (
    <div className="dl-grid dl-grow" role="status">
      <div
        className="dl-two-thirds"
        style={{ padding: "clamp(32px, 4cqw, 46px) var(--dl-gutter) 44px" }}
      >
        <div
          style={{
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--dl-signal-d)",
          }}
        >
          {unavailable ? "Deals unavailable" : "Nothing on the book yet"}
        </div>
        <h2
          style={{
            marginTop: 14,
            fontFamily: "var(--dl-font-serif)",
            fontWeight: 400,
            fontSize: "clamp(34px, 4.4cqw, 46px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {unavailable ? "Deals" : title}{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
            {unavailable ? "did not load." : emphasis}
          </em>
        </h2>
        <p
          style={{
            maxWidth: 500,
            marginTop: 14,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--dl-text-2)",
          }}
        >
          {unavailable
            ? "The deals could not be loaded just now. Nothing has been lost; reload in a moment and the numbers come back."
            : body}
        </p>
        {!unavailable && (
          <div className="dl-hero-actions" style={{ marginTop: 22 }}>
            <HeroLink href="/settings?tab=integrations" tone="primary">
              Connect a CRM
            </HeroLink>
            <HeroLink href="/deals/new" tone="secondary" icon={<PlusIcon size={14} />}>
              Add a deal
            </HeroLink>
          </div>
        )}
      </div>
      <div className="dl-third" style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: "21px" }}>
          {unavailable ? "What this means" : "How this page fills"}
        </h3>
        <ol style={{ marginTop: 12 }}>
          {steps.map((step, i) => (
            <li
              key={step}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderTop: "1px solid var(--dl-row)",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "flex",
                  flex: "0 0 22px",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--dl-ink)",
                  color: "var(--dl-panel)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        padding: "10px 0 4px",
        fontSize: 13.5,
        color: "var(--dl-muted)",
      }}
    >
      {children}
    </p>
  );
}

export function TierLine({
  tier,
  detail,
  value,
}: {
  tier: "high" | "medium" | "low";
  detail: string;
  value: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        padding: "11px 0",
        borderTop: "1px solid var(--dl-row)",
        fontSize: 13.5,
        color: "var(--dl-text-2)",
      }}
    >
      <RiskMark tier={tier} fontSize={13.5} />
      <span style={{ marginLeft: "auto", color: "var(--dl-muted)" }}>{detail}</span>
      <b
        style={{
          width: 64,
          textAlign: "right",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--dl-ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatShortMoney(value)}
      </b>
    </div>
  );
}
