import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VERCEL_CRON_EXAMPLE_SYNC_DAILY } from "../vercel-cron-hobby";

describe("Vercel Hobby cron example", () => {
  it("vercel.crons.example.json matches the daily schedule constant", () => {
    const path = join(process.cwd(), "vercel.crons.example.json");
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    const sync = parsed.crons.find((c) =>
      c.path.includes("sync-integrations")
    );
    expect(sync?.schedule).toBe(VERCEL_CRON_EXAMPLE_SYNC_DAILY);
  });
});
