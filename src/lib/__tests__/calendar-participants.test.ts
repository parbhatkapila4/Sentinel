import { describe, it, expect } from "vitest";
import {
  extractCalendarParticipants,
  type GoogleCalendarEvent,
} from "@/lib/calendar-participants";

function event(overrides: Partial<GoogleCalendarEvent>): GoogleCalendarEvent {
  return { ...overrides };
}

describe("extractCalendarParticipants", () => {
  it("merges organizer + attendees into `all`, deduped and lowercased", () => {
    const result = extractCalendarParticipants(
      event({
        organizer: { email: "Org@Example.com" },
        attendees: [
          { email: "Bob@Example.com" },
          { email: "carol@example.com" },
        ],
      })
    );

    expect(result.organizer).toBe("org@example.com");
    expect(result.attendees).toEqual(["bob@example.com", "carol@example.com"]);
    expect(result.all).toEqual([
      "org@example.com",
      "bob@example.com",
      "carol@example.com",
    ]);
  });

  it("handles attendees-only events (no organizer)", () => {
    const result = extractCalendarParticipants(
      event({
        attendees: [{ email: "a@x.com" }, { email: "b@x.com" }],
      })
    );

    expect(result.organizer).toBeNull();
    expect(result.attendees).toEqual(["a@x.com", "b@x.com"]);
    expect(result.all).toEqual(["a@x.com", "b@x.com"]);
  });

  it("handles organizer-only events (no attendees field)", () => {
    const result = extractCalendarParticipants(
      event({
        organizer: { email: "solo@example.com" },
      })
    );

    expect(result.organizer).toBe("solo@example.com");
    expect(result.attendees).toEqual([]);
    expect(result.all).toEqual(["solo@example.com"]);
  });

  it("returns empty arrays / null for an event with neither organizer nor attendees", () => {
    const result = extractCalendarParticipants(event({ summary: "Ghost" }));

    expect(result.organizer).toBeNull();
    expect(result.attendees).toEqual([]);
    expect(result.all).toEqual([]);
  });

  it("dedupes when the same address appears in organizer AND attendees", () => {
    const result = extractCalendarParticipants(
      event({
        organizer: { email: "alice@example.com" },
        attendees: [
          { email: "alice@example.com" },
          { email: "bob@example.com" },
        ],
      })
    );

    expect(result.all).toEqual(["alice@example.com", "bob@example.com"]);
    expect(result.attendees).toEqual([
      "alice@example.com",
      "bob@example.com",
    ]);
  });

  it("treats `attendees: []` and missing `attendees` field identically", () => {
    const a = extractCalendarParticipants(
      event({ organizer: { email: "o@x.com" }, attendees: [] })
    );
    const b = extractCalendarParticipants(
      event({ organizer: { email: "o@x.com" } })
    );
    expect(a).toEqual(b);
  });

  it("drops attendees with no email (declined/RSVP-only entries) without erroring", () => {
    const result = extractCalendarParticipants(
      event({
        organizer: { email: "o@x.com" },
        attendees: [
          { email: "real@x.com" },
          { displayName: "Resource Room", responseStatus: "accepted" },
          { email: "  " },
        ],
      })
    );

    expect(result.attendees).toEqual(["real@x.com"]);
    expect(result.all).toEqual(["o@x.com", "real@x.com"]);
  });
});
