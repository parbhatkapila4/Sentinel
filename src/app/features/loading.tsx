import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSection,
  SiteSkeletonPage,
  SkBullets,
  SkFacts,
  SkParagraph,
} from "@/components/skeleton/SiteSkeleton";

export default function FeaturesLoading() {
  return (
    <SiteSkeletonPage label="Loading features" right={[72]}>
      <SiteHeroSkeleton
        eyebrow={60}
        headline={["80%", "62%"]}
        lede={["100%", "97%", "58%"]}
        meta={[108, 220, 168]}
      />
      {[
        [136, ["86%", "93%", "74%", "88%"]],
        [208, ["90%", "72%", "84%"]],
      ].map(([heading, bullets], i) => (
        <SiteSection key={i}>
          <SiteNumbered heading={heading as number}>
            <SkParagraph widths={["100%", "64%"]} className="max-w-2xl mb-6" />
            <div className="mb-8">
              <SkFacts />
            </div>
            <SkBullets widths={bullets as string[]} />
          </SiteNumbered>
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
