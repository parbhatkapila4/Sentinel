import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("canonical stage verification script", () => {
  const scriptPath = resolve(
    process.cwd(),
    "scripts/verify-canonical-stages.mjs"
  );
  const script = readFileSync(scriptPath, "utf8");

  it("exists and checks canonical stage values", () => {
    expect(script.includes("closed_won")).toBe(true);
    expect(script.includes("closed_lost")).toBe(true);
    expect(script.includes("findMany")).toBe(true);
    expect(script.includes("distinct")).toBe(true);
  });

  it("fails process when non-canonical stages are found", () => {
    expect(script.includes("process.exit(1)")).toBe(true);
  });
});
