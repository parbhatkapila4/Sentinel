import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ACTIONS_DIR = join(process.cwd(), "src/app/actions");
const CRON_ROUTE = join(process.cwd(), "src/app/api/cron/sync-integrations/route.ts");

const IDENTITY_PARAM = /\b(userId|actingUserId|callerId|currentUserId|ownerId)\s*[?:]/;

function exportedAsyncSignatures(source: string): Array<{ name: string; params: string }> {
  const out: Array<{ name: string; params: string }> = [];
  const re = /export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    out.push({ name: match[1], params: match[2] });
  }
  return out;
}

function useServerFiles(): string[] {
  return readdirSync(ACTIONS_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .filter((f) =>
      readFileSync(join(ACTIONS_DIR, f), "utf8").trimStart().startsWith('"use server"')
    );
}

describe("server actions never accept caller-supplied identity", () => {
  const files = useServerFiles();

  it("finds the server action modules", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s", (file) => {
    const source = readFileSync(join(ACTIONS_DIR, file), "utf8");
    const offenders = exportedAsyncSignatures(source).filter((sig) =>
      IDENTITY_PARAM.test(sig.params)
    );
    expect(
      offenders.map((o) => `${o.name}(${o.params.replace(/\s+/g, " ").trim()})`)
    ).toEqual([]);
  });

  it("the sync cron imports per-user sync code from src/lib, not from action modules", () => {
    const source = readFileSync(CRON_ROUTE, "utf8");
    expect(source).not.toMatch(/from\s+["']@\/app\/actions\//);
  });
});
