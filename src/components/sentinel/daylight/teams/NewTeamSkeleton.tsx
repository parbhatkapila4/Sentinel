import { Bone, DaylightSkeletonFrame, Line } from "../skeleton-parts";
import { SectionHeadSkeleton, TeamHeroSkeleton } from "./skeleton-parts";

export function NewTeamSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading new team" title="New team">
      <TeamHeroSkeleton back="Teams" deckLines={["100%", "58%"]} />
      <div className="dl-grow">
        <section className="dl-st-sec">
          <SectionHeadSkeleton title={96} sub={236} />
          <div className="dl-st-row">
            <div style={{ minWidth: 0 }}>
              <Line w={132} lh={21} h={11} />
              <Line w={268} lh={18.125} h={8} style={{ marginTop: 2 }} />
            </div>
            <div className="dl-st-ctl">
              <Bone w="100%" h={36} r={9} className="dl-st-grow" />
            </div>
          </div>
          <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
            <Bone w={112} h={36} r={9} />
            <Bone w={78} h={36} r={9} />
          </div>
        </section>
      </div>
    </DaylightSkeletonFrame>
  );
}
