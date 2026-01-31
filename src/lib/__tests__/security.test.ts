import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeHtml,
  validateEmail,
  validateUrl,
  sanitizeUrl,
  escapeSql,
  validateLength,
  validateAlphanumeric,
  sanitizeForJson,
} from "@/lib/security";

describe("security", () => {
  describe("sanitizeString", () => {
    it("strips null bytes and control chars", () => {
      expect(sanitizeString("a\x00b")).toBe("ab");
    });

    it("strips script tags", () => {
      expect(sanitizeString("hello <script>alert(1)</script> world")).not.toContain("<script>");
    });

    it("trims whitespace", () => {
      expect(sanitizeString("  foo  ")).toBe("foo");
    });

    it("coerces non-string to string", () => {
      expect(sanitizeString(123 as unknown as string)).toBe("123");
    });
  });

  describe("validateEmail", () => {
    it("accepts valid email", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("a@b.co")).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("no-at")).toBe(false);
      expect(validateEmail("@nodomain.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail(123 as unknown as string)).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("accepts http and https", () => {
      expect(validateUrl("https://example.com")).toBe(true);
      expect(validateUrl("http://example.com/path")).toBe(true);
    });

    it("rejects invalid url", () => {
      expect(validateUrl("")).toBe(false);
      expect(validateUrl("not-a-url")).toBe(false);
      expect(validateUrl("ftp://example.com")).toBe(false);
      expect(validateUrl(123 as unknown as string)).toBe(false);
    });
  });

  describe("sanitizeUrl", () => {
    it("returns url for http/https", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    });

    it("returns empty for invalid or non-http(s)", () => {
      expect(sanitizeUrl("ftp://x.com")).toBe("");
      expect(sanitizeUrl("")).toBe("");
    });
  });

  describe("escapeSql", () => {
    it("doubles single quotes", () => {
      expect(escapeSql("O'Brien")).toBe("O''Brien");
    });
  });

  describe("validateLength", () => {
    it("returns input when within maxLength", () => {
      expect(validateLength("hello", 10)).toBe("hello");
    });

    it("truncates to maxLength", () => {
      expect(validateLength("hello world", 5)).toBe("hello");
    });
  });

  describe("validateAlphanumeric", () => {
    it("accepts alphanumeric", () => {
      expect(validateAlphanumeric("abc123")).toBe(true);
    });

    it("rejects when invalid chars", () => {
      expect(validateAlphanumeric("hello world")).toBe(false);
      expect(validateAlphanumeric("a-b")).toBe(false);
    });

    it("accepts allowed extra chars", () => {
      expect(validateAlphanumeric("a-b", "-")).toBe(true);
    });
  });

  describe("sanitizeForJson", () => {
    it("strips control characters", () => {
      expect(sanitizeForJson("a\x00b")).toBe("ab");
    });

    it("returns empty for non-string", () => {
      expect(sanitizeForJson(1 as unknown as string)).toBe("");
    });
  });

  describe("sanitizeHtml", () => {
    it("strips script tags", () => {
      expect(sanitizeHtml("<p>ok</p><script>x</script>")).not.toContain("<script>");
    });

    it("returns empty for non-string", () => {
      expect(sanitizeHtml(1 as unknown as string)).toBe("");
    });
  });
});
