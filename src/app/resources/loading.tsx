import {
  SiteHeroSkeleton,
  SiteLabeled,
  SiteSection,
  SiteSkeletonPage,
  SkLine,
  SkLines,
} from "@/components/skeleton/SiteSkeleton";

function EntrySkeleton({ title, body }: { title: number; body: string[] }) {
  return (
    <div className="py-6 flex items-start justify-between gap-6 border-t border-white/10">
      <div className="min-w-0 flex-1">
        <SkLine w={title} lh={28} h={13} />
        <SkLines widths={body} lh={24} h={9} className="mt-1 max-w-xl" />
      </div>
      <SkLine w={92} lh={20} h={8} />
    </div>
  );
}

export default function ResourcesLoading() {
  return (
    <SiteSkeletonPage label="Loading resources" right={[138]}>
      <SiteHeroSkeleton
        eyebrow={48}
        headline={["92%"]}
        lede={["100%", "96%", "38%"]}
        meta={[72, 78, 118]}
      />
      <SiteSection>
        <SiteLabeled label={84}>
          <SkLines widths={["100%", "22%"]} className="max-w-xl" />
        </SiteLabeled>
      </SiteSection>
      {[
        [76, [[176, ["100%", "48%"]], [138, ["92%"]], [204, ["100%", "54%"]]]],
        [48, [[152, ["96%"]], [188, ["100%", "32%"]]]],
      ].map(([label, entries], i) => (
        <SiteSection key={i} rule={false}>
          <SiteLabeled label={label as number}>
            {(entries as Array<[number, string[]]>).map(([title, body], j) => (
              <EntrySkeleton key={j} title={title} body={body} />
            ))}
          </SiteLabeled>
        </SiteSection>
      ))}
    </SiteSkeletonPage>
  );
}
