import { describe, it, expect } from "vitest";
import {
  CANONICAL_STAGES,
  STAGES,
  isCanonicalStage,
  normalizeStage,
} from "@/lib/config";

describe("canonical stage contract", () => {
  it("exposes exactly six canonical stages", () => {
    expect(CANONICAL_STAGES).toHaveLength(6);
    expect(new Set(CANONICAL_STAGES)).toEqual(
      new Set([
        STAGES.DISCOVER,
        STAGES.QUALIFY,
        STAGES.PROPOSAL,
        STAGES.NEGOTIATION,
        STAGES.CLOSED_WON,
        STAGES.CLOSED_LOST,
      ])
    );
  });

  it("rejects title-cased values from isCanonicalStage", () => {
    expect(isCanonicalStage("Discovery")).toBe(false);
    expect(isCanonicalStage("Closed Won")).toBe(false);
    expect(isCanonicalStage("NEGOTIATION")).toBe(false);
  });

  it("accepts only canonical lowercase values from isCanonicalStage", () => {
    for (const s of CANONICAL_STAGES) {
      expect(isCanonicalStage(s)).toBe(true);
    }
  });

  it("normalizes common title-cased inputs to canonical stages", () => {
    expect(normalizeStage("Discovery")).toBe(STAGES.DISCOVER);
    expect(normalizeStage("Qualification")).toBe(STAGES.QUALIFY);
    expect(normalizeStage("Closed Won")).toBe(STAGES.CLOSED_WON);
    expect(normalizeStage("Closed Lost")).toBe(STAGES.CLOSED_LOST);
    expect(normalizeStage("  negotiation  ")).toBe(STAGES.NEGOTIATION);
  });

  it("returns null for inputs we cannot safely map", () => {
    expect(normalizeStage("custom-stage")).toBe(null);
    expect(normalizeStage("pipeline")).toBe(null);
    expect(normalizeStage(undefined)).toBe(null);
    expect(normalizeStage(null)).toBe(null);
    expect(normalizeStage(42)).toBe(null);
    expect(normalizeStage("")).toBe(null);
  });
});
