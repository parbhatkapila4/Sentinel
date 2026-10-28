import {
  SiteHeroSkeleton,
  SiteSkeletonPage,
  SkBar,
  SkLine,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

function EntrySkeleton({ title, notes }: { title: number; notes: string[] }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-[5px] top-2 h-2 w-2 rounded-full bg-white/25" />
      <SkLine w={96} lh={16} h={8} />
      <SkLine w={title} lh={34} h={15} className="mt-1" />
      <SkLines widths={["100%", "58%"]} className="max-w-2xl mt-1 mb-5" />
      <div className="space-y-3">
        {notes.map((w, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkBar w={62} h={20} r={3} />
            <SkLine w={w} lh={24} h={9} className="flex-1 min-w-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangelogLoading() {
  return (
    <SiteSkeletonPage label="Loading changelog" right={[116]}>
      <SiteHeroSkeleton
        eyebrow={72}
        headline={["78%"]}
        lede={["100%", "97%", "9%"]}
        meta={[118, 232]}
      />
      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto space-y-14">
          <EntrySkeleton title={322} notes={["66%", "84%", "71%"]} />
          <EntrySkeleton title={288} notes={["58%", "49%"]} />
          <EntrySkeleton title={246} notes={["62%", "74%", "44%"]} />
        </div>
      </section>
    </SiteSkeletonPage>
  );
}
