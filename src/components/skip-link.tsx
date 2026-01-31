"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-[9999] px-4 py-3 bg-white text-black rounded-lg font-medium -translate-y-[200%] focus:translate-y-0 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0b0b0b]"
    >
      Skip to main content
    </a>
  );
}
