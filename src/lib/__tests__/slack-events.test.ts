import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

import {
  __clearSlackResolverCacheForTests,
  handleSlackEvent,
  type SlackEventEnvelope,
} from "@/lib/slack-events";
import { incrementMetric } from "@/lib/metrics";

const mockedIncrement = vi.mocked(incrementMetric);

const SUB = {
  id: "sub-1",
  userId: "user-1",
  teamId: "T01ABC",
  botToken: "ENC:xoxb-test-token",
  botUserId: "U01BOT0SELF",
  selfEmail: "founder@self.com",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockUsersInfoOnce(opts: {
  ok?: boolean;
  email?: string | null;
  deleted?: boolean;
  isBot?: boolean;
  error?: string;
  httpOk?: boolean;
  httpStatus?: number;
}) {
  const httpOk = opts.httpOk ?? true;
  const status = opts.httpStatus ?? (httpOk ? 200 : 500);
  const ok = opts.ok ?? true;
  const body = ok
    ? {
      ok: true,
      user: {
        id: "U01PEER0001",
        deleted: opts.deleted ?? false,
        is_bot: opts.isBot ?? false,
        profile: opts.email !== undefined ? { email: opts.email } : {},
      },
    }
    : { ok: false, error: opts.error ?? "unknown_error" };
  return {
    ok: httpOk,
    status,
    json: async () => body,
  } as unknown as Response;
}

function envelope(
  inner: Partial<NonNullable<SlackEventEnvelope["event"]>>,
  overrides: Partial<SlackEventEnvelope> = {}
): SlackEventEnvelope {
  return {
    type: "event_callback",
    team_id: "T01ABC",
    event_id: "Ev_default",
    event: {
      type: "message",
      user: "U01PEER0001",
      channel: "D_DM_1",
      channel_type: "im",
      ts: "1700000000.123456",
      text: "hello",
      ...inner,
    },
    ...overrides,
  };
}

beforeEach(() => {
  resetPrismaMock();
  mockedIncrement.mockReset();
  __clearSlackResolverCacheForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("handleSlackEvent — admission decisions", () => {
  it("DM from a CRM contact passes the filter, persists, and emits the passed metric", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.slackMessage.create.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockUsersInfoOnce({ email: "alice@crm.com" }))
    );

    await handleSlackEvent(envelope({ user: "U01PEER0001" }, { event_id: "Ev_pass" }));

    expect(prismaMock.slackMessage.create).toHaveBeenCalledTimes(1);
    const payload = prismaMock.slackMessage.create.mock.calls[0]?.[0]?.data;
    expect(payload?.userId).toBe(SUB.userId);
    expect(payload?.slackEventId).toBe("Ev_pass");
    expect(payload?.senderEmail).toBe("alice@crm.com");
    expect(payload?.matchedCrmContacts).toEqual(["alice@crm.com"]);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.passed",
      1
    );
  });

  it("DM from a non-CRM email is dropped with dropped_no_crm_match", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.contact.findMany.mockResolvedValue([] as never);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "stranger@unknown.com" }))
    );

    await handleSlackEvent(envelope({ user: "U01PEER0001" }, { event_id: "Ev_miss" }));

    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_no_crm_match",
      1
    );
  });

  it("messages with subtype=bot_message are dropped with dropped_bot_message", async () => {
    await handleSlackEvent(
      envelope({ subtype: "bot_message" }, { event_id: "Ev_bot_sub" })
    );

    expect(prismaMock.slackEventsSubscription.findUnique).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_bot_message",
      1
    );
  });

  it("messages with bot_id set are also dropped with dropped_bot_message", async () => {
    await handleSlackEvent(
      envelope({ bot_id: "B01XYZ" }, { event_id: "Ev_bot_id" })
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_bot_message",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });

  it("message_changed (and other out-of-scope subtypes) are dropped with out_of_scope", async () => {
    await handleSlackEvent(
      envelope({ subtype: "message_changed" }, { event_id: "Ev_changed" })
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.out_of_scope",
      1
    );
    expect(prismaMock.slackEventsSubscription.findUnique).not.toHaveBeenCalled();
  });

  it("sender = botUserId is dropped with dropped_self_bot (resolver never called)", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await handleSlackEvent(
      envelope({ user: SUB.botUserId }, { event_id: "Ev_self_bot" })
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_self_bot",
      1
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sender email = subscription.selfEmail is dropped with dropped_self_user", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: SUB.selfEmail ?? "" }))
    );

    await handleSlackEvent(
      envelope({ user: "U01PEER0001" }, { event_id: "Ev_self_user" })
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_self_user",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });

  it("users.info user_not_found is dropped with dropped_deleted_user", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          mockUsersInfoOnce({ ok: false, error: "user_not_found" })
        )
    );

    await handleSlackEvent(envelope({}, { event_id: "Ev_deleted" }));

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_deleted_user",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });

  it("users.info ratelimited fails closed without persisting the message", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          mockUsersInfoOnce({ ok: false, error: "ratelimited" })
        )
    );

    await handleSlackEvent(envelope({}, { event_id: "Ev_ratelimit" }));

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.fail_closed",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });

  it("returns no_subscription when no SlackEventsSubscription exists for teamId", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(null);

    await handleSlackEvent(envelope({}, { event_id: "Ev_no_sub" }));

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.no_subscription",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });
});

describe("handleSlackEvent — idempotency", () => {
  it("an event_id already in the DB is dropped with duplicate_event", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue({
      id: "existing-row",
    } as never);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await handleSlackEvent(envelope({}, { event_id: "Ev_dup_existing" }));

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.duplicate_event",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a P2002 race-condition violation on insert is caught and counted as duplicate_event", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);
    const p2002 = Object.assign(new Error("Unique constraint failed"), {
      code: "P2002",
    });
    prismaMock.slackMessage.create.mockRejectedValueOnce(p2002);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "alice@crm.com" }))
    );

    await handleSlackEvent(envelope({}, { event_id: "Ev_race" }));

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.duplicate_event",
      1
    );
    expect(mockedIncrement).not.toHaveBeenCalledWith(
      "crm_permission.slack_filter.fail_closed",
      expect.anything()
    );
  });
});

describe("handleSlackEvent — mentions", () => {
  it("app_mention with a CRM contact mentioned passes; matchedCrmContacts includes the mention", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.slackMessage.create.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "noncrm@x.com" }))
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "alice@crm.com" }))
    );

    await handleSlackEvent(
      envelope(
        {
          type: "app_mention",
          channel_type: "channel",
          user: "U01PEER0001",
          text: "hey <@U01ALICE001> can you review?",
        },
        { event_id: "Ev_mention_pass" }
      )
    );

    expect(prismaMock.slackMessage.create).toHaveBeenCalledTimes(1);
    const payload = prismaMock.slackMessage.create.mock.calls[0]?.[0]?.data;
    expect(payload?.matchedCrmContacts).toEqual(["alice@crm.com"]);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.passed",
      1
    );
  });

  it("app_mention with neither sender nor mentioned user in CRM is dropped", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.contact.findMany.mockResolvedValue([] as never);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "rando1@x.com" }))
        .mockResolvedValueOnce(mockUsersInfoOnce({ email: "rando2@x.com" }))
    );

    await handleSlackEvent(
      envelope(
        {
          type: "app_mention",
          channel_type: "channel",
          user: "U01PEER0001",
          text: "hi <@U01RANDO001> here",
        },
        { event_id: "Ev_mention_miss" }
      )
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "crm_permission.slack_filter.dropped_no_crm_match",
      1
    );
    expect(prismaMock.slackMessage.create).not.toHaveBeenCalled();
  });

  it("mention parser extracts every <@U...> id from a channel-message text", async () => {
    prismaMock.slackEventsSubscription.findUnique.mockResolvedValue(SUB as never);
    prismaMock.slackMessage.findUnique.mockResolvedValue(null);
    prismaMock.slackMessage.create.mockResolvedValue({} as never);
    prismaMock.contact.findMany.mockResolvedValue([
      { email: "alice@crm.com", id: "c-alice", source: "hubspot" },
    ] as never);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockUsersInfoOnce({ email: "noncrm@x.com" }))
      .mockResolvedValueOnce(mockUsersInfoOnce({ email: "alice@crm.com" }))
      .mockResolvedValueOnce(mockUsersInfoOnce({ email: "bob@unknown.com" }));
    vi.stubGlobal("fetch", fetchMock);

    await handleSlackEvent(
      envelope(
        {
          type: "message",
          channel_type: "channel",
          user: "U01PEER0001",
          text: "hi <@U01FOO00001> can <@U01BAR00001> check this?",
        },
        { event_id: "Ev_two_mentions" }
      )
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toContain("user=U01PEER0001");
    expect(urls[1]).toContain("user=U01FOO00001");
    expect(urls[2]).toContain("user=U01BAR00001");
    expect(prismaMock.slackMessage.create).toHaveBeenCalledTimes(1);
  });
});
