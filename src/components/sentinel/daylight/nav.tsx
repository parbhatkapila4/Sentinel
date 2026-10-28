import type { ReactNode } from "react";

export interface DaylightNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  showAlerts?: boolean;
}

export const DAYLIGHT_NAV: DaylightNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <>
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    label: "Deals",
    href: "/deals",
    icon: (
      <>
        <path d="M4 7h16v13H4z" />
        <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
        <path d="M4 12h16" />
      </>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </>
    ),
  },
  {
    label: "Top deals",
    href: "/top-deals",
    icon: (
      <>
        <path d="M7 4h10v3a5 5 0 01-10 0V4z" />
        <path d="M7 6H5a2 2 0 002 4M17 6h2a2 2 0 01-2 4" />
        <path d="M9 20h6M12 14v6" />
      </>
    ),
  },
  {
    label: "Forecast",
    href: "/deals-by-stage",
    icon: (
      <>
        <rect x="3" y="12" width="4" height="8" />
        <rect x="10" y="8" width="4" height="12" />
        <rect x="17" y="4" width="4" height="16" />
      </>
    ),
  },
  {
    label: "Alerts",
    href: "/risk-overview",
    showAlerts: true,
    icon: (
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
    ),
  },
  {
    label: "Sentinel AI",
    href: "/insights",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
  },
];

export const SETTINGS_NAV: DaylightNavItem = {
  label: "Settings",
  href: "/settings",
  icon: (
    <>
      <path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
};

export function NavIcon({
  children,
  size = 17,
  color = "currentColor",
  strokeWidth = 1.6,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ color }}
    >
      {children}
    </svg>
  );
}

export function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SOURCE_NAMES: Record<string, string> = {
  SALESFORCE: "Salesforce",
  HUBSPOT: "HubSpot",
  CALENDAR: "Google Calendar",
  SLACK: "Slack",
};

export interface SourceStatus {
  state: "live" | "demo" | "none";
  title: string;
  detail: string;
}

export function describeSources(sourceLabels: string[]): SourceStatus {
  const live = sourceLabels.filter((s) => s && s !== "NONE" && s !== "DEMO");
  if (live.length > 0) {
    return {
      state: "live",
      title: "Live",
      detail: live.map((s) => SOURCE_NAMES[s] ?? s).join(" · "),
    };
  }
  if (sourceLabels.includes("DEMO")) {
    return { state: "demo", title: "Demo data", detail: "Sample deals shown" };
  }
  return {
    state: "none",
    title: "Not connected",
    detail: "Connect a CRM to go live",
  };
}
