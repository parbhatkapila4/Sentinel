import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) =>
    v.startsWith("ENC:") ? v.slice(4) : v
  ),
}));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn().mockResolvedValue("user-1"),
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

import { syncCalendarForUser } from "@/app/actions/calendar";
import { incrementMetric } from "@/lib/metrics";

const mockedIncrement = vi.mocked(incrementMetric);

const USER_ID = "user-1";
const USER_EMAIL = "me@self.com";

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.GOOGLE_OAUTH_CLIENT_ID;
const ORIG_CLIENT_SECRET = env.GOOGLE_OAUTH_CLIENT_SECRET;

function makeIntegration(overrides: { expiryDate?: Date; email?: string | null } = {}) {
  return {
    id: "cal-int-1",
    userId: USER_ID,
    accessToken: "ENC:plaintext-access",
    refreshToken: "ENC:plaintext-refresh",
    expiryDate: overrides.expiryDate ?? new Date(Date.now() + 3600_000),
    email: overrides.email === undefined ? USER_EMAIL : overrides.email,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function mockJsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {}
) {
  const ok = init.ok ?? true;
  const status = init.status ?? (ok ? 200 : 400);
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

interface ListEventInput {
  id: string;
  summary?: string;
  startTime?: Date;
  endTime?: Date;
  organizer?: string;
  attendees?: string[];
  recurringEventId?: string;
}

function listResponse(events: ListEventInput[], nextPageToken?: string) {
  return mockJsonResponse({
    items: events.map((e) => ({
      id: e.id,
      summary: e.summary ?? "Meeting",
      start: { dateTime: (e.startTime ?? new Date()).toISOString() },
      end: { dateTime: (e.endTime ?? new Date(Date.now() + 3600_000)).toISOString() },
      organizer: e.organizer ? { email: e.organizer } : undefined,
      attendees: e.attendees?.map((email) => ({ email })),
      status: "confirmed",
      recurringEventId: e.recurringEventId,
    })),
    nextPageToken,
  });
}

beforeEach(() => {
  resetPrismaMock();
  mockedIncrement.mockReset();
  env.GOOGLE_OAUTH_CLIENT_ID = "client-id";
  env.GOOGLE_OAUTH_CLIENT_SECRET = "client-secret";
});

afterEach(() => {
  vi.unstubAllGlobals();
  env.GOOGLE_OAUTH_CLIENT_ID = ORIG_CLIENT_ID;
  env.GOOGLE_OAUTH_CLIENT_SECRET = ORIG_CLIENT_SECRET;
});

describe("syncCalendarForUser", () => {
  it("returns early with an error when no integration row exists for the user", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(null);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(0);
    expect(result.errors[0]).toContain("No active Calendar integration");
    expect(prismaMock.calendarEvent.upsert).not.toHaveBeenCalled();
  });

  it("drops events with no attendees besides self (dropped_no_attendees metric)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "evt-1",
          organizer: USER_EMAIL,
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.skipped_no_attendees).toBe(1);
    expect(result.synced).toBe(0);
    expect(prismaMock.calendarEvent.upsert).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.calendar_filter.dropped_no_attendees",
      1
    );
  });

  it("drops events whose attendees are all non-CRM (dropped_no_crm_match metric)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "evt-2",
          organizer: USER_EMAIL,
          attendees: ["stranger1@unknown.com", "stranger2@unknown.com"],
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.skipped_no_crm_match).toBe(1);
    expect(result.synced).toBe(0);
    expect(prismaMock.calendarEvent.upsert).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.calendar_filter.dropped_no_crm_match",
      1
    );
  });

  it("passes events with ≥1 CRM attendee (any-match rule, passed metric)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "evt-3",
          organizer: USER_EMAIL,
          attendees: [
            "alice@crm.com",
            "stranger@unknown.com",
          ],
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(prismaMock.calendarEvent.upsert).toHaveBeenCalledTimes(1);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.calendar_filter.passed",
      1
    );
  });

  it("passes events where the CRM contact is the organizer and the user is an attendee", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "vendor@crm.com", id: "c-vendor", source: "salesforce" },
    ] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "evt-4",
          organizer: "vendor@crm.com",
          attendees: [USER_EMAIL, "vendor@crm.com"],
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(1);
  });

  it("excludes self-as-attendee from CRM match (even if user is somehow in their own Contact book)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "evt-5",
          organizer: USER_EMAIL,
          attendees: [USER_EMAIL],
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.skipped_no_attendees).toBe(1);
    expect(prismaMock.calendarEvent.upsert).not.toHaveBeenCalled();
    expect(prismaMock.contact.findMany).not.toHaveBeenCalled();
  });

  it("queries Calendar API with a +/-90-day window (events outside are not fetched)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    const fetchMock = vi.fn().mockResolvedValueOnce(listResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const tCallStart = Date.now();
    await syncCalendarForUser(USER_ID);
    const tCallEnd = Date.now();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    const timeMin = new Date(calledUrl.searchParams.get("timeMin") ?? "");
    const timeMax = new Date(calledUrl.searchParams.get("timeMax") ?? "");

    const NINETY_DAYS_MS = 90 * 86_400_000;
    const SLACK_MS = 5_000;
    expect(timeMin.getTime()).toBeGreaterThanOrEqual(
      tCallStart - NINETY_DAYS_MS - SLACK_MS
    );
    expect(timeMin.getTime()).toBeLessThanOrEqual(
      tCallEnd - NINETY_DAYS_MS + SLACK_MS
    );
    expect(timeMax.getTime()).toBeGreaterThanOrEqual(
      tCallStart + NINETY_DAYS_MS - SLACK_MS
    );
    expect(timeMax.getTime()).toBeLessThanOrEqual(
      tCallEnd + NINETY_DAYS_MS + SLACK_MS
    );
    expect(calledUrl.searchParams.get("singleEvents")).toBe("true");
  });

  it("paginates: two pages of events are both processed", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        listResponse(
          [{ id: "page1-evt", organizer: USER_EMAIL, attendees: ["alice@crm.com"] }],
          "next-page-token-abc"
        )
      )
      .mockResolvedValueOnce(
        listResponse([
          { id: "page2-evt", organizer: USER_EMAIL, attendees: ["alice@crm.com"] },
        ])
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallUrl = new URL(fetchMock.mock.calls[1]?.[0] as string);
    expect(secondCallUrl.searchParams.get("pageToken")).toBe(
      "next-page-token-abc"
    );
  });

  it("refreshes the access token before listing when the cached one is expired", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration({ expiryDate: new Date(Date.now() - 60_000) }) as never
    );
    prismaMock.calendarIntegration.update.mockResolvedValue({} as never);
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          access_token: "freshly-minted-access",
          expires_in: 3599,
          scope: "https://www.googleapis.com/auth/calendar.readonly",
          token_type: "Bearer",
        })
      )
      .mockResolvedValueOnce(
        listResponse([
          { id: "evt-refreshed", organizer: USER_EMAIL, attendees: ["alice@crm.com"] },
        ])
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(prismaMock.calendarIntegration.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.calendarIntegration.update.mock.calls[0]?.[0];
    expect(updateArg?.data).toMatchObject({
      accessToken: "ENC:freshly-minted-access",
    });
    expect(updateArg?.data?.expiryDate).toBeInstanceOf(Date);
    expect(
      (updateArg?.data?.expiryDate as Date).getTime()
    ).toBeGreaterThan(Date.now());
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://oauth2.googleapis.com/token");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/calendar/v3/calendars/primary/events"
    );
  });

  it("when one event's upsert throws, that event errors but the rest continue + fail_closed metric fires", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);
    prismaMock.calendarEvent.upsert
      .mockRejectedValueOnce(new Error("Unique constraint failed"))
      .mockResolvedValueOnce({} as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        { id: "evt-bad", organizer: USER_EMAIL, attendees: ["alice@crm.com"] },
        { id: "evt-good", organizer: USER_EMAIL, attendees: ["alice@crm.com"] },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("evt-bad");
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.calendar_filter.fail_closed",
      1
    );
  });

  it("recurring-event instances are each filtered independently (singleEvents=true)", async () => {
    prismaMock.calendarIntegration.findUnique.mockResolvedValue(
      makeIntegration() as never
    );
    prismaMock.calendarEvent.upsert.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([
        {
          id: "rec-1-instance-a",
          recurringEventId: "rec-1",
          organizer: USER_EMAIL,
          attendees: ["alice@crm.com"],
        },
        {
          id: "rec-1-instance-b",
          recurringEventId: "rec-1",
          organizer: USER_EMAIL,
          attendees: ["alice@crm.com"],
        },
        {
          id: "rec-1-instance-c",
          recurringEventId: "rec-1",
          organizer: USER_EMAIL,
          attendees: ["stranger@unknown.com"],
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncCalendarForUser(USER_ID);

    expect(result.synced).toBe(2);
    expect(result.skipped_no_crm_match).toBe(1);
    expect(prismaMock.calendarEvent.upsert).toHaveBeenCalledTimes(2);
    for (const call of prismaMock.calendarEvent.upsert.mock.calls) {
      expect(call[0].create).toMatchObject({ isRecurring: true });
    }
  });
});
