import {
  SiteHeroSkeleton,
  SiteSkeletonPage,
  SwaggerSkeleton,
} from "@/components/skeleton/SiteSkeleton";

export default function ApiDocsLoading() {
  return (
    <SiteSkeletonPage label="Loading API reference" right={[102]}>
      <SiteHeroSkeleton
        eyebrow={94}
        headline={["82%", "24%"]}
        lede={["100%", "98%", "74%"]}
        meta={[112, 118, 172]}
      />
      <section className="px-6 lg:px-8 pb-16">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-10">
          <SwaggerSkeleton />
        </div>
      </section>
    </SiteSkeletonPage>
  );
}
