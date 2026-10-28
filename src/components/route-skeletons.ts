import type { ComponentType } from "react";

export interface RouteSkeletonEntry {
  file: string;
  test: (pathname: string) => boolean;
  load: () => Promise<{ default: ComponentType }>;
}

const exact = (path: string) => (pathname: string) => pathname === path;

const under = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const ROUTE_SKELETONS: RouteSkeletonEntry[] = [
  {
    file: "dashboard/loading.tsx",
    test: under("/dashboard"),
    load: () => import("@/app/dashboard/loading"),
  },
  {
    file: "deals/new/loading.tsx",
    test: under("/deals/new"),
    load: () => import("@/app/deals/new/loading"),
  },
  {
    file: "deals/[id]/loading.tsx",
    test: (pathname) => /^\/deals\/[^/]+/.test(pathname),
    load: () => import("@/app/deals/[id]/loading"),
  },
  {
    file: "deals/loading.tsx",
    test: exact("/deals"),
    load: () => import("@/app/deals/loading"),
  },
  {
    file: "deals-by-stage/loading.tsx",
    test: under("/deals-by-stage"),
    load: () => import("@/app/deals-by-stage/loading"),
  },
  {
    file: "top-deals/loading.tsx",
    test: under("/top-deals"),
    load: () => import("@/app/top-deals/loading"),
  },
  {
    file: "analytics/loading.tsx",
    test: under("/analytics"),
    load: () => import("@/app/analytics/loading"),
  },
  {
    file: "risk-overview/loading.tsx",
    test: under("/risk-overview"),
    load: () => import("@/app/risk-overview/loading"),
  },
  {
    file: "insights/loading.tsx",
    test: under("/insights"),
    load: () => import("@/app/insights/loading"),
  },
  {
    file: "reports/loading.tsx",
    test: under("/reports"),
    load: () => import("@/app/reports/loading"),
  },
  {
    file: "notifications/loading.tsx",
    test: under("/notifications"),
    load: () => import("@/app/notifications/loading"),
  },
  {
    file: "settings/team/new/loading.tsx",
    test: under("/settings/team/new"),
    load: () => import("@/app/settings/team/new/loading"),
  },
  {
    file: "settings/team/invite/[token]/loading.tsx",
    test: under("/settings/team/invite"),
    load: () => import("@/app/settings/team/invite/[token]/loading"),
  },
  {
    file: "settings/team/[teamId]/loading.tsx",
    test: (pathname) => /^\/settings\/team\/[^/]+/.test(pathname),
    load: () => import("@/app/settings/team/[teamId]/loading"),
  },
  {
    file: "settings/team/loading.tsx",
    test: exact("/settings/team"),
    load: () => import("@/app/settings/team/loading"),
  },
  {
    file: "settings/webhooks/[id]/loading.tsx",
    test: (pathname) => /^\/settings\/webhooks\/[^/]+/.test(pathname),
    load: () => import("@/app/settings/webhooks/[id]/loading"),
  },
  {
    file: "settings/webhooks/loading.tsx",
    test: exact("/settings/webhooks"),
    load: () => import("@/app/settings/webhooks/loading"),
  },
  {
    file: "settings/loading.tsx",
    test: under("/settings"),
    load: () => import("@/app/settings/loading"),
  },
  {
    file: "shortcuts/loading.tsx",
    test: under("/shortcuts"),
    load: () => import("@/app/shortcuts/loading"),
  },
  {
    file: "sign-in/loading.tsx",
    test: under("/sign-in"),
    load: () => import("@/app/sign-in/loading"),
  },
  {
    file: "invite/[token]/loading.tsx",
    test: under("/invite"),
    load: () => import("@/app/invite/[token]/loading"),
  },
  {
    file: "docs/developers/loading.tsx",
    test: under("/docs/developers"),
    load: () => import("@/app/docs/developers/loading"),
  },
  {
    file: "docs/loading.tsx",
    test: under("/docs"),
    load: () => import("@/app/docs/loading"),
  },
  {
    file: "api-docs/loading.tsx",
    test: under("/api-docs"),
    load: () => import("@/app/api-docs/loading"),
  },
  {
    file: "about/loading.tsx",
    test: under("/about"),
    load: () => import("@/app/about/loading"),
  },
  {
    file: "features/loading.tsx",
    test: under("/features"),
    load: () => import("@/app/features/loading"),
  },
  {
    file: "how/loading.tsx",
    test: under("/how"),
    load: () => import("@/app/how/loading"),
  },
  {
    file: "pricing/loading.tsx",
    test: under("/pricing"),
    load: () => import("@/app/pricing/loading"),
  },
  {
    file: "integrations/loading.tsx",
    test: under("/integrations"),
    load: () => import("@/app/integrations/loading"),
  },
  {
    file: "resources/loading.tsx",
    test: under("/resources"),
    load: () => import("@/app/resources/loading"),
  },
  {
    file: "contact/loading.tsx",
    test: under("/contact"),
    load: () => import("@/app/contact/loading"),
  },
  {
    file: "support/loading.tsx",
    test: under("/support"),
    load: () => import("@/app/support/loading"),
  },
  {
    file: "changelog/loading.tsx",
    test: under("/changelog"),
    load: () => import("@/app/changelog/loading"),
  },
  {
    file: "colophon/loading.tsx",
    test: under("/colophon"),
    load: () => import("@/app/colophon/loading"),
  },
  {
    file: "security/loading.tsx",
    test: under("/security"),
    load: () => import("@/app/security/loading"),
  },
  {
    file: "privacy/loading.tsx",
    test: under("/privacy"),
    load: () => import("@/app/privacy/loading"),
  },
  {
    file: "terms/loading.tsx",
    test: under("/terms"),
    load: () => import("@/app/terms/loading"),
  },
  {
    file: "loading.tsx",
    test: exact("/"),
    load: () => import("@/app/loading"),
  },
];

export function findRouteSkeleton(pathname: string): RouteSkeletonEntry | null {
  return ROUTE_SKELETONS.find((entry) => entry.test(pathname)) ?? null;
}
