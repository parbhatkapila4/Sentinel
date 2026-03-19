/**
 * Supabase transaction pooler (host `*.pooler.supabase.com` or port `6543`) must use
 * `pgbouncer=true` with Prisma. A modest `connection_limit` reduces connection churn and
 * "forcibly closed by the remote host" / max-clients issues when many workers run.
 */
export function normalizeSupabasePoolerDatabaseUrl(
  urlString: string | undefined
): string | undefined {
  if (!urlString?.trim()) return urlString;
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const isSupabasePooler =
      host.includes("pooler.supabase.com") || url.port === "6543";

    if (!isSupabasePooler) {
      return urlString;
    }

    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
    }
    return url.toString();
  } catch {
    return urlString;
  }
}
