import path from "node:path";
import { pathToFileURL } from "node:url";

const TIME_URL = "https://api.clerk.com";
const TIMEOUT_MS = 2000;
export const WARN_AFTER_MS = 3000;
export const DEV_SIGN_IN_ALLOWANCE_MS = 5 * 60_000;

const FIXES = {
  win32: [
    "Fix it from a Command Prompt or PowerShell opened with Run as administrator:",
    "  sc.exe config w32time start= auto",
    "  net start w32time",
    '  w32tm /config /manualpeerlist:"time.windows.com,0x9 time.google.com,0x9" /syncfromflags:manual /update',
    "  w32tm /resync /force",
  ],
  darwin: ["Fix it: sudo sntp -sS time.apple.com"],
  linux: ["Fix it: sudo timedatectl set-ntp true"],
};


export function estimateOffsetMs(dateHeader, sentAtMs, receivedAtMs) {
  const serverMs = dateHeader ? Date.parse(dateHeader) : NaN;
  if (Number.isNaN(serverMs)) return null;

  return serverMs + 500 - (sentAtMs + receivedAtMs) / 2;
}

export function clockWarning(offsetMs, platform) {
  if (offsetMs === null || Math.abs(offsetMs) <= WARN_AFTER_MS) return null;
  const seconds = Math.round(Math.abs(offsetMs) / 1000);
  const direction = offsetMs > 0 ? "behind" : "ahead of";
  const effect =
    Math.abs(offsetMs) <= DEV_SIGN_IN_ALLOWANCE_MS
      ? "Dev sign-in allows up to 5 minutes of drift, so it still works, but the clock keeps drifting."
      : "That is more than the 5 minutes dev sign-in allows, so /sign-in will keep reloading.";
  return [
    `Clock check: this computer's clock is ${seconds}s ${direction} internet time.`,
    effect,
    ...(FIXES[platform] ?? [
      "Fix it: turn on automatic date and time in your system settings.",
    ]),
  ];
}

export async function readClockOffset({ fetchImpl = fetch, now = Date.now } = {}) {
  const sentAt = now();
  try {
    const res = await fetchImpl(TIME_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return estimateOffsetMs(res.headers.get("date"), sentAt, now());
  } catch {
    return null;
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(path.resolve(process.argv[1])).href.toLowerCase() ===
    import.meta.url.toLowerCase();

if (invokedDirectly) {
  const lines = clockWarning(await readClockOffset(), process.platform);
  if (lines) {
    const tint = process.stderr.isTTY ? ["\x1b[33m", "\x1b[0m"] : ["", ""];
    console.warn(`\n${tint[0]}${lines.join("\n")}${tint[1]}\n`);
  }
}
