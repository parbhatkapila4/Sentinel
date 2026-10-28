import {
  SiteHeroSkeleton,
  SiteSection,
  SiteSkeletonPage,
  SkLine,
  SkLines,
  SkRows,
} from "@/components/skeleton/SiteSkeleton";

export default function SecurityLoading() {
  return (
    <SiteSkeletonPage label="Loading security overview" right={[92]}>
      <SiteHeroSkeleton
        eyebrow={62}
        headline={["92%", "14%"]}
        lede={["100%", "97%", "38%"]}
        meta={[188, 118]}
      />
      <SiteSection>
        <SkLine w={78} lh={16} h={8} className="mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          {[
            [198, ["100%", "97%", "99%", "95%", "88%", "62%"]],
            [176, ["100%", "96%", "92%", "34%"]],
            [232, ["100%", "98%", "94%", "71%"]],
            [206, ["100%", "97%", "99%", "58%"]],
          ].map(([title, lines], i) => (
            <div key={i} className="flex gap-5">
              <SkLine w={16} lh={24} h={8} />
              <div className="min-w-0 flex-1">
                <SkLine w={title as number} lh={28} h={12} className="mb-2" />
                <SkLines widths={lines as string[]} lh={24} h={9} className="max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </SiteSection>
      <SiteSection>
        <SkLine w={118} lh={16} h={8} className="mb-6" />
        <SkRows count={5} label={132} className="divide-y divide-white/10 border-y border-white/10" />
      </SiteSection>
    </SiteSkeletonPage>
  );
}
