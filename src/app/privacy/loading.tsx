import {
  SiteHeroSkeleton,
  SiteNumbered,
  SiteSkeletonPage,
  SkBullets,
  SkParagraph,
} from "@/components/skeleton/SiteSkeleton";

export default function PrivacyLoading() {
  return (
    <SiteSkeletonPage label="Loading privacy policy" right={[84]}>
      <SiteHeroSkeleton
        eyebrow={52}
        headline={["72%","22%"]}
        lede={["100%", "44%"]}
        meta={[178, 118]}
        toc={[104,96,132,62,70,78,148,58]}
      />
      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto space-y-14">
          {[
            [164, ["100%", "22%"], ["92%", "96%", "88%"]],
            [148, ["100%", "96%", "40%"], []],
            [212, ["100%", "64%"], ["84%", "72%"]],
          ].map(([heading, lines, bullets], i) => (
            <div key={i} className="border-t border-white/10 pt-10">
              <SiteNumbered heading={heading as number}>
                <SkParagraph widths={lines as string[]} />
                {(bullets as string[]).length > 0 && (
                  <div className="pt-5">
                    <SkBullets widths={bullets as string[]} />
                  </div>
                )}
              </SiteNumbered>
            </div>
          ))}
        </div>
      </section>
    </SiteSkeletonPage>
  );
}
