
export const STAGE_VALUES = [
  "discover",
  "qualify",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;

export type Stage = (typeof STAGE_VALUES)[number];

export type RiskLevel = "Low" | "Medium" | "High";

export const URGENCY_VALUES = ["low", "medium", "high"] as const;

export type Urgency = (typeof URGENCY_VALUES)[number];

export const DEAL_STATUS_VALUES = ["active", "at_risk", "saved", "lost", "closed"] as const;

export type DealStatus = (typeof DEAL_STATUS_VALUES)[number];

export const TIMELINE_EVENT_TYPE_VALUES = [
  "event_created",
  "stage_changed",
  "risk_evaluated",
  "activity",
  "email_sent",
  "email_received",
  "meeting_held",
  "email_drafted",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPE_VALUES)[number];

export const HUMAN_ENGAGEMENT_EVENT_TYPES = [
  "email_sent",
  "email_received",
  "meeting_held",
] as const;

export type HumanEngagementEventType =
  (typeof HUMAN_ENGAGEMENT_EVENT_TYPES)[number];

export type DealForAnalytics = {
  id: string;
  stage: string;
  value: number;
  createdAt: Date;
  lastActivityAt?: Date;
  riskScore: number;
  status?: string;
  recommendedAction?: { label: string; urgency: string } | null;
  isActionOverdue?: boolean;
};

export type PipelineMetrics = {
  totalValue: number;
  totalDeals: number;
  avgDealValue: number;
};

export type RevenueGrowth = {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  growthPercent: number;
};

export type ChartDataPoint = {
  month: string;
  actual: number;
  prediction: number;
  lastMonth?: number;
};

export type RevenueSource = {
  source: string;
  value: number;
  change: number;
};

export type RiskDistribution = {
  low: { count: number; value: number };
  medium: { count: number; value: number };
  high: { count: number; value: number };
};

export type DealActivityMetrics = {
  recentDeals: DealForAnalytics[];
  thirtyDayDeals: DealForAnalytics[];
  recentDealsValue: number;
  thirtyDayValue: number;
  avgDealAge: number;
  avgDaysSinceActivity: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
};

export const TEAM_ROLE_VALUES = ["owner", "admin", "member", "viewer"] as const;

export type TeamRole = (typeof TEAM_ROLE_VALUES)[number];

export type Team = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: Date;
};

export type TeamInvite = {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

export type TeamWithMemberCount = Team & {
  memberCount: number;
  myRole: TeamRole;
};

export type TeamMemberWithUser = TeamMember & {
  user: { id: string; name: string | null; surname: string | null; email: string };
};

export type TeamWithMembers = Team & {
  members: TeamMemberWithUser[];
};

export type GetDealsOptions = {
  teamId?: string;
  includeTeamDeals?: boolean;
};

export type DealBase = {
  id: string;
  userId: string;
  teamId: string | null;
  assignedToId: string | null;
  name: string;
  stage: string;
  value: number;
  createdAt: Date;
  [key: string]: unknown;
};

export const EMAIL_TONE_VALUES = [
  "professional",
  "friendly",
  "urgent",
] as const;

export type EmailTone = (typeof EMAIL_TONE_VALUES)[number];

export type GeneratedEmail = {
  subject: string;
  body: string;
  suggestedSendTime: Date;
};

export type DealSummary = {
  statusAndHealth: string;
  milestones: string[];
  risks: string[];
  recommendedNextSteps: string[];
  raw?: string;
};

export type WinStrategy = {
  talkingPoints: string[];
  objectionHandling: Array<{ objection: string; response: string }>;
  timelineSuggestions: string[];
  summary: string;
};

export type PredictionConfidence = "low" | "medium" | "high";

export type DaysToClosePrediction = {
  estimatedDays: number;
  confidence: PredictionConfidence;
  factors: string[];
};

export type WinProbabilityTrend = "up" | "down" | "stable";

export type WinProbability = {
  probability: number;
  trend: WinProbabilityTrend;
  factors: string[];
};

export type DealPatternInsight = {
  type: string;
  description: string;
  metric?: string;
  impact?: "positive" | "negative" | "neutral";
};

export type DealPatterns = {
  insights: DealPatternInsight[];
  recommendations: string[];
};

export type SimilarDeal = {
  id: string;
  name: string;
  stage: string;
  value: number;
  outcome: "won" | "lost";
  daysToClose?: number;
};

export type SimilarDealsResult = {
  similar: SimilarDeal[];
  winRate: number;
  avgDaysToClose: number;
};

export type PipelineForecast = {
  expected: number;
  bestCase: number;
  worstCase: number;
  monthly: Array<{ month: string; value: number; bestCase?: number; worstCase?: number }>;
};

export type AnomalySeverity = "low" | "medium" | "high";

export type DealAnomaly = {
  deal: { id: string; name: string; stage: string; value: number };
  reason: string;
  severity: AnomalySeverity;
};

export type AnomaliesResult = {
  anomalies: DealAnomaly[];
};
