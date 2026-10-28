import { afterEach, describe, expect, it, vi } from "vitest";
import { DEV_SIGN_IN_ALLOWANCE_MS } from "../../scripts/check-clock.mjs";

const clerk = vi.hoisted(() => ({ calls: 0, options: undefined as unknown }));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (_handler: unknown, options?: unknown) => {
    clerk.calls += 1;
    clerk.options = options;
    return () => undefined;
  },
  createRouteMatcher: () => () => false,
}));

async function clerkOptionsUnder(nodeEnv: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.resetModules();
  clerk.calls = 0;
  clerk.options = undefined;
  await import("@/proxy");
  expect(clerk.calls).toBe(1);
  return clerk.options;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy: Clerk clock tolerance", () => {
  it("lets the local dev server accept tokens from a clock up to 5 minutes off", async () => {
    expect(await clerkOptionsUnder("development")).toEqual({
      clockSkewInMs: 300_000,
    });
  });

  it("matches the allowance the predev clock check describes", async () => {
    expect(await clerkOptionsUnder("development")).toEqual({
      clockSkewInMs: DEV_SIGN_IN_ALLOWANCE_MS,
    });
  });

  it.each(["production", "test"])(
    "passes Clerk no options under NODE_ENV=%s, so its 5s default stands",
    async (nodeEnv) => {
      expect(await clerkOptionsUnder(nodeEnv)).toBeUndefined();
    }
  );
});
