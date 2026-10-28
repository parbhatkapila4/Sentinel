import {
  DEAL_CHANNELS,
  DEAL_CHANNEL_LABELS,
  STAGES,
  STAGE_FORM_OPTIONS,
  type DealChannel,
} from "@/lib/config";
import { sentenceCase } from "../format";

export const MAX_DEAL_VALUE = 20_000_000_000;

export const MAX_VALUE_MESSAGE = `Max deal value is $${MAX_DEAL_VALUE.toLocaleString("en-US")} (20 billion).`;

const STAGE_DESCRIPTIONS: Record<string, string> = {
  [STAGES.DISCOVER]: "Initial research and outreach",
  [STAGES.QUALIFY]: "Assessing fit and budget",
  [STAGES.PROPOSAL]: "Presenting the solution",
  [STAGES.NEGOTIATION]: "Terms and pricing",
  [STAGES.CLOSED_WON]: "Signed and closed",
  [STAGES.CLOSED_LOST]: "Did not go ahead",
};

const CHANNEL_DESCRIPTIONS: Record<DealChannel, string> = {
  direct: "They came to you: website, demo request.",
  organic: "Content, search or community, no paid push.",
  outbound: "Your team reached out first.",
  referrals: "Introduced by a customer, advisor or peer.",
  partners: "A channel partner, reseller or alliance.",
};

export interface Choice<T extends string = string> {
  value: T;
  label: string;
  description: string;
}

export const STAGE_CHOICES: Choice[] = STAGE_FORM_OPTIONS.map((s) => ({
  value: s.value,
  label: sentenceCase(s.label),
  description: STAGE_DESCRIPTIONS[s.value] ?? s.description,
}));

export const CHANNEL_CHOICES: Choice<DealChannel>[] = DEAL_CHANNELS.map((c) => ({
  value: c,
  label: DEAL_CHANNEL_LABELS[c],
  description: CHANNEL_DESCRIPTIONS[c],
}));

export interface TeamOption {
  id: string;
  name: string;
}

export interface MemberOption {
  id: string;
  userId: string;
  user: { name: string | null; surname: string | null; email: string };
}

export interface NewDealDraft {
  name: string;
  stage: string;
  value: string;
  channel: DealChannel;
  location: string;
  teamId: string;
  assignedToId: string;
}

export const EMPTY_DRAFT: NewDealDraft = {
  name: "",
  stage: "",
  value: "",
  channel: "direct",
  location: "",
  teamId: "",
  assignedToId: "",
};

export function memberName(m: MemberOption): string {
  return [m.user.name, m.user.surname].filter(Boolean).join(" ") || m.user.email;
}

export function formatDigits(raw: string): string {
  const n = parseInt(raw.replace(/,/g, ""), 10);
  return Number.isNaN(n) ? "" : n.toLocaleString("en-US");
}

export function readValueInput(
  input: string
): { digits: string } | { error: string } | null {
  const raw = input.replace(/,/g, "");
  if (raw !== "" && !/^\d+$/.test(raw)) return null;
  if (raw !== "" && parseInt(raw, 10) > MAX_DEAL_VALUE) {
    return { error: MAX_VALUE_MESSAGE };
  }
  return { digits: raw };
}

export function validateDraft(draft: NewDealDraft): string | null {
  if (!draft.name.trim()) return "Please enter a deal name";
  if (!draft.stage) return "Please select a stage";
  const value = parseInt(draft.value, 10);
  if (!draft.value || !(value > 0)) return "Please enter a valid deal value";
  if (value > MAX_DEAL_VALUE) return MAX_VALUE_MESSAGE;
  return null;
}

export function toFormData(draft: NewDealDraft): FormData {
  const formData = new FormData();
  formData.append("name", draft.name.trim());
  formData.append("stage", draft.stage);
  formData.append("value", draft.value);
  formData.append("channel", draft.channel);
  if (draft.location) formData.append("location", draft.location);
  if (draft.teamId) formData.append("teamId", draft.teamId);
  if (draft.assignedToId) formData.append("assignedToId", draft.assignedToId);
  return formData;
}
