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
          "Rewrote to port 6543 (transaction pooler) for Prisma - use the \"Transaction\" URI from Supabase."
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
