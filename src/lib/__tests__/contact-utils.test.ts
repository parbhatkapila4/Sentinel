import { describe, it, expect } from "vitest";
import { normalizeContactEmail } from "@/lib/contact-utils";

describe("normalizeContactEmail", () => {
  it("returns null for null", () => {
    expect(normalizeContactEmail(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(normalizeContactEmail(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(normalizeContactEmail("")).toBeNull();
  });

  it("returns null for whitespace-only input", () => {
    expect(normalizeContactEmail("   ")).toBeNull();
    expect(normalizeContactEmail("\t")).toBeNull();
    expect(normalizeContactEmail(" \n \t ")).toBeNull();
  });

  it("lowercases mixed-case addresses", () => {
    expect(normalizeContactEmail("Sarah@Acme.COM")).toBe("sarah@acme.com");
    expect(normalizeContactEmail("JOHN.DOE@EXAMPLE.IO")).toBe(
      "john.doe@example.io"
    );
  });

  it("passes already-lowercase addresses through unchanged", () => {
    expect(normalizeContactEmail("sarah@acme.com")).toBe("sarah@acme.com");
  });

  it("strips leading and trailing whitespace", () => {
    expect(normalizeContactEmail("  sarah@acme.com  ")).toBe("sarah@acme.com");
    expect(normalizeContactEmail("\tsarah@acme.com\n")).toBe("sarah@acme.com");
  });

  it("combines trimming and lowercasing in one pass", () => {
    expect(normalizeContactEmail("  Sarah@Acme.COM  ")).toBe("sarah@acme.com");
  });

  it("preserves embedded characters that are not case-affected", () => {
    expect(normalizeContactEmail("Sarah+Sales@Acme.com")).toBe(
      "sarah+sales@acme.com"
    );
    expect(normalizeContactEmail("first.last@sub.domain.co")).toBe(
      "first.last@sub.domain.co"
    );
  });
});
