import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSection,
  SiteSkeletonPage,
  SkRows,
} from "@/components/skeleton/SiteSkeleton";

export default function ColophonLoading() {
  return (
    <SiteSkeletonPage label="Loading colophon" right={[70]}>
      <SiteHeroSkeleton
        eyebrow={62}
        headline={["62%"]}
        lede={["100%", "78%"]}
        meta={[226]}
      />
      {[
        [108, 4],
        [58, 5],
        [142, 3],
      ].map(([heading, rows], i) => (
        <SiteSection key={i}>
          <SiteNumbered heading={heading}>
            <SkRows count={rows} label={104} />
          </SiteNumbered>
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
