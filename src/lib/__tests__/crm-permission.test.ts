import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/metrics", () => ({
  incrementMetric: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

import {
  isParticipantInCrmBook,
  batchCheckCrmBook,
  hasCrmParticipant,
} from "@/lib/crm-permission";
import { incrementMetric } from "@/lib/metrics";
import { logWarn } from "@/lib/logger";

const mockedIncrement = vi.mocked(incrementMetric);
const mockedLogWarn = vi.mocked(logWarn);

const USER_A = "user-a";
const USER_B = "user-b";

function expectMetric(name: string, value: number = 1) {
  expect(mockedIncrement).toHaveBeenCalledWith(name, value);
}

beforeEach(() => {
  resetPrismaMock();
  mockedIncrement.mockReset();
  mockedLogWarn.mockReset();
});

describe("isParticipantInCrmBook", () => {
  it("happy path: returns isInBook=true with contactId and source for an exact match", async () => {
    prismaMock.contact.findUnique.mockResolvedValue({
      id: "c-alice",
      source: "hubspot",
    } as never);

    const result = await isParticipantInCrmBook(USER_A, "alice@example.com");

    expect(result).toEqual({
      isInBook: true,
      contactId: "c-alice",
      source: "hubspot",
    });
    expect(prismaMock.contact.findUnique).toHaveBeenCalledWith({
      where: { userId_email: { userId: USER_A, email: "alice@example.com" } },
      select: { id: true, source: true },
    });
    expectMetric("crm_permission.check.total");
    expectMetric("crm_permission.check.in_book");
  });

  it("normalizes case and whitespace before lookup", async () => {
    prismaMock.contact.findUnique.mockResolvedValue({
      id: "c-alice",
      source: "salesforce",
    } as never);

    const r1 = await isParticipantInCrmBook(USER_A, "ALICE@EXAMPLE.COM");
    const r2 = await isParticipantInCrmBook(USER_A, "  alice@example.com  ");

    expect(r1.isInBook).toBe(true);
    expect(r2.isInBook).toBe(true);
    for (const call of prismaMock.contact.findUnique.mock.calls) {
      expect(call[0].where).toEqual({
        userId_email: { userId: USER_A, email: "alice@example.com" },
      });
    }
  });

  it("miss: returns isInBook=false when no contact row matches", async () => {
    prismaMock.contact.findUnique.mockResolvedValue(null);

    const result = await isParticipantInCrmBook(USER_A, "bob@example.com");

    expect(result).toEqual({ isInBook: false, contactId: null, source: null });
    expectMetric("crm_permission.check.out_of_book");
    expect(mockedIncrement).not.toHaveBeenCalledWith(
      "crm_permission.check.in_book",
      expect.anything()
    );
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""],
    ["whitespace-only", "   "],
  ])("returns false WITHOUT a DB call for %s input", async (_label, input) => {
    const result = await isParticipantInCrmBook(
      USER_A,
      input as string | null | undefined
    );

    expect(result).toEqual({ isInBook: false, contactId: null, source: null });
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
    expectMetric("crm_permission.check.out_of_book");
  });

  it("cross-user isolation: lookup is scoped to the calling userId", async () => {
    prismaMock.contact.findUnique.mockResolvedValue(null);

    const result = await isParticipantInCrmBook(USER_B, "alice@example.com");

    expect(result.isInBook).toBe(false);
    expect(prismaMock.contact.findUnique).toHaveBeenCalledWith({
      where: { userId_email: { userId: USER_B, email: "alice@example.com" } },
      select: { id: true, source: true },
    });
  });

  it("fails closed on DB error: returns false and increments fail_closed metric", async () => {
    prismaMock.contact.findUnique.mockRejectedValue(
      new Error("DB connection lost")
    );

    const result = await isParticipantInCrmBook(USER_A, "alice@example.com");

    expect(result).toEqual({ isInBook: false, contactId: null, source: null });
    expectMetric("crm_permission.check.fail_closed");
    expect(mockedIncrement).not.toHaveBeenCalledWith(
      "crm_permission.check.out_of_book",
      expect.anything()
    );
  });
});

describe("batchCheckCrmBook", () => {
  it("happy path: single findMany returns a complete result map with hits and misses", async () => {
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@example.com", id: "c-alice", source: "hubspot" },
      { email: "bob@example.com", id: "c-bob", source: "salesforce" },
    ] as never);

    const result = await batchCheckCrmBook(USER_A, [
      "alice@example.com",
      "bob@example.com",
      "carol@example.com",
    ]);

    expect(result.size).toBe(3);
    expect(result.get("alice@example.com")).toEqual({
      isInBook: true,
      contactId: "c-alice",
      source: "hubspot",
    });
    expect(result.get("bob@example.com")).toEqual({
      isInBook: true,
      contactId: "c-bob",
      source: "salesforce",
    });
    expect(result.get("carol@example.com")).toEqual({
      isInBook: false,
      contactId: null,
      source: null,
    });
    expect(prismaMock.contact.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
  });

  it("dedupes inputs (case + whitespace + nulls) before the single DB query", async () => {
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@example.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const result = await batchCheckCrmBook(USER_A, [
      "alice@example.com",
      "ALICE@example.com",
      "  alice@example.com ",
      null,
      undefined,
      "",
      "   ",
    ]);

    expect(result.size).toBe(1);
    expect(result.has("alice@example.com")).toBe(true);
    expect(result.get("alice@example.com")?.isInBook).toBe(true);

    expect(prismaMock.contact.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_A,
        email: { in: ["alice@example.com"] },
      },
      select: { email: true, id: true, source: true },
    });
  });

  it("empty/all-null input: returns empty map with NO DB call", async () => {
    const result = await batchCheckCrmBook(USER_A, [null, undefined, "", "   "]);

    expect(result.size).toBe(0);
    expect(prismaMock.contact.findMany).not.toHaveBeenCalled();
  });

  it("fails closed on DB error: every normalized email maps to isInBook=false", async () => {
    prismaMock.contact.findMany.mockRejectedValue(new Error("DB timeout"));

    const result = await batchCheckCrmBook(USER_A, [
      "alice@example.com",
      "bob@example.com",
    ]);

    expect(result.size).toBe(2);
    expect(result.get("alice@example.com")).toEqual({
      isInBook: false,
      contactId: null,
      source: null,
    });
    expect(result.get("bob@example.com")).toEqual({
      isInBook: false,
      contactId: null,
      source: null,
    });
    expectMetric("crm_permission.check.fail_closed", 2);
  });
});

describe("hasCrmParticipant", () => {
  const USER_EMAIL = "me@self.com";

  it("single non-self participant in the CRM book → passed: true with the matched contact id", async () => {
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const result = await hasCrmParticipant(USER_A, USER_EMAIL, ["alice@crm.com"]);

    expect(result.passed).toBe(true);
    expect(result.matchedContactIds).toEqual(["c-alice"]);
    expectMetric("crm_permission.email_filter.passed");
  });

  it("single non-self participant NOT in the CRM book → passed: false, reason no_crm_contact_match", async () => {
    prismaMock.contact.findMany.mockResolvedValue([] as never);

    const result = await hasCrmParticipant(USER_A, USER_EMAIL, ["stranger@elsewhere.com"]);

    expect(result.passed).toBe(false);
    expect(result.reason).toBe("no_crm_contact_match");
    expect(result.matchedContactIds).toEqual([]);
    expectMetric("crm_permission.email_filter.dropped");
  });

  it("only the user themselves on the message → no_external_participants, no batch lookup", async () => {
    const result = await hasCrmParticipant(USER_A, USER_EMAIL, [USER_EMAIL]);

    expect(result.passed).toBe(false);
    expect(result.reason).toBe("no_external_participants");
    expect(prismaMock.contact.findMany).not.toHaveBeenCalled();
    expectMetric("crm_permission.email_filter.dropped");
  });

  it("case-insensitive self exclusion: user email in upper-case is still excluded", async () => {
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const result = await hasCrmParticipant(USER_A, "USER@SELF.com", [
      "user@self.com",
      "alice@crm.com",
    ]);

    expect(result.passed).toBe(true);
    expect(result.matchedContactIds).toEqual(["c-alice"]);
    expect(prismaMock.contact.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_A,
        email: { in: ["alice@crm.com"] },
      },
      select: { email: true, id: true, source: true },
    });
  });

  it("any-match rule: one of N participants in the book is enough", async () => {
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "salesforce" },
    ] as never);

    const result = await hasCrmParticipant(USER_A, USER_EMAIL, [
      "stranger1@unknown.com",
      "alice@crm.com",
      "stranger2@unknown.com",
    ]);

    expect(result.passed).toBe(true);
    expect(result.matchedContactIds).toEqual(["c-alice"]);
  });

  it("multi-participant with NO CRM matches → passed: false", async () => {
    prismaMock.contact.findMany.mockResolvedValue([] as never);

    const result = await hasCrmParticipant(USER_A, USER_EMAIL, [
      "stranger1@unknown.com",
      "stranger2@unknown.com",
      "stranger3@unknown.com",
    ]);

    expect(result.passed).toBe(false);
    expect(result.reason).toBe("no_crm_contact_match");
    expect(result.matchedContactIds).toEqual([]);
  });

  it("invalid userEmail (null after normalize) → fails closed without touching the DB", async () => {
    const result = await hasCrmParticipant(USER_A, "   ", [
      "alice@crm.com",
    ]);

    expect(result.passed).toBe(false);
    expect(result.reason).toBe("user email invalid");
    expect(prismaMock.contact.findMany).not.toHaveBeenCalled();
    expectMetric("crm_permission.email_filter.fail_closed");
  });

  it("DB error during batch lookup → fail-closed signal fires, NO PII in log calls", async () => {
    prismaMock.contact.findMany.mockRejectedValue(
      new Error("DB timeout while checking permission")
    );

    const result = await hasCrmParticipant(USER_A, USER_EMAIL, [
      "alice@crm.com",
      "bob@crm.com",
    ]);

    expect(result.passed).toBe(false);
    expectMetric("crm_permission.check.fail_closed", 2);

    for (const [, context] of mockedLogWarn.mock.calls) {
      const serialized = JSON.stringify(context ?? {});
      expect(serialized).not.toContain("alice@crm.com");
      expect(serialized).not.toContain("bob@crm.com");
    }
  });

  it("empty participantEmails array → no_external_participants without a DB call", async () => {
    const result = await hasCrmParticipant(USER_A, USER_EMAIL, []);

    expect(result.passed).toBe(false);
    expect(result.reason).toBe("no_external_participants");
    expect(prismaMock.contact.findMany).not.toHaveBeenCalled();
  });
});
