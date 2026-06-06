import { describe, expect, it } from "vitest";
import {
  LEGACY_STAGE_ALIASES,
  getCanonicalStageSet,
} from "@/lib/stage-canonicalization";

describe("stage canonicalization policy", () => {
  it("contains legacy title-cased aliases used in migration backfill", () => {
    expect(LEGACY_STAGE_ALIASES).toEqual({
      Discovery: "discover",
      Qualification: "qualify",
      Proposal: "proposal",
      Negotiation: "negotiation",
      "Closed Won": "closed_won",
      "Closed Lost": "closed_lost",
    });
  });

  it("canonical stage set contains all expected runtime stages", () => {
    const canonical = getCanonicalStageSet();
    expect(canonical).toEqual(
      new Set([
        "discover",
        "qualify",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ])
    );
  });
});
