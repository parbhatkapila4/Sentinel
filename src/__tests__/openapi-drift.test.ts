import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { openApiSpec } from "@/lib/openapi";

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
] as const;

function routeFileFor(specPath: string): string {
  const segments = specPath
    .replace(/^\//, "")
    .split("/")
    .map((s) => s.replace(/^\{(.+)\}$/, "[$1]"));
  return `src/app/${segments.join("/")}/route.ts`;
}

type Operation = Record<string, unknown>;
const paths = openApiSpec.paths as Record<string, Record<string, Operation>>;

const declared: Array<{ path: string; method: string; file: string }> = [];
for (const [path, item] of Object.entries(paths)) {
  for (const method of HTTP_METHODS) {
    if (item[method]) {
      declared.push({ path, method, file: routeFileFor(path) });
    }
  }
}

describe("openapi spec matches real routes", () => {
  it("declares at least one operation", () => {
    expect(declared.length).toBeGreaterThan(0);
  });

  for (const { path, method, file } of declared) {
    describe(`${method.toUpperCase()} ${path}`, () => {
      it(`has a route file at ${file}`, () => {
        expect(
          existsSync(resolve(process.cwd(), file)),
          `openApiSpec documents ${method.toUpperCase()} ${path} but ${file} does not exist. ` +
          "/api-docs has Try-it-out enabled, so this renders as a live endpoint that 404s. " +
          "Either build the route or remove it from the spec.",
        ).toBe(true);
      });

      it(`that route exports ${method.toUpperCase()}`, () => {
        const abs = resolve(process.cwd(), file);
        if (!existsSync(abs)) return; // reported by the test above
        const src = readFileSync(abs, "utf8");

        const exported = new RegExp(
          `export\\s+(?:async\\s+function|const|function)\\s+${method.toUpperCase()}\\b`,
        );
        expect(
          exported.test(src),
          `${file} exists but does not export ${method.toUpperCase()}, which ` +
          `openApiSpec documents for ${path}. Next returns 405 for an ` +
          "undeclared method, so the documented call cannot succeed.",
        ).toBe(true);
      });
    });
  }
});

describe("openapi spec does not invent auth or limits", () => {
  const description = openApiSpec.info.description;

  it("does not advertise a Bearer/API token that cannot be issued", () => {
    const negation = /\b(?:no|not|none|without|never|instead of)\b/i;
    const offenders = description
      .split(/\r?\n/)
      .filter(
        (line) =>
          /bearer\s+(?:token|your_api_token)|api[_\s-]?token/i.test(line) &&
          !negation.test(line),
      );

    expect(
      offenders.length,
      "The spec advertises token auth, but authentication is a Clerk session " +
      "cookie and no API token can be issued:\n" +
      offenders.map((l) => `  > ${l.trim()}`).join("\n"),
    ).toBe(0);
  });

  it("the token check still catches the wording that shipped", () => {
    const shipped = [
      "All API requests require authentication using a Bearer token. Include the token in the Authorization header:",
      "Authorization: Bearer your_api_token",
    ];
    const negation = /\b(?:no|not|none|without|never|instead of)\b/i;
    for (const line of shipped) {
      const flagged =
        /bearer\s+(?:token|your_api_token)|api[_\s-]?token/i.test(line) &&
        !negation.test(line);
      expect(flagged, `Should still flag: "${line}"`).toBe(true);
    }
  });

  it("security schemes describe a mechanism that exists", () => {
    const schemes = Object.values(
      openApiSpec.components.securitySchemes as Record<
        string,
        { type: string; scheme?: string }
      >,
    );
    for (const scheme of schemes) {
      expect(
        scheme.scheme === "bearer",
        "bearerAuth is declared but no bearer credential exists.",
      ).toBe(false);
    }
  });

  it("quotes the real rate limits", () => {
    expect(description).toContain("100 requests/minute");
    expect(description).toContain("20 requests/minute");
    expect(
      /1000 requests/.test(description),
      "1000/min was never a real limit - USER_DEFAULT defaults to 100.",
    ).toBe(false);
  });
});
