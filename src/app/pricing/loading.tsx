import {
  SiteHeroSkeleton,
  SiteSection,
  SiteSkeletonPage,
  SkBar,
  SkLine,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

function PlanCardSkeleton({ featured }: { featured?: boolean }) {
  return (
    <div
      className={
        featured
          ? "rounded-3xl p-4 flex flex-col border border-white/20"
          : "rounded-3xl p-4 flex flex-col border border-white/10"
      }
    >
      <div className="rounded-2xl p-5 mb-4 bg-white/[0.03]">
        <SkLine w={featured ? 132 : 84} lh={32} h={20} />
        <SkLines widths={["100%", "94%", "52%"]} lh={22} h={9} className="mt-3" />
        <div className="mt-5 flex items-end gap-2">
          <SkBar w={86} h={36} r={7} />
          <SkBar w={52} h={9} className="mb-2" />
        </div>
        <SkBar w={104} h={22} r={999} className="mt-3" />
      </div>
      <SkLine w={112} lh={18} h={8} className="justify-center" />
      <div className="mt-4 space-y-3 px-1">
        {["92%", "68%", "81%", "57%", "74%"].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkBar w={16} h={16} r="50%" />
            <SkLine w={w} lh={22} h={9} className="flex-1 min-w-0" />
          </div>
        ))}
      </div>
      <SkBar w="100%" h={48} r={12} className="mt-6" />
    </div>
  );
}

export default function PricingLoading() {
  return (
    <SiteSkeletonPage label="Loading pricing" right={[86]}>
      <SiteHeroSkeleton
        eyebrow={52}
        headline={["88%", "34%"]}
        lede={["100%", "52%"]}
        meta={[214, 104, 168]}
      />
      <SiteSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <PlanCardSkeleton />
          <PlanCardSkeleton featured />
          <PlanCardSkeleton />
        </div>
      </SiteSection>
    </SiteSkeletonPage>
  );
}
