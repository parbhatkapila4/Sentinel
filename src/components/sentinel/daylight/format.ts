import { CANONICAL_STAGES } from "@/lib/config";
import { formatShortMoney } from "@/lib/format-money";

export interface MoneyParts {
  sign: string;
  digits: string;
  unit: string;
}

export function splitMoney(n: number): MoneyParts {
  const text = formatShortMoney(n);
  const match = /^(-?)\$([\d.]+)([KMBT]?)$/.exec(text);
  if (!match) return { sign: "", digits: text.replace(/^\$/, ""), unit: "" };
  return { sign: match[1], digits: match[2], unit: match[3] };
}

export function fullCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function compactNumber(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  return formatShortMoney(n).replace("$", "");
}

export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const base = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * base >= value) return step * base;
  }
  return 10 * base;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const OPEN_STAGES = CANONICAL_STAGES.filter((s) => !s.startsWith("closed"));

export const STAGE_STEP_COUNT = OPEN_STAGES.length;

export function stageStep(stage: string): number | null {
  const key = stage.toLowerCase().trim().replace(/\s+/g, "_");
  const index = (OPEN_STAGES as readonly string[]).indexOf(key);
  return index === -1 ? null : index + 1;
}

export function parseIdleDays(ageNote: string): number | null {
  if (/today/i.test(ageNote)) return 0;
  const match = /(\d+)\s*d\b/i.exec(ageNote);
  return match ? Number(match[1]) : null;
}

export function sentenceCase(text: string): string {
  const lower = text.trim().toLowerCase();
  if (!lower) return "";
  return (lower.charAt(0).toUpperCase() + lower.slice(1)).replace(
    /\bcrm\b/gi,
    "CRM"
  );
}

export function segmentCounts(
  filled: number,
  total: number,
  max = 10
): { count: number; filled: number } {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeFilled = Math.max(0, Math.min(Math.floor(filled), safeTotal));
  if (safeTotal <= max) {
    return { count: Math.max(safeTotal, 1), filled: safeFilled };
  }
  const scaled =
    safeFilled === 0
      ? 0
      : Math.max(1, Math.round((safeFilled / safeTotal) * max));
  return { count: max, filled: scaled };
}

export function spreadLabels(
  positions: number[],
  minGap: number,
  min: number,
  max: number
): number[] {
  const out = positions.map((p) => Math.min(max, Math.max(min, p)));
  for (let i = 1; i < out.length; i++) {
    out[i] = Math.max(out[i], out[i - 1] + minGap);
  }
  const last = out.length - 1;
  if (last >= 0 && out[last] > max) {
    out[last] = max;
    for (let i = last - 1; i >= 0; i--) {
      out[i] = Math.min(out[i], out[i + 1] - minGap);
    }
  }
  return out;
}

export function percentOf(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}
