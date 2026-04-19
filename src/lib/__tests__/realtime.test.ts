import { beforeEach, describe, expect, it, vi } from "vitest";

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    incr: vi.fn(),
    lpush: vi.fn(),
    ltrim: vi.fn(),
    expire: vi.fn(),
    lrange: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: redisMock,
}));

import {
  consumeUserEventsSince,
  notifyRealtimeEvent,
} from "@/lib/realtime";

describe("realtime delivery semantics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes events with sequence id and bounded list", async () => {
    redisMock.incr.mockResolvedValue(101);
    redisMock.lpush.mockResolvedValue(1);
    redisMock.ltrim.mockResolvedValue("OK");
    redisMock.expire.mockResolvedValue(1);

    await notifyRealtimeEvent("u1", { type: "deal.updated", dealId: "d1" });

    expect(redisMock.incr).toHaveBeenCalled();
    expect(redisMock.lpush).toHaveBeenCalledWith(
      "user:u1:events",
      expect.stringContaining('"id":101')
    );
    expect(redisMock.ltrim).toHaveBeenCalledWith("user:u1:events", 0, 1999);
  });

  it("returns events after cursor without destructive delete", async () => {
    redisMock.lrange.mockResolvedValue([
      JSON.stringify({
        id: 3,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d3" },
        timestamp: new Date().toISOString(),
      }),
      JSON.stringify({
        id: 2,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d2" },
        timestamp: new Date().toISOString(),
      }),
      JSON.stringify({
        id: 1,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d1" },
        timestamp: new Date().toISOString(),
      }),
    ]);

    const events = await consumeUserEventsSince("u1", 1);
    expect(events.map((e) => e.id)).toEqual([2, 3]);
  });

  it("deduplicates by id and always returns ascending order", async () => {
    redisMock.lrange.mockResolvedValue([
      JSON.stringify({
        id: 4,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d4-newer" },
        timestamp: new Date().toISOString(),
      }),
      JSON.stringify({
        id: 2,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d2" },
        timestamp: new Date().toISOString(),
      }),
      JSON.stringify({
        id: 4,
        type: "deal.updated",
        payload: { type: "deal.updated", dealId: "d4-older" },
        timestamp: new Date().toISOString(),
      }),
      "not-json",
    ]);

    const events = await consumeUserEventsSince("u1", 0);
    expect(events.map((e) => e.id)).toEqual([2, 4]);
    expect(events[1].payload).toMatchObject({ dealId: "d4-newer" });
  });
});
