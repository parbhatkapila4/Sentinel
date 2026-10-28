import { format } from "date-fns";
import {
  DEAL_CHANNEL_LABELS,
  HUMAN_ENGAGEMENT_EVENT_TYPES,
  RISK_REASONS,
  RISK_THRESHOLDS,
  STAGE_FORM_OPTIONS,
  normalizeChannel,
  normalizeStage,
} from "@/lib/config";
import { formatRiskLevel } from "@/lib/dealRisk";
import {
  calculateWinProbability,
  findSimilarDeals,
  predictDaysToClose,
  type DealForPrediction,
} from "@/lib/predictions";
import type { HeroChip, PillTone, TierKey } from "../blocks";
import { daysLabel } from "../book";
import { fullCurrency, sentenceCase } from "../format";

export type DateInput = Date | string | number | null | undefined;

const DAY_MS = 86_400_000;
const SAME_MOMENT_MS = 2 * 60_000;

export function toMs(value: DateInput): number | null {
  if (value === null || value === undefined) return null;
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function wholeDays(fromMs: number, toMsValue: number): number {
  return Math.max(0, Math.floor((toMsValue - fromMs) / DAY_MS));
}

export function agoLabel(thenMs: number, nowMs: number): string {
  const minutes = Math.floor(Math.max(0, nowMs - thenMs) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 365) return `${daysLabel(days)} ago`;
  return format(thenMs, "MMM d, yyyy");
}

export const STAGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  STAGE_FORM_OPTIONS.map((o) => ({ value: o.value, label: sentenceCase(o.label) }));

export function dealStageLabel(stage: string): string {
  const canonical = normalizeStage(stage);
  const option = canonical ? STAGE_OPTIONS.find((o) => o.value === canonical) : undefined;
  if (option) return option.label;
  const text = stage.replace(/_+/g, " ").trim();
  return text ? sentenceCase(text) : "No stage";
}

export function stageChoices(current: string): ReadonlyArray<{ value: string; label: string }> {
  if (STAGE_OPTIONS.some((o) => o.value === current)) return STAGE_OPTIONS;
  return [{ value: current, label: dealStageLabel(current) }, ...STAGE_OPTIONS];
}

export function closedOutcome(stage: string): "won" | "lost" | null {
  const canonical = normalizeStage(stage);
  if (canonical === "closed_won") return "won";
  if (canonical === "closed_lost") return "lost";
  return null;
}

const CRM_NAMES: Record<string, string> = {
  hubspot: "HubSpot",
  salesforce: "Salesforce",
};

export function crmName(source: string | null | undefined): string | null {
  if (!source) return null;
  return CRM_NAMES[source.trim().toLowerCase()] ?? null;
}

function sourceText(source: string | null | undefined): string {
  if (!source) return "Added in Sentinel";
  return crmName(source) ?? sentenceCase(source.replace(/[_-]+/g, " "));
}

export function reasonText(reason: string): string {
  return reason.replace(/\s+-\s+/g, ", ");
}

const HIGH_REASONS: readonly string[] = [
  RISK_REASONS.NO_ACTIVITY,
  RISK_REASONS.NEGOTIATION_STALLED,
  RISK_REASONS.COMPETITIVE_PRESSURE,
];

export function reasonTier(reason: string): "high" | "medium" {
  if (HIGH_REASONS.includes(reason)) return "high";
  if (/^No activity in last \d+ days$/.test(reason)) return "high";
  if (/^Action overdue by \d+ days?$/.test(reason)) return "high";
  return "medium";
}

export function riskTier(riskScore: number): "high" | "medium" | "low" {
  const level = formatRiskLevel(riskScore);
  return level === "High" ? "high" : level === "Medium" ? "medium" : "low";
}

export function riskNote(riskScore: number): string {
  const percent = Math.round(riskScore * 100);
  const high = Math.round(RISK_THRESHOLDS.MEDIUM_HIGH_BOUNDARY * 100);
  const low = Math.round(RISK_THRESHOLDS.LOW_MAX * 100);
  const tier = riskTier(riskScore);
  if (tier === "high") return `Risk ${percent}%. ${high}% or more counts as high.`;
  if (tier === "medium") return `Risk ${percent}%. Medium runs from ${low}% up to ${high}%.`;
  return `Risk ${percent}%. Under ${low}% counts as low.`;
}

export const TRACK_COLOR: Record<"high" | "medium" | "low", string> = {
  high: "var(--dl-signal)",
  medium: "var(--dl-amber)",
  low: "var(--dl-ink)",
};


export interface TimelineLike {
  id: string;
  eventType: string;
  metadata: unknown;
  createdAt: DateInput;
}

export interface EventLike {
  id: string;
  type: string;
  payload: unknown;
  createdAt: DateInput;
}

export type ActivityTone = "event" | "stage" | "risk" | "other";

export interface ActivityEntry {
  id: string;
  title: string;
  detail: string | null;
  tone: ActivityTone;
  at: number;
  when: string;
}

export const ACTIVITY_COLOR: Record<ActivityTone, string> = {
  event: "var(--dl-amber)",
  stage: "var(--dl-ink)",
  risk: "var(--dl-signal)",
  other: "var(--dl-seg)",
};

const EVENT_LABELS: Record<string, string> = {
  email_received: "Email received",
  email_sent: "Email sent",
  meeting_held: "Meeting held",
};

export function eventLabel(type: string): string {
  return EVENT_LABELS[type] ?? sentenceCase(type.replace(/_+/g, " "));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

interface ActivityInput {
  createdAt: DateInput;
  source: string | null;
  team: { id: string; name: string } | null;
  timeline: TimelineLike[];
  events: EventLike[];
}

function describeTimeline(
  entry: TimelineLike,
  isCreation: boolean,
  team: ActivityInput["team"]
): Pick<ActivityEntry, "title" | "detail" | "tone"> {
  const meta = record(entry.metadata);
  switch (entry.eventType) {
    case "stage_changed": {
      const stage = text(meta.stage);
      if (!stage) return { title: "Stage changed", detail: null, tone: "stage" };
      const label = dealStageLabel(stage);
      return { title: isCreation ? `Added in ${label}` : `Moved to ${label}`, detail: null, tone: "stage" };
    }
    case "event_created":
      return {
        title: eventLabel(text(meta.eventType) ?? "activity"),
        detail: text(meta.note),
        tone: "event",
      };
    case "email_drafted":
      return { title: "Follow-up drafted", detail: text(meta.subject), tone: "other" };
    case "risk_evaluated": {
      const score = typeof meta.score === "number" ? meta.score : null;
      return {
        title: "Risk evaluated",
        detail: score === null ? null : `${Math.round(score * 100)}%`,
        tone: "risk",
      };
    }
    case "activity": {
      const kind = text(meta.type);
      if (kind === "assignment_changed") {
        return {
          title: meta.assignedToId ? "Assigned to a teammate" : "Unassigned",
          detail: null,
          tone: "other",
        };
      }
      if (kind === "moved_to_team") {
        const name = team && meta.teamId === team.id ? team.name : null;
        return { title: name ? `Moved to ${name}` : "Moved to a team", detail: null, tone: "other" };
      }
      if (kind === "moved_to_personal") {
        return { title: "Moved to personal deals", detail: null, tone: "other" };
      }
      return { title: kind ? sentenceCase(kind.replace(/_+/g, " ")) : "Activity", detail: null, tone: "other" };
    }
    default:
      return { title: sentenceCase(entry.eventType.replace(/_+/g, " ")), detail: null, tone: "other" };
  }
}

export function buildActivity(input: ActivityInput, nowMs: number): ActivityEntry[] {
  const createdMs = toMs(input.createdAt) ?? nowMs;
  const timeline = input.timeline.map((t) => ({ entry: t, at: toMs(t.createdAt) ?? createdMs }));

  const creation = timeline
    .filter((t) => t.entry.eventType === "stage_changed")
    .sort((a, b) => a.at - b.at)[0];
  const creationId =
    creation && Math.abs(creation.at - createdMs) <= SAME_MOMENT_MS ? creation.entry.id : null;

  const out: ActivityEntry[] = timeline.map(({ entry, at }) => ({
    id: `t:${entry.id}`,
    at,
    when: agoLabel(at, nowMs),
    ...describeTimeline(entry, entry.id === creationId, input.team),
  }));

  for (const event of input.events) {
    const at = toMs(event.createdAt) ?? createdMs;
    const logged = timeline.some(
      ({ entry, at: tAt }) =>
        entry.eventType === "event_created" &&
        record(entry.metadata).eventType === event.type &&
        Math.abs(tAt - at) <= SAME_MOMENT_MS
    );
    if (logged) continue;
    out.push({
      id: `e:${event.id}`,
      at,
      when: agoLabel(at, nowMs),
      title: eventLabel(event.type),
      detail: text(record(event.payload).note),
      tone: "event",
    });
  }

  if (!creationId) {
    const crm = crmName(input.source);
    out.push({
      id: "created",
      at: createdMs,
      when: agoLabel(createdMs, nowMs),
      title: crm ? `Added from ${crm}` : "Added",
      detail: null,
      tone: "stage",
    });
  }

  return out.sort((a, b) => b.at - a.at);
}


export interface StepReason {
  text: string;
  tier: "high" | "medium";
}

interface RiskPanel {
  reasons: StepReason[];
  riskPercent: number;
  riskTier: "high" | "medium" | "low";
  riskNote: string;
}

export type NextStepView =
  | ({
      kind: "act";
      pill: { label: string; tone: PillTone } | null;
      action: string;
      due: { text: string; date: string; late: string | null } | null;
      urgency: { label: string; tone: PillTone } | null;
    } & RiskPanel)
  | ({ kind: "steady"; suggestion: string | null } & RiskPanel)
  | {
      kind: "closed";
      outcome: "won" | "lost";
      cycle: string;
      range: string;
    };

export interface NextStepInput {
  stage: string;
  status: string | null;
  riskScore: number;
  recommendedAction: { label: string; urgency: string } | null;
  actionDueAt: DateInput;
  actionOverdueByDays: number | null;
  isActionOverdue: boolean;
  riskReasons: string[];
  createdAt: DateInput;
  lastActivityAt: DateInput;
}

const URGENCY_TONE: Record<string, PillTone> = {
  high: "alert",
  medium: "warn",
  low: "neutral",
};

function dayStart(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function deriveNextStep(d: NextStepInput, nowMs: number): NextStepView {
  const outcome = closedOutcome(d.stage);
  const createdMs = toMs(d.createdAt) ?? nowMs;
  if (outcome) {
    const endMs = toMs(d.lastActivityAt) ?? createdMs;
    return {
      kind: "closed",
      outcome,
      cycle: daysLabel(wholeDays(createdMs, endMs)),
      range: `${format(createdMs, "MMM d")} to ${format(endMs, "MMM d, yyyy")}`,
    };
  }

  const panel: RiskPanel = {
    reasons: d.riskReasons.map((r) => ({ text: reasonText(r), tier: reasonTier(r) })),
    riskPercent: Math.round(d.riskScore * 100),
    riskTier: riskTier(d.riskScore),
    riskNote: riskNote(d.riskScore),
  };

  if (d.status !== "at_risk") {
    return { kind: "steady", suggestion: d.recommendedAction?.label ?? null, ...panel };
  }

  const dueMs = toMs(d.actionDueAt);
  const overdue = d.isActionOverdue && (d.actionOverdueByDays ?? 0) > 0 ? d.actionOverdueByDays ?? 0 : 0;
  let pill: { label: string; tone: PillTone } | null = null;
  let due: { text: string; date: string; late: string | null } | null = null;
  if (dueMs !== null) {
    const date = format(dueMs, "EEEE, MMM d");
    due = {
      text: `Due ${date}`,
      date,
      late: overdue > 0 ? `${daysLabel(overdue)} overdue` : null,
    };
    if (overdue > 0) {
      pill = { label: `${daysLabel(overdue)} late`, tone: "alert" };
    } else {
      const daysLeft = Math.round((dayStart(dueMs) - dayStart(nowMs)) / DAY_MS);
      pill =
        daysLeft <= 0
          ? { label: "Due today", tone: "warn" }
          : { label: daysLeft === 1 ? "Due tomorrow" : `Due in ${daysLeft} days`, tone: "neutral" };
    }
  }

  const urgency = d.recommendedAction?.urgency ?? null;
  return {
    kind: "act",
    pill,
    action: d.recommendedAction?.label ?? "Follow up",
    due,
    urgency: urgency
      ? { label: `${sentenceCase(urgency)} urgency`, tone: URGENCY_TONE[urgency] ?? "neutral" }
      : null,
    ...panel,
  };
}


export interface ForecastFactor {
  text: string;
  tier: TierKey;
}

const FACTOR_REWRITES: Array<{ match: RegExp; text: (m: RegExpMatchArray) => string; tier: TierKey }> = [
  { match: /^Historical win rate: (\d+)%$/, text: (m) => `Your historical win rate is ${m[1]}%`, tier: "low" },
  { match: /^Later stage \(.+\) tends to win more$/, text: () => "Later stages tend to win more", tier: "won" },
  { match: /^High risk score reduces win probability$/, text: () => "A high risk score lowers the chance", tier: "high" },
  { match: /^Medium risk slightly reduces win probability$/, text: () => "Medium risk lowers the chance a little", tier: "medium" },
  { match: /^Low risk supports win probability$/, text: () => "Low risk helps the chance", tier: "won" },
  { match: /^No activity in (\d+) days; deal may be stalling$/, text: (m) => `No activity in ${m[1]} days, so it may be stalling`, tier: "high" },
  { match: /^Recent activity improves likelihood$/, text: () => "Recent activity helps the chance", tier: "won" },
  { match: /^Deal older than 90% of closed deals; may indicate stall$/, text: () => "Older than 90% of closed deals, a sign of a stall", tier: "medium" },
];

export function rewordFactor(factor: string): ForecastFactor | null {
  for (const rule of FACTOR_REWRITES) {
    const m = factor.match(rule.match);
    if (m) return { text: rule.text(m), tier: rule.tier };
  }
  return null;
}

export interface SimilarRow {
  id: string;
  name: string;
  outcome: "won" | "lost";
  days: string;
}

export type ForecastView =
  | {
      kind: "open";
      trend: { label: string; tone: PillTone };
      chance: number;
      closeIn: string;
      confidence: string;
      factors: ForecastFactor[];
      similar: { summary: string; rows: SimilarRow[] } | null;
      emptyNote: string | null;
    }
  | {
      kind: "closed";
      outcome: "won" | "lost";
      cycle: string;
      similar: { summary: string; rows: SimilarRow[] } | null;
      emptyNote: string | null;
    };

export interface PredictionDealInput {
  id: string;
  name: string;
  stage: string;
  value: number;
  createdAt: DateInput;
  lastActivityAt?: DateInput;
  riskScore: number;
  riskLevel?: string | null;
  status?: string | null;
}

function toPrediction(d: PredictionDealInput): DealForPrediction {
  const created = toMs(d.createdAt) ?? Date.now();
  return {
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: Number(d.value),
    createdAt: new Date(created),
    lastActivityAt: new Date(toMs(d.lastActivityAt) ?? created),
    riskScore: Number(d.riskScore ?? 0),
    riskLevel: d.riskLevel ?? undefined,
    status: d.status ?? undefined,
  };
}

const TREND: Record<string, { label: string; tone: PillTone }> = {
  up: { label: "Improving", tone: "good" },
  down: { label: "Declining", tone: "warn" },
  stable: { label: "Stable", tone: "neutral" },
};

export function buildForecast(
  deal: PredictionDealInput,
  book: PredictionDealInput[]
): ForecastView {
  const d = toPrediction(deal);
  const others = book.some((x) => x.id === deal.id) ? book : [deal, ...book];
  const deals = others.map(toPrediction);
  const similarResult = findSimilarDeals(d, deals);
  const rows: SimilarRow[] = similarResult.similar.slice(0, 5).map((s) => ({
    id: s.id,
    name: s.name,
    outcome: s.outcome,
    days: s.daysToClose == null ? "" : daysLabel(s.daysToClose),
  }));
  const won = rows.filter((r) => r.outcome === "won").length;
  const similar =
    rows.length > 0
      ? {
          summary: `Similar closed deals · won ${won} of ${rows.length}${
            similarResult.avgDaysToClose > 0
              ? `, ${similarResult.avgDaysToClose} days on average`
              : ""
          }`,
          rows,
        }
      : null;
  const anyClosed = deals.some((x) => closedOutcome(x.stage) !== null && x.id !== d.id);
  const emptyNote =
    similar || anyClosed
      ? null
      : "Close a few deals and Sentinel will have similar ones to compare this with.";

  const outcome = closedOutcome(d.stage);
  if (outcome) {
    return {
      kind: "closed",
      outcome,
      cycle: daysLabel(wholeDays(d.createdAt.getTime(), d.lastActivityAt.getTime())),
      similar,
      emptyNote,
    };
  }

  const win = calculateWinProbability(d, deals);
  const days = predictDaysToClose(d, deals);
  return {
    kind: "open",
    trend: TREND[win.trend] ?? TREND.stable,
    chance: win.probability,
    closeIn: days.estimatedDays === 0 ? "Any day now" : daysLabel(days.estimatedDays),
    confidence: sentenceCase(days.confidence),
    factors: win.factors
      .slice(0, 4)
      .map((f) => rewordFactor(f) ?? { text: f.replace(/;\s*/g, ", "), tier: "closed" as TierKey }),
    similar,
    emptyNote,
  };
}


export interface MeetingLike {
  id: string;
  title: string;
  description: string | null;
  startTime: DateInput;
  endTime: DateInput;
  attendees: string[] | null;
  location: string | null;
  meetingLink: string | null;
}

export interface MeetingView {
  id: string;
  title: string;
  month: string;
  day: string;
  when: string;
  people: string | null;
  note: string | null;
  link: string | null;
  startMs: number;
}

export function toMeetingView(m: MeetingLike): MeetingView {
  const start = toMs(m.startTime) ?? 0;
  const end = toMs(m.endTime) ?? start;
  const attendees = (m.attendees ?? []).filter((a) => a.trim());
  return {
    id: m.id,
    title: m.title,
    month: format(start, "MMM"),
    day: format(start, "d"),
    when: [
      format(start, "EEEE"),
      `${format(start, "HH:mm")} to ${format(end, "HH:mm")}`,
      m.location?.trim() || null,
    ]
      .filter(Boolean)
      .join(" · "),
    people:
      attendees.length === 0 ? null : attendees.length === 1 ? attendees[0] : `${attendees.length} attendees`,
    note: m.description?.trim() || null,
    link: m.meetingLink || null,
    startMs: start,
  };
}


export interface BriefPart {
  label: string | null;
  text: string;
}

const LABEL_LINE = /^[A-Z][A-Z\s·&/-]{1,28}$/;

function cleanLine(line: string): string {
  return line
    .replace(/\*\*|__/g, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s+/, "")
    .trim();
}

export function parseBrief(raw: string): BriefPart[] {
  const parts: BriefPart[] = [];
  let label: string | null = null;
  let lines: string[] = [];

  const flush = () => {
    const body = lines.join(" ").replace(/\s+/g, " ").trim();
    lines = [];
    if (!body) return;
    parts.push({ label, text: body });
    label = null;
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    const candidate = line.replace(/:$/, "");
    if (candidate && LABEL_LINE.test(candidate) && /[A-Z]{3}/.test(candidate)) {
      flush();
      label = sentenceCase(candidate);
      continue;
    }
    if (!line) {
      if (lines.length > 0) {
        flush();
      }
      continue;
    }
    lines.push(line);
  }
  flush();
  return parts;
}


export interface DealDetailInput {
  id: string;
  name: string;
  stage: string;
  value: number;
  status: string | null;
  riskScore: number;
  riskLevel?: string | null;
  riskReasons: string[];
  primaryRiskReason: string | null;
  recommendedAction: { label: string; urgency: string } | null;
  riskAgeInDays: number | null;
  actionDueAt: DateInput;
  actionOverdueByDays: number | null;
  isActionOverdue: boolean;
  lastActivityAt: DateInput;
  createdAt: DateInput;
  isDemo: boolean;
  source: string | null;
  channel: string | null;
  location?: string | null;
  team?: { id: string; name: string } | null;
  assignedTo?: { name: string | null; surname: string | null; email: string | null } | null;
  timeline: TimelineLike[];
  events: EventLike[];
}

export interface DealView {
  id: string;
  name: string;
  isDemo: boolean;
  stage: string;
  valueText: string;
  emailSub: string;
  hero: { chips: HeroChip[]; clause: string; deck: string };
  kpis: {
    valueCaption: string;
    riskPercent: number;
    riskTier: TierKey;
    riskCaption: string;
    lastActivity: string;
    lastActivityCaption: string;
  };
  nextStep: NextStepView;
  activity: ActivityEntry[];
  forecast: ForecastView;
  meetings: MeetingView[];
  calendarConnected: boolean;
  details: Array<{ label: string; value: string }>;
}

function heroChips(deal: DealDetailInput): HeroChip[] {
  const outcome = closedOutcome(deal.stage);
  const chips: HeroChip[] = [];
  if (outcome === "won") chips.push({ label: "Closed won", tone: "good" });
  else if (outcome === "lost") chips.push({ label: "Closed lost", tone: "neutral" });
  else {
    const tier = riskTier(deal.riskScore);
    chips.push(
      tier === "high"
        ? { label: "High risk", tone: "alert" }
        : tier === "medium"
          ? { label: "Medium risk", tone: "start" }
          : { label: "Low risk", tone: "good" }
    );
  }
  const crm = crmName(deal.source);
  if (crm) chips.push({ label: `Synced from ${crm}`, tone: "neutral" });
  return chips;
}

function heroClause(deal: DealDetailInput, quietDays: number): string {
  const money = fullCurrency(deal.value);
  const outcome = closedOutcome(deal.stage);
  if (outcome) return `${money}, closed ${outcome}.`;
  const where = `${money} in ${dealStageLabel(deal.stage)}`;
  if (quietDays === 0) return `${where}, active today.`;
  if (quietDays === 1) return `${where}, quiet for a day.`;
  return `${where}, quiet for ${quietDays} days.`;
}

function heroDeck(deal: DealDetailInput, step: NextStepView): string {
  if (step.kind === "closed") {
    return step.outcome === "won"
      ? "Closed won. Nothing is due on this deal."
      : "Closed lost. Move it back to an open stage if the talks restart.";
  }
  if (step.kind === "steady") {
    return "Activity is within the expected range. Nothing calls for you just now.";
  }
  const reason = deal.primaryRiskReason ? `${reasonText(deal.primaryRiskReason)}.` : "This deal is at risk.";
  if (step.due?.late) return `${reason} ${step.action} is ${step.due.late}.`;
  if (step.pill?.label === "Due today") return `${reason} ${step.action} is due today.`;
  if (step.due) return `${reason} ${step.action} is due ${step.due.date}.`;
  return `${reason} ${step.action} to bring it back.`;
}

function lastHumanActivity(activity: ActivityEntry[], lastMs: number): ActivityEntry | null {
  const human = HUMAN_ENGAGEMENT_EVENT_TYPES.map((t) => eventLabel(t));
  return (
    activity.find(
      (a) => a.tone === "event" && human.includes(a.title) && a.at <= lastMs + SAME_MOMENT_MS
    ) ?? null
  );
}

function personName(p: DealDetailInput["assignedTo"]): string | null {
  if (!p) return null;
  const name = `${p.name ?? ""} ${p.surname ?? ""}`.trim();
  return name || p.email || null;
}

export function buildDealView(
  input: {
    deal: DealDetailInput;
    book: PredictionDealInput[];
    meetings: MeetingLike[];
    calendarConnected: boolean;
  },
  nowMs: number
): DealView {
  const { deal } = input;
  const createdMs = toMs(deal.createdAt) ?? nowMs;
  const lastMs = toMs(deal.lastActivityAt) ?? createdMs;
  const quietDays = wholeDays(lastMs, nowMs);
  const outcome = closedOutcome(deal.stage);

  const activity = buildActivity(
    {
      createdAt: deal.createdAt,
      source: deal.source,
      team: deal.team ?? null,
      timeline: deal.timeline,
      events: deal.events,
    },
    nowMs
  );
  const nextStep = deriveNextStep(
    {
      stage: deal.stage,
      status: deal.status,
      riskScore: deal.riskScore,
      recommendedAction: deal.recommendedAction,
      actionDueAt: deal.actionDueAt,
      actionOverdueByDays: deal.actionOverdueByDays,
      isActionOverdue: deal.isActionOverdue,
      riskReasons: deal.riskReasons,
      createdAt: deal.createdAt,
      lastActivityAt: deal.lastActivityAt,
    },
    nowMs
  );

  const tier = outcome ?? riskTier(deal.riskScore);
  const tierWord = outcome ? `Closed ${outcome}` : sentenceCase(riskTier(deal.riskScore));
  const riskCaption =
    !outcome && deal.status === "at_risk" && deal.riskAgeInDays !== null
      ? deal.riskAgeInDays === 0
        ? `${tierWord}, since today`
        : `${tierWord}, for ${daysLabel(deal.riskAgeInDays)}`
      : tierWord;

  const human = lastHumanActivity(activity, lastMs);
  const channel = normalizeChannel(deal.channel);

  return {
    id: deal.id,
    name: deal.name,
    isDemo: deal.isDemo,
    stage: deal.stage,
    valueText: fullCurrency(deal.value),
    emailSub: `${fullCurrency(deal.value)} · ${dealStageLabel(deal.stage)}`,
    hero: {
      chips: heroChips(deal),
      clause: heroClause(deal, quietDays),
      deck: heroDeck(deal, nextStep),
    },
    kpis: {
      valueCaption: outcome
        ? `Added ${format(createdMs, "MMM d, yyyy")}`
        : `Open ${daysLabel(wholeDays(createdMs, nowMs))}, since ${format(createdMs, "MMM d")}`,
      riskPercent: Math.round(deal.riskScore * 100),
      riskTier: tier,
      riskCaption,
      lastActivity: quietDays === 0 ? "Today" : daysLabel(quietDays),
      lastActivityCaption: human
        ? `${human.title}, ${format(human.at, "MMM d")}`
        : "Nothing logged since it was added",
    },
    nextStep,
    activity,
    forecast: buildForecast(deal, input.book),
    meetings: input.meetings
      .map(toMeetingView)
      .sort((a, b) => a.startMs - b.startMs),
    calendarConnected: input.calendarConnected,
    details: [
      { label: "Location", value: deal.location?.trim() || "Not set" },
      { label: "Channel", value: channel ? DEAL_CHANNEL_LABELS[channel] : "Not set" },
      { label: "Team", value: deal.team?.name ?? "Personal" },
      { label: "Assigned to", value: personName(deal.assignedTo) ?? "Unassigned" },
      { label: "Added", value: format(createdMs, "MMM d, yyyy") },
      { label: "Source", value: sourceText(deal.source) },
    ],
  };
}
