import Link from "next/link";

interface ColophonProps {
  systemStatus: "operational" | "degraded" | "down";
  version?: string;
}

export function Colophon({ systemStatus, version = "v1.0" }: ColophonProps) {
  const navItems = [
    { label: "COLOPHON", href: "/colophon" },
    { label: "CHANGELOG", href: "/changelog" },
    { label: "SHORTCUTS", href: "/shortcuts" },
    { label: "API", href: "/api-docs" },
    { label: "DOCS", href: "/docs" },
    { label: "SUPPORT", href: "/support" },
  ];

  const status =
    systemStatus === "operational"
      ? { color: "var(--ivy)", label: "ALL SYSTEMS OPERATIONAL" }
      : systemStatus === "degraded"
        ? { color: "var(--copper)", label: "DEGRADED PERFORMANCE" }
        : { color: "var(--wine)", label: "INCIDENT IN PROGRESS" };

  return (
    <footer
      className="hidden md:grid grid-cols-1 md:grid-cols-3 items-center py-8 px-6 sm:px-10 lg:px-14"
      style={{
        gap: 24,
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 22,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
        }}
      >
        Sentinel<span style={{ color: "var(--signal)" }}>.</span>
        <span
          className="tabular"
          style={{
            fontStyle: "normal",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginLeft: 14,
          }}
        >
          {version} · EST 2026
        </span>
      </div>

      <nav
        className="flex flex-wrap justify-center"
        style={{
          gap: 18,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
        aria-label="Footer"
      >
        {navItems.map((n, i) => (
          <span key={n.label} className="flex items-center" style={{ gap: 18 }}>
            <Link href={n.href} style={{ color: "var(--cream-3)" }}>
              {n.label}
            </Link>
            {i < navItems.length - 1 && <span style={{ color: "var(--cream-4)" }}>·</span>}
          </span>
        ))}
      </nav>

      <div
        className="flex items-center justify-end"
        style={{
          gap: 8,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: status.color,
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          className="anim-ping"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: status.color,
          }}
        />
        {status.label}
      </div>
    </footer>
  );
}
