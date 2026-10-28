import { SkBar, SkLine, SkLines } from "@/components/skeleton/SiteSkeleton";

const HATCH =
  "repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0, rgba(255, 255, 255, 0.07) 1px, transparent 1px, transparent 8px)";

function DealCardSkeleton() {
  return (
    <div className="border border-white/10 bg-[#0a0a0a]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 h-[48px]">
        <SkBar w={46} h={8} r={999} />
        <SkBar w="62%" h={26} r={3} />
      </div>
      <div className="flex items-center gap-4 border-b border-white/10 px-5 h-[42px]">
        <SkBar w={124} h={8} />
        <SkBar w={72} h={20} r={999} />
      </div>
      <div className="px-4 pt-5 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <SkLine w={250} lh={16} h={8} />
            <SkLine w={164} lh={46} h={28} />
            <div className="mt-2 flex gap-2">
              <SkBar w={76} h={22} r={2} />
              <SkBar w={78} h={22} r={2} />
              <SkBar w={72} h={22} r={2} />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <SkLine w={142} lh={58} h={42} />
            <SkLine w={220} lh={18} h={8} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-6 border-t border-white/10 pt-5">
          <SkBar w={94} h={94} r="50%" />
          <div className="min-w-0 flex-1 space-y-2">
            {["46%", "62%", "44%"].map((w, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <SkLine w={w} lh={18} h={9} className="flex-1 min-w-0" />
                <SkBar w={26} h={9} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 border border-white/10 p-4">
          <SkLine w={112} lh={16} h={8} className="mb-2" />
          <SkLines widths={["100%", "92%", "96%", "70%"]} lh={21} h={10} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-white/10 p-3">
              <SkLine w="60%" lh={14} h={7} />
              <SkLines widths={["92%", "54%"]} lh={18} h={9} className="mt-1" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4">
          <SkBar w={110} h={8} />
          <SkBar w="auto" h={4} r={2} className="flex-1" />
          <SkBar w={30} h={10} />
        </div>
      </div>
    </div>
  );
}

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <span className="sr-only" role="status">
        Loading Sentinel
      </span>
      <div aria-hidden>
        <div className="flex items-center gap-9 overflow-hidden border-b border-white/10 px-1 h-[31px]">
          {[262, 208, 274, 174, 228, 164, 196].map((w, i) => (
            <SkBar key={i} w={w} h={8} />
          ))}
        </div>
        <div className="flex items-center justify-between px-6 lg:px-11 h-[72px]">
          <div className="flex items-center gap-8">
            <SkBar w={98} h={16} />
            <div className="hidden md:flex items-center gap-6">
              {[58, 58, 34, 76, 68].map((w, i) => (
                <SkBar key={i} w={w} h={11} />
              ))}
            </div>
          </div>
          <SkBar w={83} h={40} r={0} />
        </div>
        <div
          className="h-[24px] border-y border-white/10"
          style={{ backgroundImage: HATCH }}
        />
        <div className="mx-auto grid max-w-[1368px] grid-cols-1 border-x border-white/10 lg:grid-cols-[666px_minmax(0,1fr)]">
          <div className="border-white/10 px-6 pt-12 pb-10 lg:border-r lg:px-12">
            <SkBar w={384} h={27} r={0} />
            <div className="mt-7">
              {["86%", "54%", "66%"].map((w, i) => (
                <span key={i} className="flex items-center h-[44px] md:h-[61px]">
                  <SkBar w={w} h="76%" r={6} />
                </span>
              ))}
            </div>
            <SkLines
              widths={["82%", "78%", "81%", "84%", "57%"]}
              lh={24}
              h={11}
              className="mt-6"
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <SkBar w={115} h={40} r={0} />
              <SkBar w={183} h={40} r={0} />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              {[158, 172, 186, 186].map((w, i) => (
                <SkLine key={i} w={w} lh={18} h={9} />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-9 gap-y-4 border-t border-dashed border-white/15 pt-5">
              {[66, 52, 100, 132].map((w, i) => (
                <div key={i}>
                  <SkLine w={Math.round(w * 0.5)} lh={26} h={14} />
                  <SkLine w={w} lh={18} h={8} />
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-10 lg:px-[70px]">
            <DealCardSkeleton />
          </div>
        </div>
        <div className="flex items-center gap-6 overflow-hidden border-y border-white/10 px-4 h-[53px]">
          {[96, 214, 204, 222, 186, 206, 190].map((w, i) => (
            <SkBar key={i} w={w} h={i === 0 ? 8 : 26} r={i === 0 ? 4 : 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
