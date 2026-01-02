type Deal = {
  stage: string;
  value: number;
  lastActivityAt: Date;
  status: string;
};

type DealEvent = {
  type: string;
  createdAt: Date;
};

export type RiskCalculation = {
  score: number;
  reasons: string[];
};

export function calculateDealRisk(
  deal: Deal,
  events: DealEvent[]
): RiskCalculation {
  let score = 0;
  const reasons: string[] = [];

  const now = new Date();

  const daysSinceLastActivity =
    (now.getTime() - new Date(deal.lastActivityAt).getTime()) /
    (1000 * 60 * 60 * 24);

  const hasInactivity = daysSinceLastActivity >= 7;

  const isNegotiation = deal.stage === "negotiation";

  const hasRecentEmailReceived = events.some((event) => {
    if (event.type !== "email_received") return false;

    const daysSinceEvent =
      (now.getTime() - new Date(event.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);

    return daysSinceEvent <= 5;
  });

  const hasNegotiationStall = isNegotiation && !hasRecentEmailReceived;

  const isHighValue = deal.value > 5000;

  if (hasInactivity) {
    score += 0.4;
    reasons.push("No activity in last 7 days");
  }

  if (hasNegotiationStall) {
    score += 0.4;
    reasons.push("Negotiation stalled without response");
  }

  if (isHighValue) {
    score += 0.2;
    reasons.push("High value deal requires attention");
  }

  score = Math.min(score, 1.0);

  return { score, reasons };
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
