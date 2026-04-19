import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "@/lib/async-pool";

describe("runWithConcurrency", () => {
  it("preserves output order while limiting concurrency", async () => {
    let active = 0;
    let maxActive = 0;

    const outputs = await runWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return n * 10;
    });

    expect(maxActive).toBeLessThanOrEqual(2);
    expect(outputs).toEqual([10, 20, 30, 40, 50]);
  });
});
