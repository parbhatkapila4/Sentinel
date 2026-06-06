import type { CategoryStyle, NotificationCategory } from "./types";

export const CATEGORY_STYLE: Record<NotificationCategory, CategoryStyle> = {
  RISK: {
    label: "AT RISK",
    labelColor: "var(--signal)",
    iconColor: "var(--signal)",
  },
  ACTION: {
    label: "ACTION",
    labelColor: "var(--copper)",
    iconColor: "var(--copper)",
  },
  STAGE: {
    label: "STAGE MOVE",
    labelColor: "var(--ivy)",
    iconColor: "var(--ivy)",
  },
  TEAM: {
    label: "TEAM",
    labelColor: "var(--cream-2)",
    iconColor: "var(--cream-2)",
  },
  MENTION: {
    label: "MENTION",
    labelColor: "var(--cream-2)",
    iconColor: "var(--cream-2)",
  },
  SYSTEM: {
    label: "NOTE",
    labelColor: "var(--cream-3)",
    iconColor: "var(--cream-3)",
  },
};

export function CategoryIcon({ category }: { category: NotificationCategory }) {
  const c = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (category) {
    case "RISK":
      return (
        <svg {...c} aria-hidden>
          <path d="M12 2l10 18H2z" />
          <path d="M12 9v5M12 17h.01" />
        </svg>
      );
    case "ACTION":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "STAGE":
      return (
        <svg {...c} aria-hidden>
          <path d="M3 7h13l4 5-4 5H3" />
          <path d="M3 3v18" />
        </svg>
      );
    case "TEAM":
      return (
        <svg {...c} aria-hidden>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "MENTION":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-4 8" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
  }
}
