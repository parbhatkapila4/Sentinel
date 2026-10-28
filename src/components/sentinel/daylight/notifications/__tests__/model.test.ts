import { describe, expect, it } from "vitest";
import {
  categorize,
  categoryColor,
  displayMessage,
  displayTitle,
  groupLabel,
  groupRows,
  heroCopy,
  subjectOf,
  timeLabel,
  visibleRows,
  type NotificationRow,
} from "../model";

const NOW = new Date(2026, 9, 27, 14, 5);

function at(daysAgo: number, h = 12, m = 0): string {
  return new Date(2026, 9, 27 - daysAgo, h, m).toISOString();
}

function row(over: Partial<NotificationRow>): NotificationRow {
  return {
    id: "n",
    type: "deal_at_risk",
    title: "Deal at Risk: Meridian Health",
    message: "Negotiation stalled without response",
    dealId: "d1",
    teamId: null,
    read: false,
    emailSent: false,
    createdAt: at(0),
    ...over,
  };
}

describe("notification categories", () => {
  it("maps stored types to the page's categories", () => {
    expect(categorize("deal_at_risk")).toBe("RISK");
    expect(categorize("action_overdue")).toBe("ACTION");
    expect(categorize("stage_changed")).toBe("STAGE");
    expect(categorize("team_invite")).toBe("TEAM");
    expect(categorize("mention")).toBe("MENTION");
    expect(categorize("weekly_digest")).toBe("SYSTEM");
  });

  it("colours a stage move by where the deal ended up", () => {
    const stage = (message: string) => categoryColor({ type: "stage_changed", message });
    expect(stage("Moved from negotiation to closed_won")).toBe("var(--dl-green)");
    expect(stage("Moved from negotiation to closed_lost")).toBe("var(--dl-seg)");
    expect(stage("Moved from proposal to negotiation")).toBe("var(--dl-ink)");
    expect(categoryColor({ type: "deal_at_risk", message: "" })).toBe("var(--dl-signal)");
    expect(categoryColor({ type: "action_overdue", message: "" })).toBe("var(--dl-amber)");
  });
});

describe("notification copy", () => {
  it("reads stored title case in sentence case", () => {
    expect(displayTitle("Deal at Risk: Meridian Health")).toBe("Deal at risk: Meridian Health");
    expect(displayTitle("Action Overdue: Pinnacle")).toBe("Action overdue: Pinnacle");
    expect(displayTitle("Deal Stage Changed: Horizon Labs")).toBe("Stage changed: Horizon Labs");
    expect(displayTitle("Welcome to Sentinel")).toBe("Welcome to Sentinel");
  });

  it("names stages instead of raw stage keys and ends with a full stop", () => {
    expect(displayMessage("Moved from negotiation to closed_won")).toBe(
      "Moved from Negotiation to Closed won."
    );
    expect(displayMessage("Negotiation stalled without response")).toBe(
      "Negotiation stalled without response."
    );
    expect(displayMessage("Already punctuated!")).toBe("Already punctuated!");
  });

  it("finds the deal a title names", () => {
    expect(subjectOf("Deal at Risk: Meridian Health")).toBe("Meridian Health");
    expect(subjectOf("No colon here")).toBeNull();
  });
});

describe("notification dates", () => {
  it("shows the time today, then days, then the date", () => {
    expect(timeLabel(at(0, 13, 42), NOW)).toBe("13:42");
    expect(timeLabel(at(1), NOW)).toBe("Yesterday");
    expect(timeLabel(at(3), NOW)).toBe("3 days ago");
    expect(timeLabel(at(11), NOW)).toBe("11 days ago");
    expect(timeLabel(new Date(2026, 6, 4).toISOString(), NOW)).toBe("Jul 4");
    expect(timeLabel(new Date(2025, 6, 4).toISOString(), NOW)).toBe("Jul 4, 2025");
  });

  it("groups by calendar day in sentence case", () => {
    expect(groupLabel(at(0), NOW)).toBe("Today");
    expect(groupLabel(at(1), NOW)).toBe("Yesterday");
    expect(groupLabel(at(3), NOW)).toBe("3 days ago");
    expect(groupLabel(at(9), NOW)).toBe("Last week");
    expect(groupLabel(at(16), NOW)).toBe("2 weeks ago");
    expect(groupLabel(at(40), NOW)).toBe("Last month");
    expect(groupLabel(at(70), NOW)).toBe("2 months ago");
    expect(groupLabel(at(200), NOW)).toBe("Older");
  });

  it("keeps groups in the order the rows arrive", () => {
    const groups = groupRows(
      [row({ id: "a", createdAt: at(0) }), row({ id: "b", createdAt: at(1) }), row({ id: "c", createdAt: at(1) })],
      NOW
    );
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ["Today", 1],
      ["Yesterday", 2],
    ]);
  });
});

describe("visible rows", () => {
  const items = [
    row({ id: "a", read: false }),
    row({ id: "b", read: true, title: "Deal Stage Changed: Horizon Labs", type: "stage_changed", message: "Moved from proposal to negotiation" }),
  ];

  it("shows only unread rows in the Unread tab", () => {
    expect(visibleRows(items, "unread", "").map((n) => n.id)).toEqual(["a"]);
    expect(visibleRows(items, "all", "").map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("searches the text as the page shows it", () => {
    expect(visibleRows(items, "all", "stage changed").map((n) => n.id)).toEqual(["b"]);
    expect(visibleRows(items, "all", "Negotiation.").map((n) => n.id)).toEqual(["b"]);
  });
});

describe("hero copy", () => {
  it("is calm when nothing is unread", () => {
    expect(heroCopy(0, [])).toEqual({
      chip: { label: "All caught up", tone: "good" },
      headline: "The book is",
      emphasis: "clean.",
      clause: "nothing is waiting on you.",
    });
  });

  it("names only the kinds of item still waiting", () => {
    const copy = heroCopy(3, [
      row({ id: "a", type: "deal_at_risk" }),
      row({ id: "b", type: "action_overdue" }),
      row({ id: "c", type: "action_overdue" }),
      row({ id: "d", type: "stage_changed", read: true }),
    ]);
    expect(copy.chip).toEqual({ label: "3 unread", tone: "alert" });
    expect(`${copy.headline} ${copy.emphasis}`).toBe("3 pending items.");
    expect(copy.clause).toBe("risk flags and overdue actions.");
  });

  it("speaks of one item in the singular", () => {
    const copy = heroCopy(1, [row({ type: "stage_changed", message: "Moved from a to b" })]);
    expect(`${copy.headline} ${copy.emphasis}`).toBe("One pending item.");
    expect(copy.clause).toBe("a stage move.");
  });
});
