import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSection,
  SiteSkeletonPage,
  SkBar,
  SkLine,
  SkLines,
  SkRows,
} from "@/components/skeleton/SiteSkeleton";

function ChannelCardSkeleton({ title }: { title: number }) {
  return (
    <div className="rounded-md border border-white/10 p-6">
      <SkLine w={title} lh={28} h={13} className="mb-3" />
      <div className="space-y-4">
        {[["92%", "44%"], ["52%"], ["100%", "96%", "38%"]].map((lines, i) => (
          <div key={i} className="grid grid-cols-[84px_1fr] gap-4">
            <SkLine w={[52, 60, 38][i]} lh={22} h={7} />
            <SkLines widths={lines} lh={22} h={9} />
          </div>
        ))}
      </div>
      <SkBar w={118} h={10} className="mt-6" />
    </div>
  );
}

export default function SupportLoading() {
  return (
    <SiteSkeletonPage label="Loading support" right={[58]}>
      <SiteHeroSkeleton
        eyebrow={58}
        headline={["90%"]}
        lede={["100%", "62%"]}
        meta={[232, 136]}
      />
      <SiteSection rule={false}>
        <SiteNumbered heading={196}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
            <ChannelCardSkeleton title={132} />
            <ChannelCardSkeleton title={148} />
            <ChannelCardSkeleton title={156} />
          </div>
        </SiteNumbered>
      </SiteSection>
      <SiteSection>
        <SiteNumbered heading={172}>
          <SkRows count={4} label={118} />
        </SiteNumbered>
      </SiteSection>
    </SiteSkeletonPage>
  );
}
