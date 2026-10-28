import Link from "next/link";
import { SkBar, SkLine, SkLines } from "@/components/skeleton/SiteSkeleton";

function FieldSkeleton({ label, value }: { label: number; value: number }) {
  return (
    <div>
      <SkLine w={label} lh={15} h={7} />
      <div className="mt-2 flex items-center border border-white/10 px-3 h-[42px]">
        <SkBar w={value} h={9} />
      </div>
    </div>
  );
}

export default function SignInLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <span className="sr-only" role="status">
        Loading sign in
      </span>
      <div className="flex items-center justify-between border-b border-white/10 px-8 h-[64px]">
        <Link
          href="/"
          className="font-mono text-xs tracking-wide text-white/55 hover:text-white transition-colors"
        >
          Back to home
        </Link>
        <SkBar w={98} h={12} />
      </div>
      <div aria-hidden className="grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden border-r border-white/10 px-14 pt-16 pb-10 lg:block">
          <SkLine w={298} lh={16} h={8} />
          <div className="mt-8">
            {[270, 464, 364].map((w, i) => (
              <span key={i} className="flex items-center h-[50px]">
                <SkBar w={w} h={36} r={6} />
              </span>
            ))}
          </div>
          <SkLines
            widths={[410, 408, 416]}
            lh={24}
            h={10}
            className="mt-9"
          />
          <div className="mt-9 border-t border-white/10 pt-9">
            <SkLine w={218} lh={16} h={8} />
            <div className="mt-4 space-y-[15px]">
              {[310, 458, 368, 434, 412].map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkBar w={20} h={20} r={2} />
                  <SkBar w={w} h={10} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 border border-white/10 px-6 py-5">
            <SkLine w={66} lh={16} h={7} />
            <SkLines widths={["100%", "96%", "22%"]} lh={20} h={9} className="mt-3" />
          </div>
        </div>
        <div className="flex justify-center px-6 py-12 lg:pt-[105px]">
          <div className="w-full max-w-[440px] border border-white/10 bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 h-[43px]">
              <SkBar w={36} h={8} r={999} />
              <SkBar w={176} h={9} />
              <SkBar w={46} h={16} r={2} />
            </div>
            <div className="px-8 pt-9 pb-7">
              <SkLine w={182} lh={15} h={8} />
              <div className="mt-4">
                <SkLine w={206} lh={27} h={19} />
                <SkLine w={190} lh={27} h={19} />
              </div>
              <SkLines widths={["96%", "25%"]} lh={21} h={9} className="mt-6" />
              <SkBar w="100%" h={43} r={0} className="mt-6" />
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <SkBar w={58} h={7} />
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-5">
                <FieldSkeleton label={64} value={164} />
                <FieldSkeleton label={52} value={136} />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <SkBar w={16} h={16} r={2} />
                <SkBar w={294} h={9} />
              </div>
              <SkBar w="100%" h={47} r={0} className="mt-5" />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-8 h-[40px]">
              <SkBar w={214} h={7} />
              <SkBar w={124} h={7} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
