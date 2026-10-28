import {
  SiteSkeletonPage,
  SkBar,
  SkLine,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

export default function DocsLoading() {
  return (
    <SiteSkeletonPage label="Loading documentation" back="Back" right={[86, 98, 62]}>
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-[1700px] mx-auto">
          <span className="flex items-center h-[40px] md:h-[48px] mb-4">
            <SkBar w={308} h="70%" r={7} />
          </span>
          <SkLines widths={["100%", "96%", "74%"]} lh={29.25} h={11} className="max-w-2xl" />
        </div>
      </section>
      <section className="px-6 lg:px-8 pb-12">
        <div className="max-w-[1700px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[104, 96, 112, 108, 88, 34].map((w, i) => (
            <div key={i} className="p-4 border border-white/10 rounded-md">
              <SkLine w={w} lh={24} h={10} />
              <SkLine w={w + 78} lh={20} h={8} />
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {[196, 172].map((heading, i) => (
            <div key={i}>
              <span className="flex items-center h-[32px] md:h-[36px] mb-5">
                <SkBar w={heading} h="66%" r={6} />
              </span>
              <SkLines widths={["100%", "42%"]} className="mb-4" />
              <SkLines widths={["84%"]} className="mb-4" />
              <SkLines widths={["34%", "38%", "41%", "30%"]} lh={30} h={9} />
            </div>
          ))}
        </div>
      </section>
    </SiteSkeletonPage>
  );
}
