type DealInput = {
  stage: string;
  value: number;
  status: string;
  createdAt: Date;
};

type TimelineEventInput = {
  eventType: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

export type DealSignals = {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  status: string;
  nextAction: string | null;
  lastActivityAt: Date;
  reasons: string[];
};

export function formatRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 0.4) return "Low";
  if (score < 0.6) return "Medium";
  return "High";
}

export function calculateDealSignals(
  deal: DealInput,
  timelineEvents: TimelineEventInput[]
): DealSignals {
  const now = new Date();

  const HUMAN_ENGAGEMENT_EVENTS = [
    "email_sent",
    "email_received",
    "meeting_held",
  ];

  const humanEvents = timelineEvents.filter((e) => {
    if (e.eventType === "event_created") {
      const metadata = e.metadata as Record<string, unknown> | null;
      if (!metadata || !metadata.eventType) return false;
      return HUMAN_ENGAGEMENT_EVENTS.includes(metadata.eventType as string);
    }

    return false;
  });

  const lastActivityAt =
    humanEvents.length > 0 ? humanEvents[0].createdAt : deal.createdAt;

  const daysSinceLastActivity = Math.floor(
    (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  let riskScore = 0;
  const reasons: string[] = [];

  if (daysSinceLastActivity > 7) {
    riskScore += 0.4;
    reasons.push("No activity in last 7 days");
  }

  const hasRecentInboundEmail = humanEvents.some((e) => {
    const metadata = e.metadata as Record<string, unknown> | null;
    if (!metadata || metadata.eventType !== "email_received") return false;
    const daysAgo =
      (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 5;
  });

  if (deal.stage === "negotiation") {
    if (!hasRecentInboundEmail) {
      riskScore += 0.4;
      reasons.push("Negotiation stalled without response");
    }
  }

  if (deal.value > 5000) {
    riskScore += 0.2;
    reasons.push("High value deal requires attention");
  }

  riskScore = Math.min(riskScore, 1);

  let newStatus: string;
  if (deal.status === "saved" || deal.status === "lost") {
    newStatus = deal.status;
  } else {
    newStatus = riskScore >= 0.6 ? "at_risk" : "active";
  }

  let nextAction: string | null = null;

  if (
    newStatus === "at_risk" &&
    deal.stage === "negotiation" &&
    !hasRecentInboundEmail
  ) {
    nextAction = "Send follow-up email";
  } else if (deal.stage === "discover" && timelineEvents.length === 0) {
    nextAction = "Wait";
  } else if (deal.stage === "proposal" && daysSinceLastActivity > 3) {
    nextAction = "Schedule meeting";
  }

  return {
    riskScore,
    riskLevel: formatRiskLevel(riskScore),
    status: newStatus,
    nextAction,
    lastActivityAt,
    reasons,
  };
}
