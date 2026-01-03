export type Deal = {
  stage: string;
  value: number;
  lastActivityAt: Date;
  status: string;
};

export type TimelineEvent = {
  eventType: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

export type RiskCalculation = {
  score: number;
  reasons: string[];
};

export type DealRecommendation = {
  action: "send_follow_up_email" | "schedule_meeting" | "wait" | "escalate";
  reason: string;
};
export function calculateDealRisk(deal: Deal, timelineEvents: TimelineEvent[]) {
  let score = 0;
  const reasons: string[] = [];

  const now = new Date();
  const daysSinceLastActivity =
    (now.getTime() - new Date(deal.lastActivityAt).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysSinceLastActivity > 7) {
    score += 0.4;
    reasons.push("No activity in last 7 days");
  }

  if (deal.stage === "negotiation") {
    const recentEmailReceived = timelineEvents.some((e) => {
      if (e.eventType !== "event_created") return false;
      const metadata = e.metadata as Record<string, unknown> | null;
      if (!metadata || metadata.eventType !== "email_received") return false;
      return (
        (now.getTime() - new Date(e.createdAt).getTime()) /
          (1000 * 60 * 60 * 24) <=
        5
      );
    });

    if (!recentEmailReceived) {
      score += 0.4;
      reasons.push("Negotiation stalled without response");
    }
  }

  if (deal.value > 5000) {
    score += 0.2;
    reasons.push("High value deal requires attention");
  }

  score = Math.min(score, 1);

  const riskLevel = score >= 0.6 ? "High" : score >= 0.4 ? "Medium" : "Low";

  const status =
    score >= 0.6 && deal.status === "active" ? "at_risk" : deal.status;

  const nextAction =
    score >= 0.6 ? "Email" : deal.stage === "discover" ? "Wait" : null;

  return {
    score,
    riskLevel,
    status,
    nextAction,
    reasons,
  };
}

export function determineDealStatus(
  riskScore: number,
  currentStatus: string
): string {
  if (currentStatus === "saved" || currentStatus === "lost") {
    return currentStatus;
  }

  return riskScore >= 0.6 ? "at_risk" : "active";
}

export function formatRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 0.4) return "Low";
  if (score < 0.6) return "Medium";
  return "High";
}

export function determineNextBestAction(
  deal: Deal,
  timelineEvents: TimelineEvent[]
): DealRecommendation {
  const now = new Date();

  if (deal.status === "at_risk" && deal.stage === "negotiation") {
    return {
      action: "send_follow_up_email",
      reason: "Deal is at risk during negotiation with no recent response",
    };
  }

  if (deal.status === "at_risk") {
    const lastMeeting = timelineEvents
      .filter((e) => {
        if (e.eventType !== "event_created") return false;
        const metadata = e.metadata as Record<string, unknown> | null;
        return metadata && metadata.eventType === "meeting_held";
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!lastMeeting) {
      return {
        action: "schedule_meeting",
        reason: "Deal at risk with no recent meeting",
      };
    }

    const daysSinceMeeting =
      (now.getTime() - lastMeeting.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceMeeting > 14) {
      return {
        action: "schedule_meeting",
        reason: "Deal at risk with no recent meeting",
      };
    }
  }

  if (deal.stage === "proposal") {
    const recentEmailSent = timelineEvents.some((event) => {
      if (event.eventType !== "event_created") return false;
      const metadata = event.metadata as Record<string, unknown> | null;
      if (!metadata || metadata.eventType !== "email_sent") return false;
      const daysSinceEvent =
        (now.getTime() - event.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceEvent <= 3;
    });

    if (!recentEmailSent) {
      return {
        action: "send_follow_up_email",
        reason: "Proposal sent without follow-up",
      };
    }
  }

  if (deal.stage === "discover") {
    const daysSinceLastActivity =
      (now.getTime() - new Date(deal.lastActivityAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceLastActivity > 5) {
      return {
        action: "schedule_meeting",
        reason: "Discovery stalled without engagement",
      };
    }
  }

  return {
    action: "wait",
    reason: "Deal progressing normally",
  };
}
