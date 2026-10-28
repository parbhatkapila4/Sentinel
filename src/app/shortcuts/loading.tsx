import {
  SiteHeroSkeleton,
  SiteSection,
  SiteSkeletonPage,
  SkBar,
  SkLine,
} from "@/components/skeleton/SiteSkeleton";

function ShortcutRowSkeleton({ keys, title }: { keys: number; title: number }) {
  return (
    <div className="py-5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 sm:gap-6 items-start">
      <div className="flex items-center gap-2">
        {Array.from({ length: keys }, (_, i) => (
          <SkBar key={i} w={i === 0 ? 46 : 28} h={26} r={4} />
        ))}
      </div>
      <div className="min-w-0">
        <SkLine w={title} lh={24} h={11} />
        <SkLine w="62%" lh={22} h={8} className="mt-1 max-w-xl" />
      </div>
    </div>
  );
}

export default function ShortcutsLoading() {
  return (
    <SiteSkeletonPage label="Loading keyboard shortcuts" right={[84]}>
      <SiteHeroSkeleton
        eyebrow={74}
        headline={["76%"]}
        lede={["100%", "58%"]}
        meta={[148, 196]}
      />
      {[
        [96, [[2, 168], [2, 132], [1, 148]]],
        [124, [[2, 176], [2, 118], [3, 162], [1, 104]]],
      ].map(([label, rows], i) => (
        <SiteSection key={i}>
          <SkLine w={label as number} lh={16} h={8} className="mb-4" />
          <div className="divide-y divide-white/5 border-y border-white/5">
            {(rows as Array<[number, number]>).map(([keys, title], j) => (
              <ShortcutRowSkeleton key={j} keys={keys} title={title} />
            ))}
          </div>
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
