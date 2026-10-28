import { differenceInCalendarDays, format, isSameDay } from "date-fns";
import type { AISession, SessionCategory } from "@/components/sentinel/ai/types";

export interface AIPrompt {
  key: string;
  title: string;
  emphasis: string;
  sub: string;
  tag: string;
  prompt: string;
}

export interface AIBook {
  activeDeals: number;
  openValue: number;
  flagged: number;
  overdue: number;
  likely: number;
}

export interface AISource {
  key: string;
  name: string;
  monogram: string;
  kind: string;
  connected: boolean;
  syncedAt: string | null;
}

export interface ThreadGroup {
  label: string;
  sessions: AISession[];
}

const CATEGORY_LABEL: Record<SessionCategory, string> = {
  "WIN/LOSS": "Win and loss",
  FORECAST: "Forecast",
  OUTREACH: "Outreach",
  PRIORITY: "Priority",
  RISK: "Risk",
  ANALYSIS: "Analysis",
  RESEARCH: "Research",
  REPORT: "Report",
  GENERAL: "General",
};

export function categoryLabel(category: SessionCategory): string {
  return CATEGORY_LABEL[category] ?? "General";
}

export function groupThreads(sessions: AISession[], now: Date): ThreadGroup[] {
  const groups: ThreadGroup[] = [
    { label: "Today", sessions: [] },
    { label: "This week", sessions: [] },
    { label: "Earlier", sessions: [] },
  ];
  for (const session of sessions) {
    const diff = differenceInCalendarDays(now, new Date(session.updatedAt));
    const index = diff <= 0 ? 0 : diff < 7 ? 1 : 2;
    groups[index].sessions.push(session);
  }
  return groups.filter((g) => g.sessions.length > 0);
}

export function threadWhen(iso: string, now: Date): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (isSameDay(date, now)) return format(date, "HH:mm");
  const diff = differenceInCalendarDays(now, date);
  if (diff > 0 && diff < 7) return format(date, "EEE");
  return format(date, "MMM d");
}

export function messageCountLabel(count: number): string {
  return `${count} message${count === 1 ? "" : "s"}`;
}

export function syncedLabel(iso: string | null, now: Date): string {
  if (!iso) return "connected";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "connected";
  return `synced ${isSameDay(date, now) ? format(date, "HH:mm") : format(date, "MMM d")}`;
}

export const MODE_LABEL = {
  RESEARCH: "Research",
  DRAFT: "Draft",
  FAST: "Fast",
} as const;
