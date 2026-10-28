import {
  SiteHeroSkeleton,
  SiteSection,
  SiteSkeletonPage,
  SkBar,
  SkLine,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

function FieldSkeleton({ label, tall }: { label: number; tall?: boolean }) {
  return (
    <div>
      <SkLine w={label} lh={16} h={7} />
      <div
        className="mt-2 border-b border-white/15"
        style={{ height: tall ? 132 : 40 }}
      >
        <SkLine w={tall ? "64%" : "46%"} lh={40} h={9} />
      </div>
    </div>
  );
}

export default function ContactLoading() {
  return (
    <SiteSkeletonPage label="Loading contact" right={[122]}>
      <SiteHeroSkeleton
        eyebrow={54}
        headline={["86%", "42%"]}
        lede={["100%", "66%"]}
        meta={[262, 214]}
      />
      <SiteSection>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-14 gap-y-12">
          <div>
            <SkLine w={112} lh={16} h={8} className="mb-6" />
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldSkeleton label={36} />
                <FieldSkeleton label={92} />
              </div>
              <FieldSkeleton label={38} />
              <FieldSkeleton label={58} tall />
              <SkBar w={148} h={42} r={6} />
            </div>
          </div>
          <div>
            <SkLine w={118} lh={16} h={8} className="mb-6" />
            <div className="divide-y divide-white/10 border-y border-white/10">
              {[132, 96, 118].map((w, i) => (
                <div key={i} className="py-5">
                  <SkLine w={44} lh={16} h={7} />
                  <SkLine w={w} lh={26} h={11} className="mt-1" />
                  <SkLines widths={["88%", "36%"]} lh={22} h={8} className="mt-1 max-w-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteSection>
    </SiteSkeletonPage>
  );
}
