import { spawn } from "node:child_process";

const output = [];
const platform = spawn("pnpm", ["dev"], {
  env: process.env,
  detached: process.platform !== "win32",
  stdio: ["ignore", "pipe", "pipe"],
});
platform.stdout.on("data", (chunk) => output.push(chunk.toString()));
platform.stderr.on("data", (chunk) => output.push(chunk.toString()));

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
function stopPlatform() {
  if (!platform.pid || platform.exitCode !== null) return;
  if (process.platform === "win32") platform.kill("SIGTERM");
  else process.kill(-platform.pid, "SIGTERM");
}

try {
  let healthy = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (platform.exitCode !== null) throw new Error(`Platform dev server exited with code ${platform.exitCode}`);
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/health", { signal: AbortSignal.timeout(1_000) });
      const body = await response.json();
      if (response.ok && body.ok && body.service === "powerchain-platform" && body.version === "1.0.0") {
        healthy = true;
        break;
      }
    } catch {}
    await pause(250);
  }
  if (!healthy) throw new Error("Platform dev server did not become healthy on port 3000");
  console.log("Platform dev smoke passed (/api/v1/health is healthy).");
} catch (error) {
  const tail = output.join("").trim().split("\n").slice(-80).join("\n");
  if (tail) console.error(tail);
  throw error;
} finally {
  stopPlatform();
}
