import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import { resetAuthMock, TEST_USER_ID } from "@/test/mocks/auth";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn().mockResolvedValue("test-user-id-cuid"),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/salesforce", () => ({
  validateSalesforceCredentials: vi.fn(),
  fetchSalesforceOpportunities: vi.fn(),
  fetchSalesforceContacts: vi.fn(),
  mapSalesforceOpportunityToDeal: vi.fn(),
}));
vi.mock("@/lib/integration-flow", () => ({
  runIntegrationConnect: vi.fn(),
}));
vi.mock("@/lib/post-crm-sync-slack", () => ({
  notifySlackAfterCrmSync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => v),
  decryptIntegrationSecret: vi.fn((v: string) => v),
}));
vi.mock("@/lib/metrics", () => ({
  incrementMetric: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

import { syncSalesforceContactsForUser } from "@/app/actions/salesforce";
import { fetchSalesforceContacts } from "@/lib/salesforce";
import type { SalesforceContact } from "@/lib/salesforce";
import { logWarn } from "@/lib/logger";

const mockedFetchContacts = vi.mocked(fetchSalesforceContacts);
const mockedLogWarn = vi.mocked(logWarn);

const TEST_INTEGRATION = {
  id: "sf-int-1",
  userId: TEST_USER_ID,
  consumerKey: "ck",
  consumerSecret: "cs",
  accessToken: "at",
  accessTokenExpiresAt: new Date("2030-01-01"),
  instanceUrl: "https://test.salesforce.com",
  isActive: true,
  syncEnabled: true,
  lastSyncAt: null,
  lastSyncStatus: null,
  syncErrors: null,
  totalSynced: 0,
  lastContactsSyncedAt: null,
  totalContactsSynced: 0,
  rotatedAt: null,
  createdAt: new Date("2026-05-14"),
  updatedAt: new Date("2026-05-14"),
};

function makeContact(overrides: Partial<SalesforceContact> = {}): SalesforceContact {
  return {
    Id: "contact-id-1",
    Name: "Sarah Smith",
    FirstName: "Sarah",
    LastName: "Smith",
    Email: "sarah@acme.com",
    Phone: "555-0100",
    Account: { Name: "Acme Co" },
    ...overrides,
  };
}

function existingContact(overrides: {
  id: string;
  email: string;
  source?: string;
  externalId?: string;
}) {
  return {
    id: overrides.id,
    userId: TEST_USER_ID,
    email: overrides.email,
    firstName: null,
    lastName: null,
    fullName: null,
    phone: null,
    companyName: null,
    source: overrides.source ?? "hubspot",
    externalId: overrides.externalId ?? "external-existing",
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
  mockedFetchContacts.mockReset();
  mockedLogWarn.mockReset();
  prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
    TEST_INTEGRATION as never
  );
  prismaMock.salesforceIntegration.update.mockResolvedValue(
    TEST_INTEGRATION as never
  );
});

describe("syncSalesforceContactsForUser - contact resolution", () => {
  it("new contact (no email row, no provider-key row) → CREATE", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-1", Email: "alice@new.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();

    const createArg = prismaMock.contact.create.mock.calls[0]?.[0]?.data;
    expect(createArg).toMatchObject({
      userId: TEST_USER_ID,
      email: "alice@new.com",
      source: "salesforce",
      externalId: "sf-1",
    });
  });

  it("email row exists, no provider-key row → UPDATE by email-row id (most-recent-wins takeover)", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-2", Email: "bob@takeover.com" }),
    ]);
    const hsRow = existingContact({
      id: "contact-hs-bob",
      email: "bob@takeover.com",
      source: "hubspot",
      externalId: "hs-bob-123",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(hsRow as never)
      .mockResolvedValueOnce(null);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-hs-bob" });
    expect(updateArg?.data).toMatchObject({
      source: "salesforce",
      externalId: "sf-2",
      email: "bob@takeover.com",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("email row AND a DIFFERENT provider-key row → transaction deletes stale, updates email row", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-3", Email: "carol-new@acme.com" }),
    ]);
    const emailRow = existingContact({
      id: "contact-at-new-email",
      email: "carol-new@acme.com",
      source: "hubspot",
      externalId: "hs-carol-99",
    });
    const staleSalesforceRow = existingContact({
      id: "contact-stale-salesforce",
      email: "carol-old@acme.com",
      source: "salesforce",
      externalId: "sf-3",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(emailRow as never)
      .mockResolvedValueOnce(staleSalesforceRow as never);
    prismaMock.$transaction.mockResolvedValue([] as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.delete).toHaveBeenCalledWith({
      where: { id: "contact-stale-salesforce" },
    });
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-at-new-email" });
    expect(updateArg?.data).toMatchObject({
      source: "salesforce",
      externalId: "sf-3",
      email: "carol-new@acme.com",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
  });

  it("no email row but provider-key row exists (email changed in Salesforce) → UPDATE provider-key row in place", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-4", Email: "dave-new@acme.com" }),
    ]);
    const providerKeyRow = existingContact({
      id: "contact-dave-sf",
      email: "dave-old@acme.com",
      source: "salesforce",
      externalId: "sf-4",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(providerKeyRow as never);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-dave-sf" });
    expect(updateArg?.data).toMatchObject({
      email: "dave-new@acme.com",
      source: "salesforce",
      externalId: "sf-4",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("skips contacts whose email normalizes to null without erroring", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-valid", Email: "valid@example.com" }),
      makeContact({ Id: "sf-empty", Email: "   " }),
      makeContact({ Id: "sf-null", Email: null as unknown as string }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.skipped).toBe(2);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.findUnique).toHaveBeenCalledTimes(2);
    expect(prismaMock.contact.create).toHaveBeenCalledTimes(1);
  });

  it("REGRESSION: incoming email already exists under a DIFFERENT externalId → resolves via email branch, NO throw, NO insert", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-NEW-external-id", Email: "bh@example.com" }),
    ]);
    const existingRow = existingContact({
      id: "contact-bh-existing",
      email: "bh@example.com",
      source: "salesforce",
      externalId: "sf-OLD-external-id",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(existingRow as never)
      .mockResolvedValueOnce(null);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    const upsertWarnings = mockedLogWarn.mock.calls.filter(
      ([msg]) => typeof msg === "string" && msg.includes("upsert failed")
    );
    expect(upsertWarnings).toHaveLength(0);

    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-bh-existing" });
    expect(updateArg?.data).toMatchObject({
      externalId: "sf-NEW-external-id",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
  });

  it("unexpected DB error during write → errors.push, logWarn called, sync continues to next contact", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-bad", Email: "bad@example.com" }),
      makeContact({ Id: "sf-good", Email: "good@example.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create
      .mockRejectedValueOnce(new Error("DB connection reset"))
      .mockResolvedValueOnce({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("sf-bad");
    expect(result.errors[0]).toContain("DB connection reset");
    expect(prismaMock.contact.create).toHaveBeenCalledTimes(2);
    const warnCall = mockedLogWarn.mock.calls.find(
      ([msg]) => typeof msg === "string" && msg.includes("upsert failed")
    );
    expect(warnCall).toBeDefined();
    expect(warnCall?.[1]).toMatchObject({
      userId: TEST_USER_ID,
      externalId: "sf-bad",
      email: "bad@example.com",
    });
  });
});

describe("syncSalesforceContactsForUser - top-level behaviour", () => {
  it("returns early with a single error when no active integration exists", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(null);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result).toEqual({
      synced: 0,
      skipped: 0,
      errors: ["No active Salesforce integration"],
    });
    expect(mockedFetchContacts).not.toHaveBeenCalled();
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.contact.update).not.toHaveBeenCalled();
  });

  it("when Salesforce returns no contacts, marks the sync complete with zero counts", async () => {
    mockedFetchContacts.mockResolvedValue([]);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result).toEqual({ synced: 0, skipped: 0, errors: [] });
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      data: expect.objectContaining({
        totalContactsSynced: 0,
        lastContactsSyncedAt: expect.any(Date),
      }),
    });
  });

  it("treats a fetcher throw as a top-level sync failure (single error, no DB writes)", async () => {
    mockedFetchContacts.mockRejectedValue(new Error("INVALID_SESSION_ID"));

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual(["INVALID_SESSION_ID"]);
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.contact.update).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.update).not.toHaveBeenCalled();
  });

  it("totalContactsSynced is lifetime-cumulative - adds to the prior value, not replaces it", async () => {
    const integrationWithPriorTotal = {
      ...TEST_INTEGRATION,
      totalContactsSynced: 47,
    };
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      integrationWithPriorTotal as never
    );
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-cum-1", Email: "a@cum.com" }),
      makeContact({ Id: "sf-cum-2", Email: "b@cum.com" }),
      makeContact({ Id: "sf-cum-3", Email: "c@cum.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    const result = await syncSalesforceContactsForUser(TEST_USER_ID);

    expect(result.synced).toBe(3);
    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      data: expect.objectContaining({
        totalContactsSynced: 50,
        lastContactsSyncedAt: expect.any(Date),
      }),
    });
  });
});

describe("syncSalesforceContactsForUser - Salesforce-specific shape", () => {
  it("composes fullName from FirstName+LastName, falling back to Salesforce's computed Name field", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({
        Id: "sf-name-1",
        FirstName: null,
        LastName: null,
        Name: "Dr. Eleanor Vance",
        Email: "ev@example.com",
      }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    await syncSalesforceContactsForUser(TEST_USER_ID);

    const createArg = prismaMock.contact.create.mock.calls[0]?.[0]?.data;
    expect(createArg).toMatchObject({
      firstName: null,
      lastName: null,
      fullName: "Dr. Eleanor Vance",
    });
  });

  it("normalizes email casing on lookup keys (lowercased before findUnique)", async () => {
    mockedFetchContacts.mockResolvedValue([
      makeContact({ Id: "sf-case-1", Email: "ALICE@Acme.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    await syncSalesforceContactsForUser(TEST_USER_ID);

    const emailLookup = prismaMock.contact.findUnique.mock.calls.find((c) =>
      "userId_email" in (c[0]?.where ?? {})
    );
    expect(emailLookup?.[0]?.where).toEqual({
      userId_email: { userId: TEST_USER_ID, email: "alice@acme.com" },
    });
  });
});
