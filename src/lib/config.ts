import type { Stage, Urgency } from "@/types";

export type { Stage, RiskLevel, Urgency, DealStatus, TimelineEventType } from "@/types";
export { HUMAN_ENGAGEMENT_EVENT_TYPES } from "@/types";

export const STAGES = {
  DISCOVER: "discover",
  QUALIFY: "qualify",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  CLOSED_WON: "closed_won",
  CLOSED_LOST: "closed_lost",
} as const satisfies Record<string, Stage>;

export const STAGE_ORDER: Record<string, number> = {
  discover: 1,
  qualify: 2,
  proposal: 3,
  negotiation: 4,
  closed_won: 5,
  closed_lost: 6,
  closed: 5,
};

export const STAGE_TO_SOURCE: Record<string, string> = {
  discover: "Direct",
  qualify: "Organic",
  proposal: "Paid Ads",
  negotiation: "Referrals",
  closed_won: "Partnerships",
  closed_lost: "Other",
  closed: "Partnerships",
};

export const STAGE_PRIORITY_FOR_RISK: Record<string, number> = {
  negotiation: 2,
  discover: 1,
};

export const STAGE_ICONS: Record<string, string> = {
  discover: "🔍",
  discovery: "🔍",
  qualify: "✓",
  qualification: "✓",
  proposal: "📄",
  negotiation: "🤝",
  closed_won: "🎉",
  "closed won": "🎉",
  closed_lost: "❌",
  "closed lost": "❌",
  closed: "🎉",
};

export const STAGE_UI_CONFIG = {
  discover: {
    order: 1,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  qualify: {
    order: 2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  proposal: {
    order: 3,
    color: "text-red-400",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-600/20",
    iconColor: "text-red-400",
  },
  negotiation: {
    order: 4,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  closed: {
    order: 5,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  closed_won: {
    order: 5,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  closed_lost: {
    order: 6,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    iconColor: "text-red-400",
  },
} as const;

export const RISK_THRESHOLDS = {
  LOW_MAX: 0.4,
  MEDIUM_HIGH_BOUNDARY: 0.6,
} as const;

export const INACTIVITY_DAYS = 7;

export const URGENCY_DAYS: Record<Urgency, number> = {
  high: 1,
  medium: 3,
  low: 7,
} as const;

export const HIGH_VALUE_THRESHOLD = 5000;

export type AiModelConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
  provider: "openrouter" | "anthropic" | "google";
};

export const AI_CONFIG = {
  embedding_search: {
    model: "text-embedding-3-large",
    temperature: 0.1,
    maxTokens: 1000,
    provider: "openrouter" as const,
  },
  financial_reasoning: {
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.3,
    maxTokens: 2000,
    provider: "openrouter" as const,
  },
  code_sql_generation: {
    model: "openai/gpt-4o",
    temperature: 0.2,
    maxTokens: 2000,
    provider: "openrouter" as const,
  },
  planning_multimodal: {
    model: "google/gemini-pro",
    temperature: 0.4,
    maxTokens: 2000,
    provider: "openrouter" as const,
  },
  general: {
    model: "openai/gpt-4-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    provider: "openrouter" as const,
  },
} as const satisfies Record<string, AiModelConfig>;

export const AI_EMBEDDING_SEARCH_CHAT_MODEL = "openai/gpt-4-turbo";

export const RISK_REASONS = {
  NO_ACTIVITY: "No activity threshold exceeded",
  NEGOTIATION_STALLED: "Negotiation stalled without response",
  HIGH_VALUE: "High value deal requires attention",
  COMPETITIVE_PRESSURE: "Competitive signals detected",
} as const;

export const TEAM_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export const STAGE_FORM_OPTIONS = [
  {
    value: STAGES.DISCOVER,
    label: "Discovery",
    icon: STAGE_ICONS.discover,
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Initial research & outreach",
  },
  {
    value: STAGES.QUALIFY,
    label: "Qualification",
    icon: STAGE_ICONS.qualify,
    color: "from-cyan-500 to-teal-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Assessing fit & budget",
  },
  {
    value: STAGES.PROPOSAL,
    label: "Proposal",
    icon: STAGE_ICONS.proposal,
    color: "from-red-600 to-red-500",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-600/30",
    description: "Presenting the solution",
  },
  {
    value: STAGES.NEGOTIATION,
    label: "Negotiation",
    icon: STAGE_ICONS.negotiation,
    color: "from-amber-500 to-orange-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Terms & pricing discussion",
  },
  {
    value: STAGES.CLOSED_WON,
    label: "Closed Won",
    icon: STAGE_ICONS.closed_won,
    color: "from-emerald-500 to-green-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Deal successfully closed",
  },
  {
    value: STAGES.CLOSED_LOST,
    label: "Closed Lost",
    icon: STAGE_ICONS.closed_lost,
    color: "from-red-500 to-rose-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Deal did not proceed",
  },
] as const;
