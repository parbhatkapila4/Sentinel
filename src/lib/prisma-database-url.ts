/**
 * Supabase transaction pooler (host `*.pooler.supabase.com` or port `6543`) must use
 * `pgbouncer=true` with Prisma. A modest `connection_limit` reduces connection churn and
 * "forcibly closed by the remote host" / max-clients issues when many workers run.
 *
 * Important: the same pooler hostname on port **5432** is Supabase **session** pooler mode.
 * Prisma + Next.js should use port **6543** (transaction pooler). We rewrite 5432 → 6543
 * automatically when the host is a Supabase pooler host.
 */
let loggedSessionPoolerRewrite = false;

export function normalizeSupabasePoolerDatabaseUrl(
  urlString: string | undefined
): string | undefined {
  if (!urlString?.trim()) return urlString;
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const isSupabasePoolerHost = host.includes("pooler.supabase.com");
    const port = url.port || "5432";

    if (isSupabasePoolerHost && port === "5432") {
      url.port = "6543";
      if (process.env.NODE_ENV === "development" && !loggedSessionPoolerRewrite) {
        loggedSessionPoolerRewrite = true;
        console.warn(
          "[prisma] DATABASE_URL used Supabase pooler on port 5432 (session mode). " +
            "Rewrote to port 6543 (transaction pooler) for Prisma — use the \"Transaction\" URI from Supabase."
        );
      }
    }

    const isSupabasePooler =
      isSupabasePoolerHost || url.port === "6543";

    if (!isSupabasePooler) {
      return urlString;
    }

    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
    }
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return urlString;
  }
}
