import {
  SiteHeroSkeleton,
  SiteLabeled,
  SiteSection,
  SiteSkeletonPage,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

export default function AboutLoading() {
  return (
    <SiteSkeletonPage label="Loading about" right={[78]}>
      <SiteHeroSkeleton
        eyebrow={44}
        headline={["84%", "88%", "22%"]}
        lede={["100%", "96%", "9%"]}
        meta={[176, 148, 250]}
      />
      <SiteSection>
        <SiteLabeled label={136}>
          <div className="max-w-2xl space-y-4">
            <SkLines widths={["100%", "97%", "99%", "93%", "41%"]} />
            <SkLines widths={["100%", "95%", "98%", "58%"]} />
          </div>
        </SiteLabeled>
      </SiteSection>
      <SiteSection>
        <SiteLabeled label={92}>
          <div className="max-w-2xl space-y-4">
            <SkLines widths={["100%", "98%", "62%"]} />
            <SkLines widths={["100%", "96%", "99%", "97%", "88%", "34%"]} />
            <SkLines widths={["100%", "47%"]} />
          </div>
        </SiteLabeled>
      </SiteSection>
    </SiteSkeletonPage>
  );
}
