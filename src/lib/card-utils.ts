export type CardBrandKey = "VISA" | "Mastercard" | "Amex" | "Discover";

export interface BrandMeta {
  key: CardBrandKey;
  label: string;
  cvcLength: number;
  panLengths: number[];
  groups: number[];
  pattern: RegExp;
}

export const BRANDS: BrandMeta[] = [
  {
    key: "Amex",
    label: "American Express",
    cvcLength: 4,
    panLengths: [15],
    groups: [4, 6, 5],
    pattern: /^3[47]/,
  },
  {
    key: "VISA",
    label: "Visa",
    cvcLength: 3,
    panLengths: [13, 16, 19],
    groups: [4, 4, 4, 4],
    pattern: /^4/,
  },
  {
    key: "Mastercard",
    label: "Mastercard",
    cvcLength: 3,
    panLengths: [16],
    groups: [4, 4, 4, 4],
    pattern: /^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]|720))/,
  },
  {
    key: "Discover",
    label: "Discover",
    cvcLength: 3,
    panLengths: [16],
    groups: [4, 4, 4, 4],
    pattern: /^(6011|65|64[4-9]|622)/,
  },
];

export function detectBrand(pan: string): BrandMeta | null {
  const digits = pan.replace(/\D/g, "");
  if (!digits) return null;
  for (const b of BRANDS) {
    if (b.pattern.test(digits)) return b;
  }
  return null;
}

export function luhnValid(pan: string): boolean {
  const d = pan.replace(/\D/g, "");
  if (d.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function formatPan(raw: string, brand?: BrandMeta | null): string {
  const d = raw.replace(/\D/g, "");
  const groups = brand?.groups ?? [4, 4, 4, 4];
  const maxLen = brand ? Math.max(...brand.panLengths) : 19;
  const cut = d.slice(0, maxLen);
  const parts: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= cut.length) break;
    parts.push(cut.slice(i, i + g));
    i += g;
  }
  if (i < cut.length) parts.push(cut.slice(i));
  return parts.join(" ");
}

export function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function parseExpiry(
  v: string
): { month: number; year: number } | null {
  const m = v.match(/^(\d{2})\s*\/?\s*(\d{2})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return { month, year: 2000 + yy };
}

export function isExpiryFuture(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year > currentYear) return true;
  if (year === currentYear && month >= currentMonth) return true;
  return false;
}

export function isPanValidForBrand(pan: string, brand: BrandMeta): boolean {
  const d = pan.replace(/\D/g, "");
  return brand.panLengths.includes(d.length) && luhnValid(d);
}
