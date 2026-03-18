export function RouteLoader() {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#0a0a0a]"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-[13px] font-medium tracking-[0.35em] uppercase text-white/40 select-none">
          Sentinel
        </p>

        <div className="relative h-[3px] w-48 overflow-hidden rounded-full bg-white/6">
          <div
            className="absolute inset-y-0 w-[40%] rounded-full will-change-transform"
            style={{
              background: "linear-gradient(90deg, #0f766e, #5eead4)",
              animation: "sentinel-slide 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes sentinel-slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(280%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
