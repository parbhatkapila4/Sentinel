"use client";

export function PresenceDemo() {
  return (
    <div className="relative h-32 overflow-hidden bg-gray-800/50 rounded-lg p-4 border border-white/5">
      <div className="absolute top-0 left-0 animate-move-cursor-1">
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M0 0 L0 18 L14 9 Z" />
        </svg>
        <div className="absolute top-7 left-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
          Pierre
        </div>
      </div>

      <div className="absolute top-0 right-0 animate-move-cursor-2">
        <svg
          className="w-6 h-6 text-green-500"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: "scaleX(-1)" }}
        >
          <path d="M0 0 L0 18 L14 9 Z" />
        </svg>
        <div className="absolute top-7 left-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
          Marc
        </div>
        <div className="absolute top-10 left-2 text-white/70 text-xs whitespace-nowrap">
          Love it!
        </div>
      </div>
    </div>
  );
}
