import { describe, it, expect } from "vitest";
import { normalizeSupabasePoolerDatabaseUrl } from "@/lib/prisma-database-url";

describe("normalizeSupabasePoolerDatabaseUrl", () => {
  it("adds pgbouncer and connection_limit for pooler host", () => {
    const raw =
      "postgresql://postgres:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
    const out = normalizeSupabasePoolerDatabaseUrl(raw)!;
    expect(out).toContain("pgbouncer=true");
    expect(out).toContain("connection_limit=5");
  });

  it("adds params for port 6543", () => {
    const raw = "postgresql://user:pass@example.com:6543/mydb";
    const out = normalizeSupabasePoolerDatabaseUrl(raw)!;
    expect(out).toContain("pgbouncer=true");
    expect(out).toContain("connection_limit=5");
  });

  it("does not change direct-style URLs", () => {
    const raw = "postgresql://user:pass@db.example.com:5432/mydb";
    expect(normalizeSupabasePoolerDatabaseUrl(raw)).toBe(raw);
  });

  it("preserves existing query params", () => {
    const raw =
      "postgresql://u:p@aws-0.pooler.supabase.com:6543/postgres?sslmode=require";
    const out = normalizeSupabasePoolerDatabaseUrl(raw)!;
    expect(out).toContain("sslmode=require");
    expect(out).toContain("pgbouncer=true");
  });
});
