import { describe, it, expect } from "vitest";
import { formatShortMoney } from "@/lib/format-money";

describe("formatShortMoney", () => {
  it("renders sub-thousand values as integer dollars with no suffix", () => {
    expect(formatShortMoney(0)).toBe("$0");
    expect(formatShortMoney(1)).toBe("$1");
    expect(formatShortMoney(100)).toBe("$100");
    expect(formatShortMoney(999)).toBe("$999");
    expect(formatShortMoney(99.4)).toBe("$99");
    expect(formatShortMoney(99.6)).toBe("$100");
  });

  it("strips trailing zeros so round values read naturally", () => {
    expect(formatShortMoney(1_000)).toBe("$1K");
    expect(formatShortMoney(1_000_000)).toBe("$1M");
    expect(formatShortMoney(1_000_000_000)).toBe("$1B");
    expect(formatShortMoney(1_000_000_000_000)).toBe("$1T");
  });

  it("keeps two decimals for [1, 10) so 1.01B does not flatten to 1.0B", () => {
    expect(formatShortMoney(1_010_000_000)).toBe("$1.01B");
    expect(formatShortMoney(1_230_000_000)).toBe("$1.23B");
    expect(formatShortMoney(9_990_000_000)).toBe("$9.99B");
  });

  it("keeps one decimal for [10, 100) and drops to integer at [100, 1000)", () => {
    expect(formatShortMoney(10_500_000)).toBe("$10.5M");
    expect(formatShortMoney(99_500_000)).toBe("$99.5M");
    expect(formatShortMoney(100_000_000)).toBe("$100M");
    expect(formatShortMoney(999_000_000)).toBe("$999M");
  });

  it("promotes to the next tier when rounding overflows three digits", () => {
    expect(formatShortMoney(999_500_000)).toBe("$1B");
    expect(formatShortMoney(999_500)).toBe("$1M");
    expect(formatShortMoney(999.9)).toBe("$1K");
  });

  it("handles negative values with the sign in front of the dollar", () => {
    expect(formatShortMoney(-1_010_000_000)).toBe("-$1.01B");
    expect(formatShortMoney(-500)).toBe("-$500");
    expect(formatShortMoney(-1_000_000)).toBe("-$1M");
  });

  it("treats non-finite inputs as $0 so a NaN never breaks the UI", () => {
    expect(formatShortMoney(NaN)).toBe("$0");
    expect(formatShortMoney(Infinity)).toBe("$0");
    expect(formatShortMoney(-Infinity)).toBe("$0");
  });

  it("never produces four leading digits at any realistic deal size", () => {
    for (let exp = 0; exp <= 12; exp++) {
      for (const multiplier of [1, 3, 7, 9.5, 9.95, 9.999]) {
        const n = multiplier * 10 ** exp;
        const out = formatShortMoney(n);
        const numericPrefix = out.replace(/^[-]?\$/, "").replace(/[KMBT]$/, "");
        const prefix = parseFloat(numericPrefix);
        expect(prefix, `formatShortMoney(${n}) = "${out}"`).toBeLessThan(1000);
      }
    }
  });
});
