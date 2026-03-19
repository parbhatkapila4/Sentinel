import { spawnSync } from "node:child_process";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runGenerate() {
  // Use npx to match the workspace's Prisma version.
  return spawnSync("npx", ["prisma", "generate"], {
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
}

// On Windows, Prisma can fail to replace the query engine DLL if another Node
// process (e.g. `next dev`) is currently using it. We retry a few times; if it
// still fails with an EPERM rename error, we continue so `next build` can run
// against the already-generated client.
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 800;

let lastStatus = null;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const res = runGenerate();
  lastStatus = res.status ?? 1;
  if (lastStatus === 0) {
    if (res.stdout) process.stdout.write(res.stdout);
    if (res.stderr) process.stderr.write(res.stderr);
    process.exit(0);
  }

  const combinedOutput = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  if (combinedOutput) {
    // Preserve Prisma output for debuggability.
    process.stdout.write(res.stdout ?? "");
    process.stderr.write(res.stderr ?? "");
  }

  const isWindowsLock =
    process.platform === "win32" &&
    combinedOutput.includes("EPERM: operation not permitted, rename") &&
    combinedOutput.includes("query_engine-windows.dll.node");

  if (!isWindowsLock) {
    process.exit(lastStatus);
  }

  if (attempt < MAX_ATTEMPTS) {
    const delay = BASE_DELAY_MS * attempt;
    // eslint-disable-next-line no-console
    console.warn(`[prisma-generate-safe] Prisma engine locked (attempt ${attempt}/${MAX_ATTEMPTS}); retrying in ${delay}ms...`);
    await sleep(delay);
    continue;
  }

  // eslint-disable-next-line no-console
  console.warn("[prisma-generate-safe] Prisma engine still locked; continuing build with existing generated client.");
  process.exit(0);
}

process.exit(lastStatus ?? 1);

