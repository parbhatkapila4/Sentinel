"use client";

export function DashboardLoader() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading dashboard"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        animation: "sentinel-loader-enter 180ms ease both",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(245, 237, 214, 0.08)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            width: "28%",
            height: "100%",
            background: "var(--signal, #C8472E)",
            animation: "sentinel-loader-slide 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 14,
          right: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(20, 18, 16, 0.78)",
          border: "1px solid rgba(245, 237, 214, 0.12)",
          boxShadow: "0 4px 18px -10px rgba(0, 0, 0, 0.8)",
          fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: "var(--cream-2, #C9C0A8)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{
            animation: "sentinel-loader-spin 0.9s linear infinite",
            flexShrink: 0,
          }}
        >
          <circle
            cx="7"
            cy="7"
            r="5.5"
            stroke="rgba(245, 237, 214, 0.2)"
            strokeWidth="1.5"
          />
          <path
            d="M7 1.5a5.5 5.5 0 015.5 5.5"
            stroke="var(--cream, #F5EDD6)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>Loading</span>
      </div>

      <style>{`
        @keyframes sentinel-loader-enter {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sentinel-loader-slide {
          0%   { transform: translateX(-140%); }
          50%  { transform: translateX(240%); }
          100% { transform: translateX(-140%); }
        }
        @keyframes sentinel-loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
