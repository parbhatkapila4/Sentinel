export interface SentinelDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  createdAt: Date;
  lastActivityAt: Date | null;
  riskScore: number;
  riskLevel?: string | null;
  status?: string | null;
  isDemo?: boolean;
  country?: string | null;
}

export interface TickerItem {
  tag: string;
  value: number;
  trend: "up" | "down" | "flat";
  note: string;
}

export interface BriefingItem {
  body: string;
  emphasis?: string;
}

export interface ShortListItem {
  id: string;
  index: number;
  name: string;
  segment: string;
  stage: string;
  stageNumber?: { current: number; total: number };
  location?: string;
  ageNote: string;
  ageSeverity: "low" | "medium" | "high" | "neutral";
  value: number;
  riskPercent: number;
  riskLabel: "HEALTHY" | "MEDIUM" | "HIGH";
}

export interface AIPanelContent {
  subject: string;
  question: string;
  answer: Array<
    | { kind: "text"; value: string }
    | { kind: "italic"; value: string }
    | { kind: "mark"; value: string }
  >;
  citations: string[];
  actions: Array<{ title: string; subtitle: string; href?: string }>;
  answeredAt: string;
  sourceCount: number;
}

export interface OnboardingState {
  isOnboarding: boolean;
  isDemoMode: boolean;
  crmConnected: boolean;
  crmEverSynced: boolean;
}
