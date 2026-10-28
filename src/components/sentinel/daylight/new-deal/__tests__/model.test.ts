import { describe, expect, it } from "vitest";
import { CANONICAL_STAGES, DEAL_CHANNELS } from "@/lib/config";
import {
  CHANNEL_CHOICES,
  EMPTY_DRAFT,
  MAX_VALUE_MESSAGE,
  STAGE_CHOICES,
  formatDigits,
  readValueInput,
  toFormData,
  validateDraft,
} from "../model";

describe("new deal choices", () => {
  it("offers every stage and channel the server accepts", () => {
    expect(STAGE_CHOICES.map((s) => s.value)).toEqual([...CANONICAL_STAGES]);
    expect(CHANNEL_CHOICES.map((c) => c.value)).toEqual([...DEAL_CHANNELS]);
  });

  it("uses the form's sentence-case wording", () => {
    expect(STAGE_CHOICES.map((s) => `${s.label}: ${s.description}`)).toEqual([
      "Discovery: Initial research and outreach",
      "Qualification: Assessing fit and budget",
      "Proposal: Presenting the solution",
      "Negotiation: Terms and pricing",
      "Closed won: Signed and closed",
      "Closed lost: Did not go ahead",
    ]);
    for (const choice of [...STAGE_CHOICES, ...CHANNEL_CHOICES]) {
      expect(choice.description).not.toMatch(/&| - |\u2014|\u2013/);
    }
  });
});

describe("new deal value field", () => {
  it("formats digits and ignores anything else", () => {
    expect(formatDigits("1250000")).toBe("1,250,000");
    expect(formatDigits("")).toBe("");
    expect(readValueInput("1,250,000")).toEqual({ digits: "1250000" });
    expect(readValueInput("12a")).toBeNull();
    expect(readValueInput("")).toEqual({ digits: "" });
  });

  it("stops at 20 billion", () => {
    expect(readValueInput("20,000,000,000")).toEqual({ digits: "20000000000" });
    expect(readValueInput("20,000,000,001")).toEqual({ error: MAX_VALUE_MESSAGE });
  });
});

describe("new deal submission", () => {
  const ready = { ...EMPTY_DRAFT, name: "Acme", stage: "proposal", value: "100" };

  it("checks the required fields in order", () => {
    expect(validateDraft(EMPTY_DRAFT)).toBe("Please enter a deal name");
    expect(validateDraft({ ...ready, stage: "" })).toBe("Please select a stage");
    expect(validateDraft({ ...ready, value: "0" })).toBe("Please enter a valid deal value");
    expect(validateDraft({ ...ready, value: "20000000001" })).toBe(MAX_VALUE_MESSAGE);
    expect(validateDraft(ready)).toBeNull();
  });

  it("trims the name and leaves out empty optional fields", () => {
    const sent = Object.fromEntries(toFormData({ ...ready, name: "  Acme  " }).entries());
    expect(sent).toEqual({ name: "Acme", stage: "proposal", value: "100", channel: "direct" });
  });
});
