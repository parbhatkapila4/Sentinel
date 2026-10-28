import { describe, expect, it } from "vitest";
import { eventLabel, WEBHOOK_EVENTS } from "../events";
import {
  countLabel,
  deliveryLabel,
  deliveryResponse,
  deliveryWhen,
  detailClause,
  listChip,
  webhookHost,
} from "../model";

const NOW = Date.UTC(2026, 9, 27, 14, 5);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("webhook wording", () => {
  it("counts in words, singular and plural", () => {
    expect(countLabel(1, "delivery", "deliveries")).toBe("1 delivery");
    expect(countLabel(12, "delivery", "deliveries")).toBe("12 deliveries");
    expect(countLabel(1280, "delivery", "deliveries")).toBe("1,280 deliveries");
    expect(listChip(0)).toBe("No webhooks yet");
    expect(listChip(1)).toBe("1 webhook");
    expect(listChip(2)).toBe("2 webhooks");
    expect(detailClause({ events: ["deal.created"], _count: { deliveries: 1 } })).toBe(
      "1 event, 1 delivery."
    );
  });

  it("names every subscribable event and falls back for unknown ones", () => {
    expect(WEBHOOK_EVENTS.map((e) => eventLabel(e.value))).toEqual([
      "Deal created",
      "Stage changed",
      "Deal at risk",
      "Closed won",
      "Closed lost",
    ]);
    expect(eventLabel("team.member_added")).toBe("Team member added");
    expect(deliveryLabel({ event: "deal.created", isTest: true })).toBe("Test delivery");
  });

  it("shows the host of the endpoint", () => {
    expect(webhookHost("https://hooks.acme.io/sentinel/events")).toBe("hooks.acme.io");
    expect(webhookHost("not a url")).toBe("not a url");
  });

  it("describes what came back", () => {
    expect(deliveryResponse({ response: "  Internal\nServer Error ", success: false, statusCode: 500 })).toBe(
      "Internal Server Error"
    );
    expect(deliveryResponse({ response: null, success: true, statusCode: 204 })).toBe("OK");
    expect(deliveryResponse({ response: "", success: false, statusCode: null })).toBe("No response");
    expect(deliveryResponse({ response: null, success: false, statusCode: 502 })).toBe("Empty response");
  });

  it("says when, by elapsed time", () => {
    expect(deliveryWhen(new Date(NOW - 20_000), NOW)).toBe("Just now");
    expect(deliveryWhen(new Date(NOW - MIN), NOW)).toBe("1 minute ago");
    expect(deliveryWhen(new Date(NOW - 5 * MIN), NOW)).toBe("5 minutes ago");
    expect(deliveryWhen(new Date(NOW - 2 * HOUR - 4 * MIN), NOW)).toBe("2 hours ago");
    expect(deliveryWhen(new Date(NOW - 30 * HOUR), NOW)).toBe("Yesterday");
    expect(deliveryWhen(new Date(NOW - 3 * DAY), NOW).toString()).toBe("3 days ago");
    expect(deliveryWhen(new Date(Date.UTC(2026, 7, 2, 23, 30)), NOW)).toBe("Aug 2, 2026");
    expect(deliveryWhen(new Date(NOW + MIN).toISOString(), NOW)).toBe("Just now");
  });
});
