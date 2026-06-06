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
- Value: $${deal.dealValue.toLocaleString("en-US")}
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
5. Is 2-4 short paragraphs; avoid long blocks of text

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
- Value: $${deal.value.toLocaleString("en-US")}
- Status: ${deal.status}
- Risk: ${deal.riskLevel}
- Primary risk reason: ${deal.primaryRiskReason ?? "None"}
- Last activity: ${deal.lastActivityAt.toISOString().slice(0, 10)}

TIMELINE (recent):
${deal.timelineSummary}

EVENTS:
${deal.eventsSummary}

Write a founder-grade executive brief on this deal: substantive,
considered, the way a CEO would read it on a Monday morning before
deciding where to spend the week's attention. The deal name and value
are already shown above the brief — do NOT repeat them as a title.

Structure: four sections, each prefixed by an ALL CAPS label on its
own line, followed by a blank line, followed by 3-5 sentences of
real prose. Aim for roughly 220-300 words total — long enough that the
reader closes the brief understanding the SHAPE of the deal, not just
its label. Short enough to read in under a minute.

STATUS
Where the deal sits today and what the numbers actually mean. Stage,
status, risk rating, value relative to the pipeline. Don't just
restate the data above — interpret it. Why is the risk grade what it
is? What does this stage imply about urgency and what's expected of
the team next?

MOMENTUM
What has actually happened on this deal recently. Reference concrete
dates, the cadence of activity, which side has been driving. Call out
whether engagement is healthy, cooling, or accelerating, and what the
timeline pattern implies about buyer intent. Cite the specific events
and timeline entries provided.

RISK
What could go wrong, in specific terms. Name the actual concerns
(competitive pressure, pricing, stakeholder gaps, timeline drift,
inactivity, sentiment, etc.) and explain why each one matters for
THIS deal at THIS stage and value. If nothing material is surfacing,
say so plainly in one sentence rather than padding.

NEXT
Two or three concrete plays the team should run this week. Each must
earn its place: tie it back to a specific risk or momentum signal
above so the reader sees the through-line. Avoid generic CRM advice
("follow up regularly", "stay engaged") — be specific to this deal.

Hard constraints — the brief is rendered with editorial typography
and any markdown character will be visible as a glyph on the page:
- No # or ## hashes. No **bold** or __bold__. No * or _ italics.
- No bullet points of any kind (no -, *, •, or numbered lists).
- No backticks. No tables. No markdown of any kind.
- Plain prose only. Section labels are the ONLY all-caps lines.
- Refer to the deal by specific details (dates, stages, values, named
  events) rather than abstract CRM platitudes.`;
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
- Value: $${deal.value.toLocaleString("en-US")}
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
  "summary": "2-3 sentence executive summary of the strategy"
}`;
}

export const WIN_STRATEGY_SYSTEM_PROMPT = `You are a sales strategy expert. Output only valid JSON. No markdown, no code fences.`;
