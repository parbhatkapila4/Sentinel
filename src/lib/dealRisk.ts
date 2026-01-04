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
  recommendedAction: {
    label: string;
    urgency: "low" | "medium" | "high";
  } | null;
  riskStartedAt: Date | null;
  riskAgeInDays: number | null;
  actionDueAt: Date | null;
  actionOverdueByDays: number | null;
  isActionOverdue: boolean;
};

export function formatRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 0.4) return "Low";
  if (score < 0.6) return "Medium";
  return "High";
}

export function getPrimaryRiskReason(reasons: string[]): string | null {
  if (reasons.length === 0) return null;

  if (reasons.includes("No activity in last 7 days")) {
    return "No activity in last 7 days";
  }

  if (reasons.includes("Negotiation stalled without response")) {
    return "Negotiation stalled without response";
  }

  if (reasons.includes("High value deal requires attention")) {
    return "High value deal requires attention";
  }

  return reasons[0] || null;
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

  if (deal.stage === "negotiation") {
    riskScore = 0.3;
  } else if (deal.stage === "discover") {
    riskScore = 0.1;
  }

  const hasRecentEmailSent = humanEvents.some((e) => {
    const metadata = e.metadata as Record<string, unknown> | null;
    if (!metadata || metadata.eventType !== "email_sent") return false;
    const daysAgo =
      (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 5;
  });

  const hasRecentEmailReceived = humanEvents.some((e) => {
    const metadata = e.metadata as Record<string, unknown> | null;
    if (!metadata || metadata.eventType !== "email_received") return false;
    const daysAgo =
      (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 5;
  });

  const hasRecentMeeting = humanEvents.some((e) => {
    const metadata = e.metadata as Record<string, unknown> | null;
    if (!metadata || metadata.eventType !== "meeting_held") return false;
    const daysAgo =
      (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });

  if (hasRecentEmailSent) {
    riskScore -= 0.2;
  }

  if (hasRecentEmailReceived) {
    riskScore -= 0.3;
  }

  if (hasRecentMeeting) {
    riskScore -= 0.4;
  }

  if (daysSinceLastActivity > 7) {
    riskScore += 0.4;
    reasons.push("No activity in last 7 days");
  }

  if (deal.stage === "negotiation") {
    const hasRecentEmailActivity = hasRecentEmailSent || hasRecentEmailReceived;
    if (!hasRecentEmailActivity) {
      riskScore += 0.4;
      reasons.push("Negotiation stalled without response");
    }
  }

  if (deal.value > 5000) {
    riskScore += 0.2;
    reasons.push("High value deal requires attention");
  }

  riskScore = Math.max(0, Math.min(riskScore, 1));

  let newStatus: string;
  if (deal.status === "saved" || deal.status === "lost") {
    newStatus = deal.status;
  } else {
    newStatus = riskScore >= 0.6 ? "at_risk" : "active";
  }

  const nextAction = newStatus === "at_risk" ? "Follow up" : null;

  const primaryRiskReason = getPrimaryRiskReason(reasons);
  let recommendedAction: {
    label: string;
    urgency: "low" | "medium" | "high";
  } | null = null;

  if (primaryRiskReason === "No activity in last 7 days") {
    recommendedAction = {
      label: "Send follow-up email",
      urgency: "high",
    };
  } else if (primaryRiskReason === "Negotiation stalled without response") {
    recommendedAction = {
      label: "Nudge for response",
      urgency: "high",
    };
  } else if (primaryRiskReason === "High value deal requires attention") {
    recommendedAction = {
      label: "Review deal details",
      urgency: "medium",
    };
  }

  let riskStartedAt: Date | null = null;
  let riskAgeInDays: number | null = null;

  if (newStatus === "at_risk") {
    const sortedEvents = [...timelineEvents].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    for (let i = 0; i <= sortedEvents.length; i++) {
      const pointInTime =
        i < sortedEvents.length ? sortedEvents[i].createdAt : now;

      const eventsAtPoint = humanEvents.filter(
        (e) => e.createdAt <= pointInTime
      );

      const lastActivityAtPoint =
        eventsAtPoint.length > 0 ? eventsAtPoint[0].createdAt : deal.createdAt;

      const daysSinceActivityAtPoint = Math.floor(
        (pointInTime.getTime() - lastActivityAtPoint.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let scoreAtPoint = 0;
      if (deal.stage === "negotiation") {
        scoreAtPoint = 0.3;
      } else if (deal.stage === "discover") {
        scoreAtPoint = 0.1;
      }

      const hasEmailSentAtPoint = eventsAtPoint.some((e) => {
        const metadata = e.metadata as Record<string, unknown> | null;
        if (!metadata || metadata.eventType !== "email_sent") return false;
        const daysAgo =
          (pointInTime.getTime() - e.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysAgo <= 5;
      });

      const hasEmailReceivedAtPoint = eventsAtPoint.some((e) => {
        const metadata = e.metadata as Record<string, unknown> | null;
        if (!metadata || metadata.eventType !== "email_received") return false;
        const daysAgo =
          (pointInTime.getTime() - e.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysAgo <= 5;
      });

      const hasMeetingAtPoint = eventsAtPoint.some((e) => {
        const metadata = e.metadata as Record<string, unknown> | null;
        if (!metadata || metadata.eventType !== "meeting_held") return false;
        const daysAgo =
          (pointInTime.getTime() - e.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      });

      if (hasEmailSentAtPoint) scoreAtPoint -= 0.2;
      if (hasEmailReceivedAtPoint) scoreAtPoint -= 0.3;
      if (hasMeetingAtPoint) scoreAtPoint -= 0.4;

      if (daysSinceActivityAtPoint > 7) {
        scoreAtPoint += 0.4;
      }

      if (deal.stage === "negotiation") {
        const hasEmailActivity = hasEmailSentAtPoint || hasEmailReceivedAtPoint;
        if (!hasEmailActivity) {
          scoreAtPoint += 0.4;
        }
      }

      if (deal.value > 5000) {
        scoreAtPoint += 0.2;
      }

      scoreAtPoint = Math.max(0, Math.min(scoreAtPoint, 1));

      if (scoreAtPoint >= 0.6) {
        riskStartedAt = pointInTime;
        break;
      }
    }

    if (!riskStartedAt) {
      riskStartedAt = now;
    }

    riskAgeInDays = Math.floor(
      (now.getTime() - riskStartedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  let actionDueAt: Date | null = null;
  let actionOverdueByDays: number | null = null;
  let isActionOverdue = false;

  if (recommendedAction && riskStartedAt) {
    const urgencyDays = {
      high: 1,
      medium: 3,
      low: 7,
    };

    const dueDays = urgencyDays[recommendedAction.urgency];
    actionDueAt = new Date(
      riskStartedAt.getTime() + dueDays * 24 * 60 * 60 * 1000
    );

    if (now > actionDueAt) {
      actionOverdueByDays = Math.floor(
        (now.getTime() - actionDueAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      isActionOverdue = actionOverdueByDays > 0;
    }
  }

  return {
    riskScore,
    riskLevel: formatRiskLevel(riskScore),
    status: newStatus,
    nextAction,
    lastActivityAt,
    reasons,
    recommendedAction,
    riskStartedAt,
    riskAgeInDays,
    actionDueAt,
    actionOverdueByDays,
    isActionOverdue,
  };
}
