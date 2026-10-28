import {
  SiteHeroSkeleton,
  SiteSection,
  SiteSkeletonPage,
  SkBullets,
  SkFacts,
  SkLine,
  SkParagraph,
} from "@/components/skeleton/SiteSkeleton";

function ProviderSkeleton({ name }: { name: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <SkLine w={name} lh={34} h={18} />
          <SkLine w={30} lh={16} h={7} />
        </div>
        <SkLine w={64} lh={16} h={7} />
      </div>
      <SkParagraph widths={["100%", "84%"]} className="max-w-2xl mb-6" />
      <div className="mb-8">
        <SkFacts />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <SkLine w={92} lh={16} h={7} className="mb-4" />
          <SkBullets widths={["78%", "62%", "88%", "92%"]} />
        </div>
        <div>
          <SkLine w={128} lh={16} h={7} className="mb-4" />
          <SkBullets widths={["84%", "72%", "66%"]} />
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsLoading() {
  return (
    <SiteSkeletonPage label="Loading integrations" right={[124]}>
      <SiteHeroSkeleton
        eyebrow={84}
        headline={["84%", "26%"]}
        lede={["100%", "74%"]}
        meta={[92, 372, 288]}
      />
      {[124, 96, 172].map((name, i) => (
        <SiteSection key={i}>
          <ProviderSkeleton name={name} />
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
