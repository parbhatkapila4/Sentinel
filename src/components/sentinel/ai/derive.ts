import { differenceInCalendarDays, isToday } from "date-fns";
import type { AISession, SessionCategory } from "./types";

export function categorizeSession(title: string): SessionCategory {
  const t = title.toLowerCase();
  if (/win|lost|loss|closed/.test(t)) return "WIN/LOSS";
  if (/forecast|pipeline|pipeline health/.test(t)) return "FORECAST";
  if (/email|follow-?up|outreach|reach out|draft/.test(t)) return "OUTREACH";
  if (/prioriti|top deal|which deal|focus/.test(t)) return "PRIORITY";
  if (/risk|at risk|slipping|stall/.test(t)) return "RISK";
  if (/compare|benchmark|analy[sz]e|analy[sz]is|segment/.test(t)) return "ANALYSIS";
  if (/summari[sz]e|call|meeting|research/.test(t)) return "RESEARCH";
  if (/report|stage-?conversion|breakdown/.test(t)) return "REPORT";
  return "GENERAL";
}

export interface SessionGroup {
  label: string;
  sessions: AISession[];
}

export function groupSessions(
  sessions: AISession[],
  now: Date
): SessionGroup[] {
  const buckets: Record<string, AISession[]> = {};
  const order: string[] = [];

  const push = (label: string, s: AISession) => {
    if (!(label in buckets)) {
      buckets[label] = [];
      order.push(label);
    }
    buckets[label].push(s);
  };

  for (const s of sessions) {
    const d = new Date(s.updatedAt);
    const diff = differenceInCalendarDays(now, d);
    let label: string;
    if (diff === 0) label = "TODAY";
    else if (diff === 1) label = "YESTERDAY";
    else if (diff < 7) label = `${diff} DAYS AGO`;
    else if (diff < 14) label = "LAST WEEK";
    else if (diff < 30) label = `${Math.floor(diff / 7)} WEEKS AGO`;
    else if (diff < 365) label = "EARLIER";
    else label = "ARCHIVE";
    push(label, s);
  }

  return order.map((label) => ({ label, sessions: buckets[label] }));
}

export function countSessionsToday(sessions: AISession[]): number {
  return sessions.filter((s) => isToday(new Date(s.createdAt))).length;
}

export function formatSessionOrdinal(totalChats: number): string {
  const n = Math.max(totalChats, 0) + 1;
  return `#${String(n).padStart(3, "0")}`;
}

export { formatShortMoney } from "@/lib/format-money";
