import { DaylightSkeletonFrame } from "../skeleton-parts";
import {
  InlineRowSkeleton,
  MemberRowSkeleton,
  SectionHeadSkeleton,
  TeamHeroSkeleton,
} from "./skeleton-parts";

const MEMBERS: Array<{ name: number; detail: number; controls: "select" | "pill" }> = [
  { name: 112, detail: 148, controls: "pill" },
  { name: 92, detail: 132, controls: "select" },
  { name: 118, detail: 146, controls: "select" },
  { name: 98, detail: 124, controls: "select" },
];

export function TeamDetailSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading team" title="Teams">
      <TeamHeroSkeleton
        back="Teams"
        chip={128}
        actions={[118]}
        deckLines={["100%", "94%", { w: "30%", narrowOnly: true }]}
      />
      <section className="dl-st-sec">
        <SectionHeadSkeleton title={66} sub="min(100%, 300px)" narrowSub="22%" />
        {MEMBERS.map((m, i) => (
          <MemberRowSkeleton key={i} {...m} />
        ))}
      </section>
      <section className="dl-st-sec dl-grow">
        <SectionHeadSkeleton title={88} sub={170} />
        <InlineRowSkeleton label={150} sub="min(100%, 420px)" control={96} />
      </section>
    </DaylightSkeletonFrame>
  );
}
