export const WEBHOOK_EVENTS = [
  { value: "deal.created", label: "Deal created" },
  { value: "deal.stage_changed", label: "Stage changed" },
  { value: "deal.at_risk", label: "Deal at risk" },
  { value: "deal.closed_won", label: "Closed won" },
  { value: "deal.closed_lost", label: "Closed lost" },
] as const;

const LABELS: Record<string, string> = Object.fromEntries(
  WEBHOOK_EVENTS.map((e) => [e.value, e.label])
);

export function eventLabel(value: string): string {
  const known = LABELS[value];
  if (known) return known;
  const words = value.replace(/[._]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
}
