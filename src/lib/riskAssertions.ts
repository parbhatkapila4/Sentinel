export function assertRiskFieldIntegrity(deal: {
  id?: unknown;
  riskScore?: unknown;
  riskLevel?: unknown;
  status?: unknown;
  recommendedAction?: unknown;
  [key: string]: unknown;
}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const warnings: string[] = [];

  if ("riskLevel" in deal && deal.riskLevel !== undefined) {
    if (!("riskScore" in deal) || deal.riskScore === undefined) {
      warnings.push(
        `Deal ${(deal.id as string) || "unknown"
        }: riskLevel exists without riskScore (may indicate persisted risk field)`
      );
    }
  }

  const legacyFields = ["riskEvaluatedAt", "nextActionReason"];
  for (const field of legacyFields) {
    if (field in deal && deal[field] !== undefined) {
      warnings.push(
        `Deal ${(deal.id as string) || "unknown"
        }: Found legacy persisted field '${field}' (should be removed from DB)`
      );
    }
  }

  if (warnings.length > 0) {
    console.warn("[Risk Assertions]", warnings.join("; "));
  }
}
