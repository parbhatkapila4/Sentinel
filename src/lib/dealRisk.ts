import type { RiskLevel, Urgency } from "@/types";
import {
  HIGH_VALUE_THRESHOLD,
  HUMAN_ENGAGEMENT_EVENT_TYPES,
  INACTIVITY_DAYS,
  RISK_REASONS,
  RISK_THRESHOLDS,
  STAGES,
  URGENCY_DAYS,
} from "./config";
import {
  detectCompetitiveSignals,
  getCompetitiveRiskAdjustment,
} from "./competitiveSignals";

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
  riskLevel: RiskLevel;
  status: string;
  nextAction: string | null;
  lastActivityAt: Date;
  reasons: string[];
  recommendedAction: {
    label: string;
    urgency: Urgency;
  } | null;
  riskStartedAt: Date | null;
  riskAgeInDays: number | null;
  actionDueAt: Date | null;
  actionOverdueByDays: number | null;
  isActionOverdue: boolean;
};

export function formatRiskLevel(score: number): RiskLevel {
  if (score < RISK_THRESHOLDS.LOW_MAX) return "Low";
  if (score < RISK_THRESHOLDS.MEDIUM_HIGH_BOUNDARY) return "Medium";
  return "High";
}

export function getPrimaryRiskReason(reasons: string[]): string | null {
  if (reasons.length === 0) return null;

  if (reasons.includes(RISK_REASONS.NO_ACTIVITY)) {
    return RISK_REASONS.NO_ACTIVITY;
  }

  if (reasons.includes(RISK_REASONS.NEGOTIATION_STALLED)) {
    return RISK_REASONS.NEGOTIATION_STALLED;
  }

  if (reasons.includes(RISK_REASONS.COMPETITIVE_PRESSURE)) {
    return RISK_REASONS.COMPETITIVE_PRESSURE;
  }

  if (reasons.includes(RISK_REASONS.HIGH_VALUE)) {
    return RISK_REASONS.HIGH_VALUE;
  }

  return reasons[0] || null;
}

export function calculateDealSignals(
  deal: DealInput,
  timelineEvents: TimelineEventInput[],
  options?: {
    inactivityThresholdDays?: number;
    enableCompetitiveSignals?: boolean;
  }
): DealSignals {
  const now = new Date();
  const inactivityThreshold = options?.inactivityThresholdDays ?? INACTIVITY_DAYS;
  const enableCompetitiveSignals = options?.enableCompetitiveSignals ?? true;

  const humanEvents = timelineEvents.filter((e) => {
    if (e.eventType === "event_created") {
      const metadata = e.metadata as Record<string, unknown> | null;
      if (!metadata || !metadata.eventType) return false;
      return HUMAN_ENGAGEMENT_EVENT_TYPES.includes(
        metadata.eventType as (typeof HUMAN_ENGAGEMENT_EVENT_TYPES)[number]
      );
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

  if (enableCompetitiveSignals) {
    const competitiveSignal = detectCompetitiveSignals(deal, timelineEvents);
    if (competitiveSignal.detected) {
      const adjustment = getCompetitiveRiskAdjustment(competitiveSignal);
      riskScore += adjustment;
      reasons.push(RISK_REASONS.COMPETITIVE_PRESSURE);
    }
  }

  if (deal.stage === STAGES.NEGOTIATION) {
    riskScore = 0.3;
  } else if (deal.stage === STAGES.DISCOVER) {
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
    return daysAgo <= inactivityThreshold;
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

  if (daysSinceLastActivity > inactivityThreshold) {
    riskScore += 0.4;
    reasons.push(`No activity in last ${inactivityThreshold} days`);
  }

  if (deal.stage === STAGES.NEGOTIATION) {
    const hasRecentEmailActivity = hasRecentEmailSent || hasRecentEmailReceived;
    if (!hasRecentEmailActivity) {
      riskScore += 0.4;
      reasons.push(RISK_REASONS.NEGOTIATION_STALLED);
    }
  }

  if (deal.value > HIGH_VALUE_THRESHOLD) {
    riskScore += 0.2;
    reasons.push(RISK_REASONS.HIGH_VALUE);
  }

  riskScore = Math.max(0, Math.min(riskScore, 1));

  let newStatus: string;
  if (deal.status === "saved" || deal.status === "lost") {
    newStatus = deal.status;
  } else {
    newStatus =
      riskScore >= RISK_THRESHOLDS.MEDIUM_HIGH_BOUNDARY ? "at_risk" : "active";
  }

  const primaryRiskReason = getPrimaryRiskReason(reasons);
  let recommendedAction: { label: string; urgency: Urgency } | null = null;

  if (primaryRiskReason === RISK_REASONS.NO_ACTIVITY) {
    recommendedAction = {
      label: "Send follow-up email",
      urgency: "high",
    };
  } else if (primaryRiskReason === RISK_REASONS.NEGOTIATION_STALLED) {
    recommendedAction = {
      label: "Nudge for response",
      urgency: "high",
    };
  } else if (primaryRiskReason === RISK_REASONS.HIGH_VALUE) {
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
      if (deal.stage === STAGES.NEGOTIATION) {
        scoreAtPoint = 0.3;
      } else if (deal.stage === STAGES.DISCOVER) {
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
        return daysAgo <= inactivityThreshold;
      });

      if (hasEmailSentAtPoint) scoreAtPoint -= 0.2;
      if (hasEmailReceivedAtPoint) scoreAtPoint -= 0.3;
      if (hasMeetingAtPoint) scoreAtPoint -= 0.4;

      if (daysSinceActivityAtPoint > inactivityThreshold) {
        scoreAtPoint += 0.4;
      }

      if (deal.stage === STAGES.NEGOTIATION) {
        const hasEmailActivity = hasEmailSentAtPoint || hasEmailReceivedAtPoint;
        if (!hasEmailActivity) {
          scoreAtPoint += 0.4;
        }
      }

      if (deal.value > HIGH_VALUE_THRESHOLD) {
        scoreAtPoint += 0.2;
      }

      scoreAtPoint = Math.max(0, Math.min(scoreAtPoint, 1));

      if (scoreAtPoint >= RISK_THRESHOLDS.MEDIUM_HIGH_BOUNDARY) {
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
    const dueDays = URGENCY_DAYS[recommendedAction.urgency];
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

  let escalatedRecommendedAction = recommendedAction;
  let escalatedRiskScore = riskScore;
  const escalatedReasons = [...reasons];

  if (isActionOverdue && newStatus === "at_risk" && recommendedAction) {
    const originalUrgency = recommendedAction.urgency;
    let escalatedUrgency: Urgency = originalUrgency;

    if (originalUrgency === "medium") {
      escalatedUrgency = "high";
    } else if (originalUrgency === "low") {
      escalatedUrgency = "medium";
    }

    escalatedRecommendedAction = {
      label: recommendedAction.label,
      urgency: escalatedUrgency,
    };

    if (actionOverdueByDays !== null && actionOverdueByDays > 0) {
      const overduePeriods = Math.floor(actionOverdueByDays / 2);
      const escalationDelta = overduePeriods * 0.1;
      escalatedRiskScore = Math.min(riskScore + escalationDelta, 1.0);

      escalatedReasons.push(
        `Action overdue by ${actionOverdueByDays} day${actionOverdueByDays !== 1 ? "s" : ""
        }`
      );
    }
  }

  const finalRiskScore = escalatedRiskScore;
  const finalRiskLevel = formatRiskLevel(finalRiskScore);
  let finalStatus = newStatus;

  if (deal.status !== "saved" && deal.status !== "lost") {
    finalStatus =
      finalRiskScore >= RISK_THRESHOLDS.MEDIUM_HIGH_BOUNDARY
        ? "at_risk"
        : "active";
  }

  const finalNextAction = finalStatus === "at_risk" ? "Follow up" : null;

  return {
    riskScore: finalRiskScore,
    riskLevel: finalRiskLevel,
    status: finalStatus,
    nextAction: finalNextAction,
    lastActivityAt,
    reasons: escalatedReasons,
    recommendedAction: escalatedRecommendedAction,
    riskStartedAt,
    riskAgeInDays,
    actionDueAt,
    actionOverdueByDays,
    isActionOverdue,
  };
}
