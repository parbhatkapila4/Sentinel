export type SessionCategory =
  | "WIN/LOSS"
  | "FORECAST"
  | "OUTREACH"
  | "PRIORITY"
  | "RISK"
  | "ANALYSIS"
  | "RESEARCH"
  | "REPORT"
  | "GENERAL";

export interface AISession {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
  category: SessionCategory;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AIBookFact {
  label: string;
  highlight: string;
  rest: string;
}

export interface AIConnectedSource {
  name: string;
  kind: "CRM" | "CALLS" | "EMAIL" | "SLACK" | "CALENDAR" | "OTHER";
  metaLine: string;
  connected: boolean;
}

export interface AIRecentAnswer {
  id: string;
  question: string;
  when: string;
  meta: string;
}

export interface AIPromptCard {
  index: string;
  title: string;
  italicWord: string;
  sub: string;
  tag: string;
  tone: "copper" | "ivy" | "cream" | "signal";
  icon: "check" | "dollar" | "chart" | "bolt";
  prompt: string;
}

export interface AIShellMeta {
  sessionOrdinal: string;
  modelLabel: string;
  ctxLabel: string;
}
