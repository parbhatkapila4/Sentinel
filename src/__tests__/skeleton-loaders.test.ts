import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import {
  ROUTE_SKELETONS,
  findRouteSkeleton,
} from "@/components/route-skeletons";

const APP_DIR = resolve(process.cwd(), "src/app");

function walk(dir: string, name: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "api" || entry === "__tests__") continue;
      walk(full, name, found);
    } else if (entry === name) {
      found.push(relative(APP_DIR, full).split(sep).join("/"));
    }
  }
  return found;
}

function routeOf(pageFile: string): string {
  const segments = pageFile.split("/").slice(0, -1);
  if (segments.length === 0) return "/";
  return (
    "/" +
    segments.map((s) => (s.startsWith("[") ? "sample" : s)).join("/")
  );
}

const LOADING_FILES = walk(APP_DIR, "loading.tsx").sort();
const PAGE_FILES = walk(APP_DIR, "page.tsx").sort();

const BANNED_IN_LOADING = [
  "RouteLoader",
  "DashboardLoader",
  "TopProgressBar",
  "animate-spin",
  "Loading...",
  "Loading…",
];

const SKELETON_MARKERS = [
  "sentinel-skel",
  "EditorialSkeleton",
  "SiteSkeleton",
  "DashboardSkeleton",
  "DealsSkeleton",
  "AnalyticsSkeleton",
  "TopDealsSkeleton",
  "ForecastSkeleton",
  "AlertsSkeleton",
  "ReportsSkeleton",
  "AISkeleton",
  "SettingsSkeleton",
  "NotificationsSkeleton",
  "DealDetailSkeleton",
  "NewDealSkeleton",
  "TeamsSkeleton",
  "NewTeamSkeleton",
  "TeamDetailSkeleton",
  "TeamInviteSkeleton",
  "WebhooksSkeleton",
  "WebhookDetailSkeleton",
  "WorkspaceInviteSkeleton",
];

const PAGES_WITHOUT_SKELETON = new Set(["/sso-callback"]);

describe("route loading states are skeletons", () => {
  it("finds the loading files", () => {
    expect(LOADING_FILES.length).toBeGreaterThan(20);
  });

  it.each(LOADING_FILES)("%s renders a skeleton, not a loader", (file) => {
    const source = readFileSync(join(APP_DIR, file), "utf8");
    for (const banned of BANNED_IN_LOADING) {
      expect(source.includes(banned), `${file} contains ${banned}`).toBe(false);
    }
    expect(SKELETON_MARKERS.some((marker) => source.includes(marker))).toBe(
      true
    );
  });

  it("keeps the retired loader components deleted", () => {
    for (const file of [
      "src/components/route-loader.tsx",
      "src/components/top-progress-bar.tsx",
      "src/components/sentinel/DashboardLoader.tsx",
    ]) {
      expect(existsSync(resolve(process.cwd(), file)), file).toBe(false);
    }
  });
});

describe("instant route skeleton registry", () => {
  it("registers every loading file exactly once", () => {
    const registered = ROUTE_SKELETONS.map((entry) => entry.file).sort();
    expect(registered).toEqual(LOADING_FILES);
  });

  it.each(PAGE_FILES)("%s resolves to a skeleton", (pageFile) => {
    const route = routeOf(pageFile);
    if (PAGES_WITHOUT_SKELETON.has(route)) {
      expect(findRouteSkeleton(route)).toBeNull();
      return;
    }
    expect(findRouteSkeleton(route), route).not.toBeNull();
  });

  it("prefers the most specific skeleton", () => {
    expect(findRouteSkeleton("/deals")?.file).toBe("deals/loading.tsx");
    expect(findRouteSkeleton("/deals/new")?.file).toBe("deals/new/loading.tsx");
    expect(findRouteSkeleton("/deals/abc123")?.file).toBe(
      "deals/[id]/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/team")?.file).toBe(
      "settings/team/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/team/new")?.file).toBe(
      "settings/team/new/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/team/invite/tok1")?.file).toBe(
      "settings/team/invite/[token]/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/team/t1")?.file).toBe(
      "settings/team/[teamId]/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/webhooks")?.file).toBe(
      "settings/webhooks/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/webhooks/w1")?.file).toBe(
      "settings/webhooks/[id]/loading.tsx"
    );
    expect(findRouteSkeleton("/settings/notifications")?.file).toBe(
      "settings/loading.tsx"
    );
    expect(findRouteSkeleton("/docs/developers")?.file).toBe(
      "docs/developers/loading.tsx"
    );
    expect(findRouteSkeleton("/")?.file).toBe("loading.tsx");
    expect(findRouteSkeleton("/api/deals/search")).toBeNull();
  });
});
