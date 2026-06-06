import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const MARKETING_FILES = [
  "src/app/page.tsx",
  "src/app/features/page.tsx",
  "src/app/integrations/page.tsx",
  "src/app/security/page.tsx",
  "src/app/about/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/changelog/page.tsx",
  "src/app/colophon/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/support/page.tsx",
];

const APP_ROOT = resolve(process.cwd(), "src/app");

function routeExists(route: string): boolean {
  const path = route.split("?")[0]!.split("#")[0]!;
  if (!path || path === "/") return existsSync(join(APP_ROOT, "page.tsx"));

  const parts = path.split("/").filter(Boolean);
  const full = join(APP_ROOT, ...parts);
  if (existsSync(join(full, "page.tsx")) || existsSync(join(full, "page.ts"))) {
    return true;
  }
  try {
    if (existsSync(full) && statSync(full).isDirectory()) return true;
  } catch {
  }
  return false;
}

describe("CTA validity", () => {
  for (const rel of MARKETING_FILES) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, "utf8");

    const hrefs = Array.from(
      text.matchAll(/href=["'](\/[a-zA-Z0-9_\-\/]*)["']/g)
    ).map((m) => m[1]);

    describe(rel, () => {
      const unique = Array.from(new Set(hrefs));
      for (const href of unique) {
        it(`CTA href "${href}" resolves to a real route`, () => {
          expect(
            routeExists(href),
            `${rel}: href="${href}" has no matching Next.js route under src/app`
          ).toBe(true);
        });
      }

      it("does not contain a primary CTA button without a handler or link", () => {
        const primaryButtonRe =
          /<button[^>]*className=["'][^"']*\bbtn-p\b[^"']*["'][^>]*>/g;
        const matches = Array.from(text.matchAll(primaryButtonRe));
        for (const match of matches) {
          expect(
            match[0].includes("onClick"),
            `${rel} has primary CTA button without onClick: ${match[0]}`
          ).toBe(true);
        }
      });
    });
  }
});
