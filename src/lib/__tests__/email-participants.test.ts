import { describe, it, expect } from "vitest";
import {
  parseEmailAddressList,
  extractGmailParticipants,
} from "@/lib/email-participants";

describe("parseEmailAddressList", () => {
  it("returns a single bare address", () => {
    expect(parseEmailAddressList("alice@example.com")).toEqual([
      "alice@example.com",
    ]);
  });

  it("extracts the angle-bracketed address from a display-name form", () => {
    expect(parseEmailAddressList("Alice Smith <alice@example.com>")).toEqual([
      "alice@example.com",
    ]);
  });

  it("splits a simple comma-separated list", () => {
    expect(parseEmailAddressList("a@x.com, b@y.com")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("does NOT split on commas inside double quotes (the most-likely-to-break case)", () => {
    expect(parseEmailAddressList('"Smith, John" <j@x.com>, k@y.com')).toEqual([
      "j@x.com",
      "k@y.com",
    ]);
  });

  it("tolerates missing/extra whitespace around delimiters", () => {
    expect(parseEmailAddressList("a@x.com,b@y.com,c@z.com")).toEqual([
      "a@x.com",
      "b@y.com",
      "c@z.com",
    ]);
    expect(parseEmailAddressList("a@x.com,   b@y.com  ,carol@z.com")).toEqual([
      "a@x.com",
      "b@y.com",
      "carol@z.com",
    ]);
  });

  it("handles angle-bracket-only entries (no display name)", () => {
    expect(parseEmailAddressList("<alice@x.com>")).toEqual(["alice@x.com"]);
  });

  it("returns [] for empty / undefined input", () => {
    expect(parseEmailAddressList("")).toEqual([]);
    expect(parseEmailAddressList(undefined)).toEqual([]);
  });

  it("strips parenthetical comments and keeps the address", () => {
    expect(parseEmailAddressList("alice@x.com (Alice Smith)")).toEqual([
      "alice@x.com",
    ]);
  });

  it("returns [] for a non-email string (no @, no angle brackets)", () => {
    expect(parseEmailAddressList("Alice Smith")).toEqual([]);
    expect(parseEmailAddressList("not-an-email")).toEqual([]);
  });

  it("ignores RFC 2047 encoded-word display names and extracts the address", () => {
    expect(
      parseEmailAddressList("=?UTF-8?B?QWxpY2U=?= <alice@x.com>")
    ).toEqual(["alice@x.com"]);
  });
});

describe("extractGmailParticipants", () => {
  it("populates from/to/cc/bcc and a deduped+normalized `all` union", () => {
    const result = extractGmailParticipants({
      from: "Alice <ALICE@example.com>",
      to: "bob@example.com, Carol <CAROL@example.com>",
      cc: "  dave@example.com  ",
      bcc: '"Special, Person" <dave@example.com>, eve@example.com',
    });

    expect(result.from).toBe("ALICE@example.com");
    expect(result.to).toEqual(["bob@example.com", "CAROL@example.com"]);
    expect(result.cc).toEqual(["dave@example.com"]);
    expect(result.bcc).toEqual(["dave@example.com", "eve@example.com"]);

    expect(result.all).toEqual([
      "alice@example.com",
      "bob@example.com",
      "carol@example.com",
      "dave@example.com",
      "eve@example.com",
    ]);
  });

  it("handles missing headers gracefully (no Cc, no Bcc on a typical received message)", () => {
    const result = extractGmailParticipants({
      from: "alice@x.com",
      to: "bob@x.com",
    });

    expect(result.from).toBe("alice@x.com");
    expect(result.to).toEqual(["bob@x.com"]);
    expect(result.cc).toEqual([]);
    expect(result.bcc).toEqual([]);
    expect(result.all).toEqual(["alice@x.com", "bob@x.com"]);
  });

  it("returns all-empty for a header set with no parseable addresses", () => {
    const result = extractGmailParticipants({
      from: "Alice Smith",
      to: "",
    });

    expect(result.from).toBeNull();
    expect(result.to).toEqual([]);
    expect(result.all).toEqual([]);
  });
});
