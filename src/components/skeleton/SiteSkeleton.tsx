import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Size = number | string;

interface BarProps {
  w: Size;
  h?: Size;
  r?: Size;
  className?: string;
  style?: CSSProperties;
}

export function SkBar({ w, h = 10, r, className, style }: BarProps) {
  return (
    <span
      aria-hidden
      className={className ? `site-skel ${className}` : "site-skel"}
      style={{
        width: w,
        height: h,
        ...(r === undefined ? {} : { borderRadius: r }),
        ...style,
      }}
    />
  );
}

interface LineProps {
  w: Size;
  lh: number;
  h?: number;
  className?: string;
  style?: CSSProperties;
}

export function SkLine({ w, lh, h = 10, className, style }: LineProps) {
  return (
    <span
      className={className ? `flex items-center ${className}` : "flex items-center"}
      style={{ height: lh, ...style }}
    >
      <SkBar w={w} h={h} />
    </span>
  );
}

interface LinesProps {
  widths: Size[];
  lh?: number;
  h?: number;
  className?: string;
}

export function SkLines({ widths, lh = 26, h = 10, className }: LinesProps) {
  return (
    <div className={className}>
      {widths.map((w, i) => (
        <SkLine key={i} w={w} lh={lh} h={h} />
      ))}
    </div>
  );
}

interface PageProps {
  label: string;
  back?: string;
  right?: number[];
  children: ReactNode;
}

export function SiteSkeletonPage({
  label,
  back = "Back to home",
  right = [96],
  children,
}: PageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <span className="sr-only" role="status">
        {label}
      </span>
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {back}
          </Link>
          <div className="flex items-center gap-4" aria-hidden>
            {right.map((w, i) => (
              <SkLine key={i} w={w} lh={20} h={9} />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden>{children}</div>
    </div>
  );
}

interface HeroProps {
  eyebrow?: number;
  headline: string[];
  lede?: string[];
  meta?: number[];
  toc?: number[];
}

export function SiteHeroSkeleton({
  eyebrow = 64,
  headline,
  lede = ["100%", "74%"],
  meta = [150, 132, 196],
  toc,
}: HeroProps) {
  return (
    <section className="px-6 lg:px-8 pt-20 pb-12">
      <div className="max-w-[1700px] mx-auto">
        {eyebrow > 0 && <SkLine w={eyebrow} lh={16.5} h={8} className="mb-4" />}
        <div className="max-w-3xl mb-5">
          {headline.map((w, i) => (
            <span key={i} className="flex items-center h-[38px] md:h-[50px]">
              <SkBar w={w} h="68%" r={7} />
            </span>
          ))}
        </div>
        <SkLines widths={lede} lh={29.25} h={11} className="max-w-2xl" />
        {meta.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            {meta.map((w, i) => (
              <SkLine key={i} w={w} lh={16} h={8} />
            ))}
          </div>
        )}
        {toc && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {toc.map((w, i) => (
              <SkLine key={i} w={w} lh={16} h={8} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface SectionProps {
  children: ReactNode;
  rule?: boolean;
  className?: string;
}

export function SiteSection({ children, rule = true, className }: SectionProps) {
  const inner = rule
    ? "max-w-[1700px] mx-auto border-t border-white/10 pt-12"
    : "max-w-[1700px] mx-auto";
  return (
    <section className="px-6 lg:px-8 pb-16">
      <div className={className ? `${inner} ${className}` : inner}>{children}</div>
    </section>
  );
}

interface LabeledProps {
  label?: number;
  children: ReactNode;
}

export function SiteLabeled({ label = 124, children }: LabeledProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
      <SkLine w={label} lh={16} h={8} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface NumberedProps {
  heading?: number;
  children: ReactNode;
}

export function SiteNumbered({ heading = 190, children }: NumberedProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] gap-6 md:gap-10">
      <SkLine w={18} lh={16} h={8} className="md:mt-[10px]" />
      <div className="min-w-0">
        <span className="flex items-center h-[32px] md:h-[36px] mb-3">
          <SkBar w={heading} h="62%" r={6} />
        </span>
        {children}
      </div>
    </div>
  );
}

export function SkParagraph({
  widths = ["100%", "96%", "58%"],
  className = "max-w-2xl",
}: {
  widths?: Size[];
  className?: string;
}) {
  return <SkLines widths={widths} className={className} />;
}

export function SkBullets({ widths }: { widths: Size[] }) {
  return (
    <div className="space-y-3 max-w-3xl">
      {widths.map((w, i) => (
        <div key={i} className="flex gap-3">
          <SkBar w={5} h={5} r="50%" className="mt-[10px]" />
          <SkLine w={w} lh={26} className="flex-1 min-w-0" />
        </div>
      ))}
    </div>
  );
}

export function SkFacts({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <SkLine w={52} lh={16} h={7} />
          <SkLine w={[148, 124, 196][i % 3]} lh={20} h={9} />
        </div>
      ))}
    </div>
  );
}

export function SkRows({
  count,
  label = 120,
  className = "divide-y divide-white/5 border-y border-white/5",
}: {
  count: number;
  label?: number;
  className?: string;
}) {
  const widths = ["72%", "58%", "84%", "64%", "49%", "77%"];
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="py-4 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6"
        >
          <SkLine w={label - (i % 3) * 18} lh={24} />
          <SkLine w={widths[i % widths.length]} lh={24} h={9} />
        </div>
      ))}
    </div>
  );
}

export function SkCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const base = "rounded-md border border-white/10 p-5";
  return <div className={className ? `${base} ${className}` : base}>{children}</div>;
}

export function SwaggerSkeleton() {
  return (
    <div aria-hidden className="py-4">
      <div className="flex items-center gap-3">
        <SkBar w={152} h={24} r={6} />
        <SkBar w={38} h={18} r={999} />
        <SkBar w={50} h={18} r={999} />
      </div>
      <SkBar w={172} h={26} r={6} className="mt-7" />
      <SkLines widths={["100%", "28%"]} lh={22} h={9} className="mt-4 max-w-5xl" />
      <SkLine w={118} lh={30} h={12} className="mt-3" />
      <SkLines widths={["96%", "34%"]} lh={22} h={9} className="max-w-5xl" />
      <SkLine w={92} lh={30} h={12} className="mt-3" />
      <SkLines widths={["46%"]} lh={22} h={9} className="max-w-5xl" />
      <div className="mt-8 space-y-3">
        {[232, 188, 264, 206, 174].map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md border border-white/10 px-4 h-[46px]"
          >
            <SkBar w={58} h={24} r={4} />
            <SkBar w={w} h={10} />
            <SkBar w={16} h={16} r={4} className="ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
