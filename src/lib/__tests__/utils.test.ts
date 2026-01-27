import { describe, it, expect } from "vitest";
import { formatRevenue } from "@/lib/utils";

describe("formatRevenue", () => {
  it("formats 1000 as $1.0K", () => {
    expect(formatRevenue(1000)).toBe("$1.0K");
  });

  it("handles millions correctly", () => {
    expect(formatRevenue(1_000_000)).toBe("$1.0M");
    expect(formatRevenue(2_500_000)).toBe("$2.5M");
    expect(formatRevenue(10_000_000)).toBe("$10M");
  });
});
