import { DaylightSkeletonFrame } from "../skeleton-parts";
import { InlineRowSkeleton, SectionHeadSkeleton, TeamHeroSkeleton } from "./skeleton-parts";

export function TeamInviteSkeleton() {
  return (
    <DaylightSkeletonFrame label="Loading invite" title="Team invite">
      <TeamHeroSkeleton chip={104} actions={[118, 92]} narrowHeadlineLines={2} />
      <section className="dl-st-sec dl-grow">
        <SectionHeadSkeleton title={98} sub={190} />
        <InlineRowSkeleton label={44} control={104} kind="text" />
        <InlineRowSkeleton label={72} sub="160px" control={62} kind="pill" />
        <InlineRowSkeleton label={58} sub="176px" control={140} kind="text" />
        <InlineRowSkeleton label={56} control={108} kind="text" />
      </section>
    </DaylightSkeletonFrame>
  );
}
