const POSITIVE_TERMS = [
  "great",
  "good",
  "excellent",
  "love",
  "ready",
  "approved",
  "confident",
  "excited",
  "moving forward",
  "signed",
];

const NEGATIVE_TERMS = [
  "delay",
  "blocked",
  "concern",
  "risk",
  "issue",
  "problem",
  "churn",
  "hold",
  "uncertain",
  "competitor",
  "budget cut",
];

export type SentimentLabel = "positive" | "neutral" | "negative";

export function scoreSentiment(input: string): {
  score: number;
  label: SentimentLabel;
} {
  const text = input.toLowerCase();
  let score = 0;

  for (const term of POSITIVE_TERMS) {
    if (text.includes(term)) score += 1;
  }
  for (const term of NEGATIVE_TERMS) {
    if (text.includes(term)) score -= 1;
  }

  const normalized = Math.max(-1, Math.min(1, score / 4));
  const label: SentimentLabel =
    normalized > 0.2 ? "positive" : normalized < -0.2 ? "negative" : "neutral";

  return { score: normalized, label };
}
