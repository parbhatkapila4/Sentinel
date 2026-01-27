import type { EmailTone } from "@/types";

export interface FollowUpEmailDealContext {
  dealName: string;
  dealValue: number;
  stage: string;
  daysSinceActivity: number;
  lastInteractionType: string;
  riskReasons: string[];
  primaryRiskReason: string | null;
  recommendedAction: string | null;
  previousCommunicationPatterns: string[];
}

export function getFollowUpEmailPrompt(
  deal: FollowUpEmailDealContext,
  tone: EmailTone
): string {
  const toneInstructions: Record<EmailTone, string> = {
    professional:
      "Use a polished, business-appropriate tone. Be direct and respectful. Avoid slang or overly casual language.",
    friendly:
      "Use a warm, approachable tone. It's okay to be slightly informal while remaining professional. Show genuine interest.",
    urgent:
      "Convey appropriate urgency without being pushy. Be concise and action-oriented. Highlight time-sensitivity where relevant.",
  };

  const riskBlock =
    deal.riskReasons.length > 0 || deal.primaryRiskReason
      ? `
RISK CONTEXT:
- Primary risk: ${deal.primaryRiskReason ?? "None"}
- Risk factors: ${deal.riskReasons.join("; ") || "None"}
- Recommended action: ${deal.recommendedAction ?? "None"}`
      : "";

  const patternsBlock =
    deal.previousCommunicationPatterns.length > 0
      ? `
PREVIOUS COMMUNICATION PATTERNS:
${deal.previousCommunicationPatterns.map((p) => `- ${p}`).join("\n")}`
      : "";

  return `You are a sales professional writing a follow-up email for Sentinel, a revenue intelligence platform.

DEAL CONTEXT:
- Company/Deal: ${deal.dealName}
- Value: $${deal.dealValue.toLocaleString()}
- Stage: ${deal.stage}
- Last contact: ${deal.daysSinceActivity} days ago
- Last interaction: ${deal.lastInteractionType}
${riskBlock}
${patternsBlock}

TONE: ${tone}
${toneInstructions[tone]}

Write a concise, personalized follow-up email that:
1. References the previous interaction naturally (if we have that context)
2. Provides value (insight, resource, or brief update)
3. Has a clear, low-friction call-to-action (e.g. short call, reply with feedback, quick sync)
4. Feels human and personalized, not templated
5. Is 2–4 short paragraphs; avoid long blocks of text

Respond with valid JSON only, no markdown or extra text:
{
  "subject": "Subject line here",
  "body": "Email body here. Use \\n for line breaks.",
  "suggestedSendTime": "ISO 8601 date string for when to send (e.g. next business morning)"
}`;
}

export const FOLLOW_UP_EMAIL_SYSTEM_PROMPT = `You are a sales email expert. You output only valid JSON. No markdown, no code fences, no explanation.`;

export function getDealSummaryPrompt(deal: {
  name: string;
  stage: string;
  value: number;
  status: string;
  riskLevel: string;
  primaryRiskReason: string | null;
  lastActivityAt: Date;
  timelineSummary: string;
  eventsSummary: string;
}): string {
  return `You are a sales analyst for Sentinel. Summarize this deal concisely.

DEAL:
- Name: ${deal.name}
- Stage: ${deal.stage}
- Value: $${deal.value.toLocaleString()}
- Status: ${deal.status}
- Risk: ${deal.riskLevel}
- Primary risk reason: ${deal.primaryRiskReason ?? "None"}
- Last activity: ${deal.lastActivityAt.toISOString().slice(0, 10)}

TIMELINE (recent):
${deal.timelineSummary}

EVENTS:
${deal.eventsSummary}

Provide a formatted summary (plain text, 4–6 short paragraphs) covering:
1. Current status and health (2–3 sentences)
2. Key milestones and timeline highlights
3. Risks and concerns, if any
4. Recommended next steps

Keep it scannable. Use short paragraphs and bullet points where helpful.`;
}

export function getWinStrategyPrompt(deal: {
  name: string;
  stage: string;
  value: number;
  primaryRiskReason: string | null;
  timelineSummary: string;
}): string {
  return `You are a sales strategist for Sentinel. Create a win strategy for this deal.

DEAL:
- Name: ${deal.name}
- Stage: ${deal.stage}
- Value: $${deal.value.toLocaleString()}
- Risk/concerns: ${deal.primaryRiskReason ?? "None"}

TIMELINE:
${deal.timelineSummary}

Generate a structured win strategy. Respond with valid JSON only, no markdown:
{
  "talkingPoints": ["point1", "point2", "..."],
  "objectionHandling": [
    { "objection": "Possible objection", "response": "Suggested response" }
  ],
  "timelineSuggestions": ["suggestion1", "suggestion2", "..."],
  "summary": "2–3 sentence executive summary of the strategy"
}`;
}

export const WIN_STRATEGY_SYSTEM_PROMPT = `You are a sales strategy expert. Output only valid JSON. No markdown, no code fences.`;
