import { describe, expect, it } from "vitest";
import { calculateWinProbability } from "@/lib/predictions";
import {
  buildActivity,
  buildDealView,
  deriveNextStep,
  parseBrief,
  rewordFactor,
  riskNote,
  toMeetingView,
  type DealDetailInput,
  type NextStepInput,
} from "../model";
const NOW = new Date(2026, 9, 27, 14, 5).getTime();
const at = (month: number, day: number, hour = 10, minute = 0) =>
  new Date(2026, month, day, hour, minute);

const atRisk: NextStepInput = {
  stage: "negotiation",
  status: "at_risk",
  riskScore: 0.66,
  recommendedAction: { label: "Nudge for response", urgency: "high" },
  actionDueAt: at(9, 26, 9),
  actionOverdueByDays: 1,
  isActionOverdue: true,
  riskReasons: ["Negotiation stalled without response", "High value deal requires attention"],
  createdAt: at(7, 30, 9),
  lastActivityAt: at(9, 18),
};

describe("deriveNextStep", () => {
  it("shows Sentinel's recommended step for an at-risk deal (the old panel never rendered)", () => {
    const step = deriveNextStep(atRisk, NOW);
    expect(step).toMatchObject({
      kind: "act",
      action: "Nudge for response",
      due: { text: "Due Monday, Oct 26", late: "1 day overdue" },
      pill: { label: "1 day late", tone: "alert" },
      urgency: { label: "High urgency", tone: "alert" },
      riskPercent: 66,
      riskTier: "high",
      riskNote: "Risk 66%. 60% or more counts as high.",
    });
    if (step.kind !== "act") throw new Error("expected an action");
    expect(step.reasons).toEqual([
      { text: "Negotiation stalled without response", tier: "high" },
      { text: "High value deal requires attention", tier: "medium" },
    ]);
  });

  it("falls back to a plain follow-up when the engine has no recommendation", () => {
    const step = deriveNextStep(
      { ...atRisk, recommendedAction: null, actionDueAt: null, actionOverdueByDays: null, isActionOverdue: false },
      NOW
    );
    expect(step).toMatchObject({ kind: "act", action: "Follow up", due: null, pill: null, urgency: null });
  });

  it("marks a step due later today as due today, and a future one with the days left", () => {
    const today = deriveNextStep(
      { ...atRisk, actionDueAt: at(9, 27, 20), actionOverdueByDays: null, isActionOverdue: false },
      NOW
    );
    expect(today).toMatchObject({ pill: { label: "Due today", tone: "warn" }, due: { late: null } });
    const later = deriveNextStep(
      { ...atRisk, actionDueAt: at(9, 30, 9), actionOverdueByDays: null, isActionOverdue: false },
      NOW
    );
    expect(later).toMatchObject({ pill: { label: "Due in 3 days", tone: "neutral" } });
  });

  it("reads as on track for a healthy deal and keeps a softer suggestion", () => {
    const step = deriveNextStep(
      {
        ...atRisk,
        status: "active",
        riskScore: 0.2,
        recommendedAction: { label: "Review deal details", urgency: "medium" },
        actionDueAt: null,
        actionOverdueByDays: null,
        isActionOverdue: false,
        riskReasons: ["Champion gone quiet - no inbound in 14+ days"],
      },
      NOW
    );
    expect(step).toMatchObject({
      kind: "steady",
      suggestion: "Review deal details",
      riskNote: "Risk 20%. Under 40% counts as low.",
      reasons: [{ text: "Champion gone quiet, no inbound in 14+ days", tier: "medium" }],
    });
  });

  it("closes the panel for won and lost deals", () => {
    expect(
      deriveNextStep({ ...atRisk, stage: "closed_won", lastActivityAt: at(9, 24) }, NOW)
    ).toMatchObject({ kind: "closed", outcome: "won", cycle: "55 days", range: "Aug 30 to Oct 24, 2026" });
    expect(deriveNextStep({ ...atRisk, stage: "closed_lost" }, NOW)).toMatchObject({
      kind: "closed",
      outcome: "lost",
    });
  });
});

describe("riskNote", () => {
  it("names the band the score falls in", () => {
    expect(riskNote(0.6)).toBe("Risk 60%. 60% or more counts as high.");
    expect(riskNote(0.45)).toBe("Risk 45%. Medium runs from 40% up to 60%.");
    expect(riskNote(0.1)).toBe("Risk 10%. Under 40% counts as low.");
  });
});

describe("buildActivity", () => {
  const timeline = [
    { id: "1", eventType: "stage_changed", metadata: { stage: "discover" }, createdAt: at(7, 30, 9) },
    { id: "2", eventType: "stage_changed", metadata: { stage: "closed_won" }, createdAt: at(9, 20) },
    { id: "3", eventType: "event_created", metadata: { eventType: "email_received" }, createdAt: at(9, 18, 11) },
    {
      id: "4",
      eventType: "email_drafted",
      metadata: { subject: "Revised order form" },
      createdAt: at(9, 18, 12),
    },
  ];

  it("lists one entry per thing that happened, newest first", () => {
    const entries = buildActivity(
      {
        createdAt: at(7, 30, 9),
        source: null,
        team: null,
        timeline,
        events: [{ id: "e1", type: "email_received", payload: {}, createdAt: at(9, 18, 11) }],
      },
      NOW
    );
    expect(entries.map((e) => e.title)).toEqual([
      "Moved to Closed won",
      "Follow-up drafted",
      "Email received",
      "Added in Discovery",
    ]);
    expect(entries[1]).toMatchObject({ detail: "Revised order form", when: "9 days ago" });
  });

  it("never shows a raw stage value", () => {
    const entries = buildActivity(
      { createdAt: at(7, 30, 9), source: null, team: null, timeline, events: [] },
      NOW
    );
    const text = entries.map((e) => `${e.title} ${e.detail ?? ""}`).join(" ");
    expect(text).not.toMatch(/closed_won|discover\b|_/);
  });

  it("keeps an older event that has no timeline row", () => {
    const entries = buildActivity(
      {
        createdAt: at(7, 30, 9),
        source: null,
        team: null,
        timeline: [],
        events: [{ id: "e1", type: "meeting_held", payload: { note: "Demo" }, createdAt: at(8, 1) }],
      },
      NOW
    );
    expect(entries[0]).toMatchObject({ title: "Meeting held", detail: "Demo", tone: "event" });
  });

  it("adds the creation entry when the deal came in without one", () => {
    const entries = buildActivity(
      { createdAt: at(7, 30, 9), source: "hubspot", team: null, timeline: [], events: [] },
      NOW
    );
    expect(entries).toEqual([
      expect.objectContaining({ id: "created", title: "Added from HubSpot", when: "58 days ago" }),
    ]);
  });

  it("reads dates that come back from the cache as strings", () => {
    const entries = buildActivity(
      {
        createdAt: at(7, 30, 9).toISOString(),
        source: null,
        team: null,
        timeline: timeline.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
        events: [],
      },
      NOW
    );
    expect(entries[0].title).toBe("Moved to Closed won");
  });
});

describe("rewordFactor", () => {
  it("has plain wording for every factor the win model produces", () => {
    const day = 86_400_000;
    const now = Date.now();
    const deal = (id: string, stage: string, risk: number, ageDays: number, idleDays: number) => ({
      id,
      name: id,
      stage,
      value: 50_000,
      createdAt: new Date(now - ageDays * day),
      lastActivityAt: new Date(now - idleDays * day),
      riskScore: risk,
    });
    const book = [
      deal("w1", "closed_won", 0, 40, 1),
      deal("w2", "closed_won", 0, 30, 2),
      deal("l1", "closed_lost", 0, 20, 3),
    ];
    const seen = new Set<string>();
    for (const stage of ["discover", "qualify", "proposal", "negotiation", "unknown"]) {
      for (const risk of [0.1, 0.5, 0.8]) {
        for (const idle of [1, 10, 40]) {
          for (const age of [5, 400]) {
            const factors = calculateWinProbability(deal("d", stage, risk, age, Math.min(idle, age)), book).factors;
            factors.forEach((f) => seen.add(f));
          }
        }
      }
    }
    expect(seen.size).toBeGreaterThan(6);
    for (const factor of seen) {
      expect(rewordFactor(factor), factor).not.toBeNull();
    }
  });

  it("rewrites the model's phrasing", () => {
    expect(rewordFactor("Historical win rate: 60%")).toEqual({
      text: "Your historical win rate is 60%",
      tier: "low",
    });
    expect(rewordFactor("Later stage (negotiation) tends to win more")?.text).toBe(
      "Later stages tend to win more"
    );
    expect(rewordFactor("High risk score reduces win probability")).toEqual({
      text: "A high risk score lowers the chance",
      tier: "high",
    });
  });
});

describe("parseBrief", () => {
  it("splits the ALL CAPS sections into labelled paragraphs", () => {
    expect(
      parseBrief("STATUS\n\nOpen 58 days.\nIt came in from HubSpot.\n\n**MOMENTUM**\n\nQuiet for 9 days.")
    ).toEqual([
      { label: "Status", text: "Open 58 days. It came in from HubSpot." },
      { label: "Momentum", text: "Quiet for 9 days." },
    ]);
  });

  it("keeps a brief without labels as plain paragraphs", () => {
    expect(parseBrief("One line.\n\nTwo lines\nhere.")).toEqual([
      { label: null, text: "One line." },
      { label: null, text: "Two lines here." },
    ]);
  });

  it("accepts markdown headings and drops bullet marks", () => {
    expect(parseBrief("## NEXT STEPS\n- Send the form.\n- Ask for a date.")).toEqual([
      { label: "Next steps", text: "Send the form. Ask for a date." },
    ]);
  });
});

describe("toMeetingView", () => {
  it("reads like the mockup", () => {
    expect(
      toMeetingView({
        id: "m1",
        title: "Pricing review",
        description: null,
        startTime: at(9, 29, 14),
        endTime: at(9, 29, 15),
        attendees: ["a@x.io", "b@x.io", "c@x.io"],
        location: "Zoom",
        meetingLink: null,
      })
    ).toMatchObject({
      month: "Oct",
      day: "29",
      when: "Thursday · 14:00 to 15:00 · Zoom",
      people: "3 attendees",
      link: null,
    });
  });
});

describe("buildDealView", () => {
  const deal: DealDetailInput = {
    id: "d1",
    name: "Meridian Health",
    stage: "negotiation",
    value: 310_000,
    status: "at_risk",
    riskScore: 0.66,
    riskReasons: ["Negotiation stalled without response"],
    primaryRiskReason: "Negotiation stalled without response",
    recommendedAction: { label: "Nudge for response", urgency: "high" },
    riskAgeInDays: 9,
    actionDueAt: at(9, 26, 9),
    actionOverdueByDays: 1,
    isActionOverdue: true,
    lastActivityAt: at(9, 18, 11),
    createdAt: at(7, 30, 9),
    isDemo: false,
    source: "hubspot",
    channel: "Outbound",
    location: null,
    team: null,
    assignedTo: null,
    timeline: [
      { id: "1", eventType: "stage_changed", metadata: { stage: "discover" }, createdAt: at(7, 30, 9) },
      { id: "2", eventType: "event_created", metadata: { eventType: "email_received" }, createdAt: at(9, 18, 11) },
    ],
    events: [],
  };

  it("writes the hero and the at-a-glance numbers", () => {
    const view = buildDealView({ deal, book: [], meetings: [], calendarConnected: true }, NOW);
    expect(view.hero).toEqual({
      chips: [
        { label: "High risk", tone: "alert" },
        { label: "Synced from HubSpot", tone: "neutral" },
      ],
      clause: "$310,000 in Negotiation, quiet for 9 days.",
      deck: "Negotiation stalled without response. Nudge for response is 1 day overdue.",
    });
    expect(view.kpis).toEqual({
      valueCaption: "Open 58 days, since Aug 30",
      riskPercent: 66,
      riskTier: "high",
      riskCaption: "High, for 9 days",
      lastActivity: "9 days",
      lastActivityCaption: "Email received, Oct 18",
    });
    expect(view.emailSub).toBe("$310,000 · Negotiation");
  });

  it("fills the details section from fields the page already loads", () => {
    const view = buildDealView({ deal, book: [], meetings: [], calendarConnected: true }, NOW);
    expect(view.details).toEqual([
      { label: "Location", value: "Not set" },
      { label: "Channel", value: "Outbound" },
      { label: "Team", value: "Personal" },
      { label: "Assigned to", value: "Unassigned" },
      { label: "Added", value: "Aug 30, 2026" },
      { label: "Source", value: "HubSpot" },
    ]);
  });

  it("describes a closed deal without risk language", () => {
    const view = buildDealView(
      {
        deal: { ...deal, stage: "closed_won", status: "closed", riskScore: 0, riskAgeInDays: null },
        book: [],
        meetings: [],
        calendarConnected: true,
      },
      NOW
    );
    expect(view.hero.chips[0]).toEqual({ label: "Closed won", tone: "good" });
    expect(view.hero.clause).toBe("$310,000, closed won.");
    expect(view.kpis.riskCaption).toBe("Closed won");
    expect(view.forecast.kind).toBe("closed");
  });
});
