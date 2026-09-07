import { describe, it, expect } from "vitest";
import {
  MAX_ITEM_ATTEMPTS,
  SYNC_PROVIDER_ORDER,
  compareWorkKeys,
  itemsAfter,
  parseWorkKey,
  sortWorkItems,
  workKey,
  type SyncWorkItem,
} from "@/lib/sync/cron-cursor";

function item(provider: SyncWorkItem["provider"], userId: string): SyncWorkItem {
  return { provider, userId, key: workKey(provider, userId) };
}

describe("cron cursor ordering", () => {
  it("orders by provider order, then userId ascending, deterministically", () => {
    const unsorted = [
      item("gmail", "user_b"),
      item("hubspot", "user_z"),
      item("salesforce", "user_b"),
      item("hubspot", "user_a"),
      item("google_calendar", "user_a"),
      item("salesforce", "user_a"),
    ];
    const sorted = sortWorkItems(unsorted).map((i) => i.key);
    expect(sorted).toEqual([
      "salesforce:user_a",
      "salesforce:user_b",
      "hubspot:user_a",
      "hubspot:user_z",
      "google_calendar:user_a",
      "gmail:user_b",
    ]);
    expect(sortWorkItems(sorted.map((k) => {
      const parsed = parseWorkKey(k)!;
      return item(parsed.provider, parsed.userId);
    })).map((i) => i.key)).toEqual(sorted);
  });

  it("resumes strictly after the last completed key, even if that key no longer exists", () => {
    const items = sortWorkItems([
      item("salesforce", "user_a"),
      item("salesforce", "user_c"),
      item("hubspot", "user_a"),
    ]);
    expect(itemsAfter(items, "salesforce:user_b").map((i) => i.key)).toEqual([
      "salesforce:user_c",
      "hubspot:user_a",
    ]);
    expect(itemsAfter(items, null)).toHaveLength(3);
    expect(itemsAfter(items, "gmail:zzz")).toHaveLength(0);
  });

  it("parses and compares keys with the provider list as the primary order", () => {
    expect(parseWorkKey("hubspot:user_1")).toEqual({ provider: "hubspot", userId: "user_1" });
    expect(parseWorkKey("unknown:user_1")).toBeNull();
    expect(parseWorkKey("hubspot:")).toBeNull();
    expect(compareWorkKeys("salesforce:zzz", "hubspot:aaa")).toBeLessThan(0);
    expect(SYNC_PROVIDER_ORDER.indexOf("salesforce")).toBeLessThan(
      SYNC_PROVIDER_ORDER.indexOf("hubspot")
    );
  });

  it("gives a killed item exactly one retry before it is recorded as exhausted", () => {
    expect(MAX_ITEM_ATTEMPTS).toBe(2);
  });
});
