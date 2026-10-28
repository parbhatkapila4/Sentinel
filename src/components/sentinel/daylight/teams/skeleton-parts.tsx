import type { CSSProperties } from "react";
import { ChevronLeft } from "../blocks";
import { Bone, Line } from "../skeleton-parts";


type DeckLine = string | { w: string; narrowOnly: true };

export function TeamHeroSkeleton({
  back,
  chip,
  actions = [],
  deckLines = ["100%", "72%"],
  narrowHeadlineLines = 1,
}: {
  back?: string;
  chip?: number;
  actions?: number[];
  deckLines?: DeckLine[];
  narrowHeadlineLines?: number;
}) {
  return (
    <section className="dl-hero">
      <div className="dl-hero-lead">
        {back && (
          <span className="dl-back">
            <ChevronLeft />
            {back}
          </span>
        )}
        {chip !== undefined && <Bone w={chip} h={26} r={999} />}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--dl-headline-size)",
            marginTop: chip !== undefined ? 16 : 0,
          }}
        >
          <Bone
            w="min(100%, calc(var(--dl-headline-size) * 6.4))"
            h="calc(var(--dl-headline-size) * 0.7)"
            r={8}
          />
        </div>
        {Array.from({ length: narrowHeadlineLines - 1 }, (_, i) => (
          <div
            key={i}
            className="dl-narrow-only"
            style={{ display: "flex", alignItems: "center", height: "var(--dl-headline-size)" }}
          >
            <Bone w="62%" h="calc(var(--dl-headline-size) * 0.7)" r={8} />
          </div>
        ))}
        <div
          className="dl-hero-clause"
          style={{ display: "flex", alignItems: "center", height: "1.2em", marginTop: 8 }}
        >
          <Bone w="min(82%, calc(var(--dl-headline-size) * 5))" h="0.52em" />
        </div>
      </div>
      <div className="dl-hero-side">
        <div style={{ maxWidth: 560 }}>
          {deckLines.map((line, i) =>
            typeof line === "string" ? (
              <Line key={i} w={line} lh={24} h={10} />
            ) : (
              <div key={i} className="dl-narrow-only">
                <Line w={line.w} lh={24} h={10} />
              </div>
            )
          )}
        </div>
        {actions.length > 0 && (
          <div className="dl-hero-actions">
            {actions.map((w, i) => (
              <Bone key={i} w={w} h={36} r={9} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeadSkeleton({
  title,
  sub,
  narrowSub,
}: {
  title: number;
  sub: number | string;
  narrowSub?: string;
}) {
  return (
    <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
      <Line w={title} lh={22.5} h={12} />
      <Line w={sub} lh={19.5} h={9} style={{ marginTop: 2 }} />
      {narrowSub && (
        <div className="dl-narrow-only">
          <Line w={narrowSub} lh={19.5} h={9} />
        </div>
      )}
    </div>
  );
}

export function PersonSkeleton({ name, detail }: { name: number; detail: number }) {
  return (
    <div className="dl-person">
      <Bone w={34} h={34} r="50%" />
      <div>
        <Line w={name} lh={21} h={11} />
        <Line w={detail} lh={18.75} h={8} />
      </div>
    </div>
  );
}

export function MemberRowSkeleton({
  name,
  detail,
  controls,
  style,
}: {
  name: number;
  detail: number;
  controls: "select" | "pill";
  style?: CSSProperties;
}) {
  return (
    <div className="dl-mb-row" style={style}>
      <PersonSkeleton name={name} detail={detail} />
      <div className="dl-mb-ctl">
        {controls === "select" ? (
          <>
            <Bone w={132} h={36} r={9} />
            <Bone w={36} h={36} r={9} />
          </>
        ) : (
          <Bone w={58} h={20} r={6} />
        )}
      </div>
    </div>
  );
}

export function InlineRowSkeleton({
  label,
  sub,
  control,
  kind = "button",
}: {
  label: number;
  sub?: string;
  control: number;
  kind?: "button" | "pill" | "text";
}) {
  return (
    <div className="dl-st-row dl-st-inline">
      <div style={{ minWidth: 0 }}>
        <Line w={label} lh={21} h={11} />
        {sub && <Line w={sub} lh={18.125} h={8} style={{ marginTop: 2 }} />}
      </div>
      <div className="dl-st-ctl dl-st-end">
        {kind === "button" && <Bone w={control} h={30} r={8} />}
        {kind === "pill" && <Bone w={control} h={20} r={6} />}
        {kind === "text" && <Line w={control} lh={19.5} h={9} />}
      </div>
    </div>
  );
}
