import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";

import { verifySlackSignature } from "@/lib/slack-events";

const env = process.env as Record<string, string | undefined>;
const ORIG_SECRET = env.SLACK_SIGNING_SECRET;

const TEST_SECRET = "test-signing-secret-day-7";

function signedRequest(opts: {
  body: string;
  timestamp?: number;
  signature?: string;
  withTimestamp?: boolean;
  withSignature?: boolean;
}): { req: NextRequest; rawBody: string } {
  const timestamp = opts.timestamp ?? Math.floor(Date.now() / 1000);
  const baseString = `v0:${timestamp}:${opts.body}`;
  const sig =
    opts.signature ??
    "v0=" +
    crypto.createHmac("sha256", TEST_SECRET).update(baseString).digest("hex");

  const headers = new Headers();
  if (opts.withTimestamp !== false) {
    headers.set("x-slack-request-timestamp", String(timestamp));
  }
  if (opts.withSignature !== false) {
    headers.set("x-slack-signature", sig);
  }
  const req = new NextRequest("http://localhost:3001/api/slack/events", {
    method: "POST",
    headers,
    body: opts.body,
  });
  return { req, rawBody: opts.body };
}

beforeEach(() => {
  env.SLACK_SIGNING_SECRET = TEST_SECRET;
});

afterEach(() => {
  env.SLACK_SIGNING_SECRET = ORIG_SECRET;
  vi.restoreAllMocks();
});

describe("verifySlackSignature", () => {
  it("returns valid:true on a correctly signed request", async () => {
    const { req, rawBody } = signedRequest({ body: '{"type":"event_callback"}' });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: true });
  });

  it("returns no_timestamp when the X-Slack-Request-Timestamp header is missing", async () => {
    const { req, rawBody } = signedRequest({
      body: "{}",
      withTimestamp: false,
    });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: false, reason: "no_timestamp" });
  });

  it("returns no_signature when the X-Slack-Signature header is missing", async () => {
    const { req, rawBody } = signedRequest({
      body: "{}",
      withSignature: false,
    });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: false, reason: "no_signature" });
  });

  it("returns replay when the timestamp is older than 5 minutes", async () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
    const { req, rawBody } = signedRequest({
      body: "{}",
      timestamp: oldTimestamp,
    });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: false, reason: "replay" });
  });

  it("returns mismatch on a signature computed with the wrong secret", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const wrongSig =
      "v0=" +
      crypto
        .createHmac("sha256", "different-secret")
        .update(`v0:${timestamp}:{}`)
        .digest("hex");
    const { req, rawBody } = signedRequest({
      body: "{}",
      timestamp,
      signature: wrongSig,
    });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: false, reason: "mismatch" });
  });

  it("returns no_secret when SLACK_SIGNING_SECRET is not configured", async () => {
    delete env.SLACK_SIGNING_SECRET;
    const { req, rawBody } = signedRequest({ body: "{}" });
    const result = await verifySlackSignature(req, rawBody);
    expect(result).toEqual({ valid: false, reason: "no_secret" });
  });

  it("uses crypto.timingSafeEqual for the actual comparison (not ===)", async () => {
    const spy = vi.spyOn(crypto, "timingSafeEqual");
    const { req, rawBody } = signedRequest({ body: '{"a":1}' });
    await verifySlackSignature(req, rawBody);
    expect(spy).toHaveBeenCalled();
  });
});
