import { normalizeContactEmail } from "./contact-utils";

export interface GmailHeaders {
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
}

export interface ParsedParticipants {
  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  all: string[];
}

function splitOnUnquotedCommas(raw: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function extractEmailFromToken(token: string): string | null {
  const noComments = token.replace(/\([^)]*\)/g, "");
  const angle = noComments.match(/<([^>]+)>/);
  const candidateRaw = angle ? angle[1] : noComments;
  if (!candidateRaw) return null;

  const candidate = candidateRaw.trim().replace(/^['"]+|['"]+$/g, "").trim();
  if (!candidate) return null;

  if (!/^[^\s@]+@[^\s@]+$/.test(candidate)) return null;
  return candidate;
}

export function parseEmailAddressList(raw: string | undefined): string[] {
  if (!raw) return [];
  const tokens = splitOnUnquotedCommas(raw);
  const out: string[] = [];
  for (const token of tokens) {
    const email = extractEmailFromToken(token);
    if (email) out.push(email);
  }
  return out;
}

export function extractGmailParticipants(
  headers: GmailHeaders
): ParsedParticipants {
  const fromList = parseEmailAddressList(headers.from);
  const to = parseEmailAddressList(headers.to);
  const cc = parseEmailAddressList(headers.cc);
  const bcc = parseEmailAddressList(headers.bcc);

  const seen = new Set<string>();
  const all: string[] = [];
  const appendNormalized = (raw: string) => {
    const norm = normalizeContactEmail(raw);
    if (!norm) return;
    if (seen.has(norm)) return;
    seen.add(norm);
    all.push(norm);
  };

  if (fromList[0]) appendNormalized(fromList[0]);
  for (const addr of to) appendNormalized(addr);
  for (const addr of cc) appendNormalized(addr);
  for (const addr of bcc) appendNormalized(addr);

  return {
    from: fromList[0] ?? null,
    to,
    cc,
    bcc,
    all,
  };
}
