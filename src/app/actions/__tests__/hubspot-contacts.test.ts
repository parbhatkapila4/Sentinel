import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) =>
    v.startsWith("ENC:") ? v.slice(4) : v
  ),
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
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn().mockResolvedValue("user-1"),
}));
vi.mock("@/lib/hubspot-auth", () => ({
  getHubSpotAccessToken: vi.fn().mockResolvedValue("mocked-access-token"),
}));
vi.mock("@/lib/hubspot", () => ({
  fetchHubSpotContacts: vi.fn(),
  fetchHubSpotDeals: vi.fn(),
  validateHubSpotCredentials: vi.fn(),
  mapHubSpotDealToDeal: vi.fn(),
}));
vi.mock("@/lib/integration-flow", () => ({
  runIntegrationConnect: vi.fn(),
}));
vi.mock("@/lib/post-crm-sync-slack", () => ({
  notifySlackAfterCrmSync: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { syncHubSpotContactsForUser } from "@/app/actions/hubspot";
import { fetchHubSpotContacts } from "@/lib/hubspot";
import { logWarn } from "@/lib/logger";

const mockedFetchContacts = vi.mocked(fetchHubSpotContacts);
const mockedLogWarn = vi.mocked(logWarn);

const USER_ID = "user-1";

interface HubSpotContactFixture {
  id: string;
  email: string | null;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
}

function hsContact(opts: HubSpotContactFixture) {
  return {
    id: opts.id,
    properties: {
      firstname: opts.firstname ?? null,
      lastname: opts.lastname ?? null,
      email: opts.email ?? null,
      phone: opts.phone ?? null,
      company: opts.company ?? null,
    },
  } as unknown as Awaited<ReturnType<typeof fetchHubSpotContacts>>[number];
}

function integrationRow() {
  return {
    id: "hs-int-1",
    userId: USER_ID,
    apiKey: null,
    authMethod: "oauth",
    accessToken: "ENC:fake-access",
    refreshToken: "ENC:fake-refresh",
    tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    scopes: null,
    portalId: "12345",
    isActive: true,
    syncEnabled: true,
    lastSyncAt: null,
    lastSyncStatus: null,
    syncErrors: null,
    totalSynced: 0,
    lastContactsSyncedAt: null,
    totalContactsSynced: 0,
    rotatedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    userId: USER_ID,
    email: overrides.email,
    firstName: null,
    lastName: null,
    fullName: null,
    phone: null,
    companyName: null,
    source: overrides.source ?? "salesforce",
    externalId: overrides.externalId ?? "external-existing",
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

beforeEach(() => {
  resetPrismaMock();
  mockedFetchContacts.mockReset();
  mockedLogWarn.mockReset();
  prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
    integrationRow() as never
  );
  prismaMock.hubSpotIntegration.update.mockResolvedValue({} as never);
});

describe("syncHubSpotContactsForUser — contact resolution", () => {
  it("new contact (no email row, no provider-key row) → CREATE", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-1", email: "alice@new.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create.mockResolvedValue({} as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();

    const createArg = prismaMock.contact.create.mock.calls[0]?.[0]?.data;
    expect(createArg).toMatchObject({
      userId: USER_ID,
      email: "alice@new.com",
      source: "hubspot",
      externalId: "hs-1",
    });
  });

  it("email row exists, no provider-key row → UPDATE by email-row id (most-recent-wins takeover)", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-2", email: "bob@takeover.com" }),
    ]);
    const sfRow = existingContact({
      id: "contact-sf-bob",
      email: "bob@takeover.com",
      source: "salesforce",
      externalId: "sf-bob-123",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(sfRow as never)
      .mockResolvedValueOnce(null);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-sf-bob" });
    expect(updateArg?.data).toMatchObject({
      source: "hubspot",
      externalId: "hs-2",
      email: "bob@takeover.com",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("email row AND a DIFFERENT provider-key row → transaction deletes stale, updates email row", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-3", email: "carol-new@acme.com" }),
    ]);
    const emailRow = existingContact({
      id: "contact-at-new-email",
      email: "carol-new@acme.com",
      source: "salesforce",
      externalId: "sf-carol-99",
    });
    const staleHubspotRow = existingContact({
      id: "contact-stale-hubspot",
      email: "carol-old@acme.com",
      source: "hubspot",
      externalId: "hs-3",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(emailRow as never)
      .mockResolvedValueOnce(staleHubspotRow as never);
    prismaMock.$transaction.mockResolvedValue([] as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.contact.delete).toHaveBeenCalledWith({
      where: { id: "contact-stale-hubspot" },
    });
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-at-new-email" });
    expect(updateArg?.data).toMatchObject({
      source: "hubspot",
      externalId: "hs-3",
      email: "carol-new@acme.com",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
  });

  it("no email row but provider-key row exists (email changed in HubSpot) → UPDATE provider-key row in place", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-4", email: "dave-new@acme.com" }),
    ]);
    const providerKeyRow = existingContact({
      id: "contact-dave-hs",
      email: "dave-old@acme.com",
      source: "hubspot",
      externalId: "hs-4",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(providerKeyRow as never);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-dave-hs" });
    expect(updateArg?.data).toMatchObject({
      email: "dave-new@acme.com",
      source: "hubspot",
      externalId: "hs-4",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("contact with null email is skipped, no DB write", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-5", email: null }),
      hsContact({ id: "hs-6", email: "" }),
    ]);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(0);
    expect(result.skipped).toBe(2);
    expect(result.errors).toEqual([]);
    expect(prismaMock.contact.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
    expect(prismaMock.contact.update).not.toHaveBeenCalled();
  });

  it("REGRESSION: incoming email already exists under a DIFFERENT externalId → resolves via email branch, NO throw, NO insert", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-NEW-external-id", email: "bh@hubspot.com" }),
    ]);
    const existingRow = existingContact({
      id: "contact-bh-existing",
      email: "bh@hubspot.com",
      source: "hubspot",
      externalId: "hs-OLD-external-id",
    });
    prismaMock.contact.findUnique
      .mockResolvedValueOnce(existingRow as never)
      .mockResolvedValueOnce(null);
    prismaMock.contact.update.mockResolvedValue({} as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);
    const upsertWarnings = mockedLogWarn.mock.calls.filter(
      ([msg]) => typeof msg === "string" && msg.includes("upsert failed")
    );
    expect(upsertWarnings).toHaveLength(0);

    const updateArg = prismaMock.contact.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "contact-bh-existing" });
    expect(updateArg?.data).toMatchObject({
      externalId: "hs-NEW-external-id",
    });
    expect(prismaMock.contact.create).not.toHaveBeenCalled();
  });

  it("unexpected DB error during write → errors++, logWarn called, sync continues to next contact", async () => {
    mockedFetchContacts.mockResolvedValue([
      hsContact({ id: "hs-bad", email: "bad@example.com" }),
      hsContact({ id: "hs-good", email: "good@example.com" }),
    ]);
    prismaMock.contact.findUnique.mockResolvedValue(null);
    prismaMock.contact.create
      .mockRejectedValueOnce(new Error("DB connection reset"))
      .mockResolvedValueOnce({} as never);

    const result = await syncHubSpotContactsForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("hs-bad");
    expect(result.errors[0]).toContain("DB connection reset");
    expect(prismaMock.contact.create).toHaveBeenCalledTimes(2);
    const warnCall = mockedLogWarn.mock.calls.find(
      ([msg]) => typeof msg === "string" && msg.includes("upsert failed")
    );
    expect(warnCall).toBeDefined();
    expect(warnCall?.[1]).toMatchObject({
      userId: USER_ID,
      externalId: "hs-bad",
      email: "bad@example.com",
    });
  });
});
