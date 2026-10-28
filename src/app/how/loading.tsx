import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSection,
  SiteSkeletonPage,
  SkParagraph,
} from "@/components/skeleton/SiteSkeleton";

export default function HowLoading() {
  return (
    <SiteSkeletonPage label="Loading the product tour" right={[98]}>
      <SiteHeroSkeleton
        eyebrow={86}
        headline={["86%", "78%", "52%"]}
        lede={["100%", "98%", "44%"]}
        meta={[66, 108, 242]}
      />
      {[
        [208, ["100%", "98%", "96%", "52%"]],
        [118, ["100%", "34%"]],
        [72, ["100%", "97%", "61%"]],
        [136, ["100%", "88%"]],
      ].map(([heading, lines], i) => (
        <SiteSection key={i}>
          <SiteNumbered heading={heading as number}>
            <SkParagraph widths={lines as string[]} />
          </SiteNumbered>
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
