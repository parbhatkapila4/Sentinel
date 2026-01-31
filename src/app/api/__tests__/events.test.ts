import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const env = process.env as Record<string, string | undefined>;
const origNodeEnv = env.NODE_ENV;

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

import { GET } from "@/app/api/events/route";

describe("GET /api/events", () => {
  beforeEach(() => {
    env.NODE_ENV = "test";
  });

  afterEach(() => {
    env.NODE_ENV = origNodeEnv;
  });

  it("returns 200 in test env (stream not asserted)", async () => {
    const req = new NextRequest("http://localhost/api/events");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
