import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";

vi.mock("@/lib/slack-events", async () => {
  const actual = await vi.importActual<typeof import("@/lib/slack-events")>(
    "@/lib/slack-events"
  );
  return {
    ...actual,
    handleSlackEvent: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

import { POST } from "@/app/api/slack/events/route";
import { handleSlackEvent } from "@/lib/slack-events";

const mockedHandle = vi.mocked(handleSlackEvent);

const TEST_SECRET = "route-test-signing-secret";
const env = process.env as Record<string, string | undefined>;
const ORIG_SECRET = env.SLACK_SIGNING_SECRET;

function buildSignedRequest(opts: {
  body: string;
  signed: boolean;
  staleTimestamp?: boolean;
  withTimestamp?: boolean;
  withSignature?: boolean;
}): NextRequest {
  const headers = new Headers();
  const timestamp = opts.staleTimestamp
    ? Math.floor(Date.now() / 1000) - 600
    : Math.floor(Date.now() / 1000);

  if (opts.withTimestamp !== false) {
    headers.set("x-slack-request-timestamp", String(timestamp));
  }
  if (opts.signed && opts.withSignature !== false) {
    const baseString = `v0:${timestamp}:${opts.body}`;
    const sig =
      "v0=" +
      crypto.createHmac("sha256", TEST_SECRET).update(baseString).digest("hex");
    headers.set("x-slack-signature", sig);
  } else if (opts.withSignature !== false) {
    headers.set("x-slack-signature", "v0=" + "0".repeat(64));
  }

  return new NextRequest("http://localhost:3001/api/slack/events", {
    method: "POST",
    headers,
    body: opts.body,
  });
}

beforeEach(() => {
  env.SLACK_SIGNING_SECRET = TEST_SECRET;
  mockedHandle.mockReset();
  mockedHandle.mockResolvedValue(undefined);
});

afterEach(() => {
  env.SLACK_SIGNING_SECRET = ORIG_SECRET;
});

describe("POST /api/slack/events", () => {
  it("returns 401 when the X-Slack-Signature header is missing", async () => {
    const req = buildSignedRequest({
      body: JSON.stringify({
        type: "event_callback",
        team_id: "T1",
        event_id: "E1",
        event: {},
      }),
      signed: false,
      withSignature: false,
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("signature_invalid");
    expect(body.reason).toBe("no_signature");
    expect(mockedHandle).not.toHaveBeenCalled();
  });

  it("returns 401 on a present-but-wrong signature, handler never invoked", async () => {
    const req = buildSignedRequest({
      body: JSON.stringify({
        type: "event_callback",
        team_id: "T1",
        event_id: "E1",
        event: {},
      }),
      signed: false,
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("signature_invalid");
    expect(body.reason).toBe("mismatch");
    expect(mockedHandle).not.toHaveBeenCalled();
  });

  it("url_verification echoes the challenge back without invoking the handler or requiring a signature", async () => {
    const req = buildSignedRequest({
      body: JSON.stringify({
        type: "url_verification",
        challenge: "the-quick-brown-fox-9876",
      }),
      signed: false,
      withSignature: false,
      withTimestamp: false,
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ challenge: "the-quick-brown-fox-9876" });
    expect(mockedHandle).not.toHaveBeenCalled();
  });

  it("on a valid event_callback, returns 200 BEFORE the handler resolves (fire-and-forget)", async () => {
    let release!: () => void;
    const handlerPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockedHandle.mockReturnValueOnce(handlerPromise);

    const payload = JSON.stringify({
      type: "event_callback",
      team_id: "T1",
      event_id: "E1",
      event: { type: "message", user: "U01ABCDEF12", channel_type: "im" },
    });
    const req = buildSignedRequest({ body: payload, signed: true });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockedHandle).toHaveBeenCalledTimes(1);

    release();
    await handlerPromise;
  });

  it("malformed JSON returns 400 without crashing, handler never invoked", async () => {
    const req = new NextRequest("http://localhost:3001/api/slack/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json at all",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("malformed_json");
    expect(mockedHandle).not.toHaveBeenCalled();
  });
});
