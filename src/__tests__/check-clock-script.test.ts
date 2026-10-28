import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEV_SIGN_IN_ALLOWANCE_MS,
  WARN_AFTER_MS,
  clockWarning,
  estimateOffsetMs,
  readClockOffset,
} from "../../scripts/check-clock.mjs";

const SERVER_DATE = "Tue, 27 Oct 2026 08:37:05 GMT";
const SERVER_MS = Date.parse(SERVER_DATE);

function headResponse(date: string | null) {
  const headers = new Headers();
  if (date) headers.set("date", date);
  return new Response(null, { status: 404, headers });
}

describe("clock check before npm run dev", () => {
  it("is wired into predev so it runs on every dev start", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8")
    );
    expect(pkg.scripts.predev).toContain("node scripts/check-clock.mjs");
  });

  it("measures a clock that is 28 seconds behind", () => {
    const local = SERVER_MS - 27_600;
    const offset = estimateOffsetMs(SERVER_DATE, local - 100, local + 100);
    expect(offset).toBeCloseTo(28_100, -2);
  });

  it("measures nothing from a missing or broken Date header", () => {
    expect(estimateOffsetMs(null, 0, 0)).toBeNull();
    expect(estimateOffsetMs("not a date", 0, 0)).toBeNull();
  });

  it("stays quiet while the clock is within three seconds", () => {
    expect(clockWarning(null, "win32")).toBeNull();
    expect(clockWarning(0, "win32")).toBeNull();
    expect(clockWarning(WARN_AFTER_MS, "win32")).toBeNull();
    expect(clockWarning(-WARN_AFTER_MS, "win32")).toBeNull();
  });

  it("says dev sign-in still works within the 5 minute allowance, and gives the Windows fix", () => {
    const lines = clockWarning(27_600, "win32")!;
    expect(lines[0]).toBe(
      "Clock check: this computer's clock is 28s behind internet time."
    );
    expect(lines[1]).toContain("so it still works");
    expect(lines).toContain("  net start w32time");
    expect(lines).toContain("  w32tm /resync /force");
  });

  it("warns that /sign-in will loop once the drift passes the allowance", () => {
    const lines = clockWarning(DEV_SIGN_IN_ALLOWANCE_MS + 1_000, "win32")!;
    expect(lines[0]).toContain("301s behind");
    expect(lines[1]).toContain("/sign-in will keep reloading");
  });

  it("gives Windows commands that also work in Command Prompt", () => {
    const fix = clockWarning(27_600, "win32")!.join("\n");
    expect(fix).toContain("Command Prompt or PowerShell");
    expect(fix).toContain("  sc.exe config w32time start= auto");
    expect(fix).not.toMatch(/Set-Service|Start-Service/);
  });

  it("warns about a clock running ahead too", () => {
    const lines = clockWarning(-12_000, "darwin")!;
    expect(lines[0]).toBe(
      "Clock check: this computer's clock is 12s ahead of internet time."
    );
    expect(lines).toContain("Fix it: sudo sntp -sS time.apple.com");
    expect(lines.join("\n")).not.toContain("w32tm");
  });

  it("falls back to general advice on other systems", () => {
    expect(clockWarning(9_000, "freebsd")!.at(-1)).toBe(
      "Fix it: turn on automatic date and time in your system settings."
    );
  });

  it("reads the offset from the response's Date header", async () => {
    let t = SERVER_MS - 27_600;
    const offset = await readClockOffset({
      fetchImpl: async () => headResponse(SERVER_DATE),
      now: () => (t += 50),
    });
    expect(offset).toBeGreaterThan(27_900);
    expect(offset).toBeLessThan(28_100);
  });

  it("says nothing when offline, slow or missing the header", async () => {
    expect(
      await readClockOffset({
        fetchImpl: async () => {
          throw new TypeError("fetch failed");
        },
      })
    ).toBeNull();
    expect(
      await readClockOffset({ fetchImpl: async () => headResponse(null) })
    ).toBeNull();
  });

  it("never prints the warning text with em dashes or arrows", () => {
    const text = [
      ...clockWarning(30_000, "win32")!,
      ...clockWarning(-30_000, "linux")!,
    ].join("\n");
    expect(text).not.toMatch(/[—→←]|->/);
  });
});
