
export function RouteLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="h-12 w-12 rounded-full border-2 border-[#1f1f1f] border-t-[#8b1a1a] animate-spin"
          role="status"
        />
        <p className="text-sm font-medium text-white/60">Loading...</p>
      </div>
    </div>
  );
}
