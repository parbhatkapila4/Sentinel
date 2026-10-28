import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSection,
  SiteSkeletonPage,
  SkFacts,
  SkLine,
  SkParagraph,
} from "@/components/skeleton/SiteSkeleton";

export default function DeveloperDocsLoading() {
  return (
    <SiteSkeletonPage label="Loading developer docs" right={[92]}>
      <SiteHeroSkeleton
        eyebrow={108}
        headline={["50%"]}
        lede={["100%", "97%", "14%"]}
        meta={[206, 122]}
      />
      <SiteSection>
        <SkLine w={66} lh={16} h={8} className="mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[112, 84].map((w, i) => (
            <div key={i} className="rounded-md border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <SkLine w={w} lh={26} h={12} />
                <SkLine w={78} lh={16} h={7} />
              </div>
              <SkLine w="78%" lh={24} h={9} className="mt-2" />
            </div>
          ))}
        </div>
      </SiteSection>
      <SiteSection>
        <SiteNumbered heading={206}>
          <SkParagraph widths={["100%", "70%"]} className="max-w-2xl mb-6" />
          <SkFacts />
        </SiteNumbered>
      </SiteSection>
    </SiteSkeletonPage>
  );
}
