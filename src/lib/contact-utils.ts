export function normalizeContactEmail(
  raw: string | null | undefined
): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  return trimmed.toLowerCase();
}
