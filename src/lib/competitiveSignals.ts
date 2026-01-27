
type TimelineEventInput = {
  eventType: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

type DealInput = {
  stage: string;
  value: number;
  createdAt: Date;
};

const COMPETITOR_KEYWORDS = [
  "competitor",
  "competition",
  "alternative",
  "comparing",
  "evaluating options",
  "other vendor",
  "other solution",
  "switching",
  "migration",
  "pricing comparison",
  "better offer",
  "lower price",
  "cheaper alternative",
];

const COMPETITIVE_PRESSURE_PHRASES = [
  "looking at other options",
  "considering alternatives",
  "evaluating other vendors",
  "comparing solutions",
  "price shopping",
  "getting quotes",
  "multiple vendors",
  "decision delayed",
  "need to think",
  "taking longer than expected",
];

export type CompetitiveSignal = {
  detected: boolean;
  severity: "low" | "medium" | "high";
  indicators: string[];
  reason: string | null;
};

export function detectCompetitiveSignals(
  deal: DealInput,
  timelineEvents: TimelineEventInput[]
): CompetitiveSignal {
  const indicators: string[] = [];
  let severity: "low" | "medium" | "high" = "low";

  const textEvents = timelineEvents.filter((e) => {
    if (e.eventType !== "event_created") return false;
    const metadata = e.metadata as Record<string, unknown> | null;
    if (!metadata) return false;

    const eventType = metadata.eventType as string;
    return ["email_sent", "email_received", "note_added", "call_held"].includes(eventType);
  });

  for (const event of textEvents) {
    const metadata = event.metadata as Record<string, unknown> | null;
    if (!metadata) continue;

    const text = (
      (metadata.subject as string) ||
      (metadata.body as string) ||
      (metadata.content as string) ||
      (metadata.note as string) ||
      (metadata.description as string) ||
      ""
    ).toLowerCase();

    for (const keyword of COMPETITOR_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        indicators.push(`Competitor mention: "${keyword}"`);
        if (severity === "low") severity = "medium";
        break;
      }
    }

    for (const phrase of COMPETITIVE_PRESSURE_PHRASES) {
      if (text.includes(phrase.toLowerCase())) {
        indicators.push(`Competitive pressure: "${phrase}"`);
        if (severity === "low") severity = "medium";
        break;
      }
    }
  }

  if (deal.stage === "negotiation" && deal.value > 10000) {
    indicators.push("High-value deal in negotiation stage");
    if (severity === "low") severity = "medium";
  }

  if (indicators.length >= 2) {
    severity = "high";
  }

  if (deal.stage === "negotiation") {
    const now = new Date();
    const dealAge = Math.floor(
      (now.getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dealAge > 30) {
      indicators.push(`Extended negotiation period (${dealAge} days)`);
      if (severity === "low") severity = "medium";
    }
  }

  const detected = indicators.length > 0;
  const reason = detected
    ? `Competitive signals detected: ${indicators.length} indicator${indicators.length !== 1 ? "s" : ""}`
    : null;

  return {
    detected,
    severity,
    indicators,
    reason,
  };
}

export function getCompetitiveRiskAdjustment(signal: CompetitiveSignal): number {
  if (!signal.detected) return 0;

  switch (signal.severity) {
    case "high":
      return 0.25;
    case "medium":
      return 0.15;
    case "low":
      return 0.1;
    default:
      return 0;
  }
}
