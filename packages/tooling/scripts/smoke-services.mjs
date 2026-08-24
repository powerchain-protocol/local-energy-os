import { spawn } from "node:child_process";

const services = new Map([
  [3100, "web"],
  [3101, "api"],
  [3102, "checkout"],
  [3103, "marketplace"],
  [3104, "ai-gateway"],
  [3105, "integration-gateway"],
  [3106, "explorer"],
  [3107, "websocket-gateway"],
  [3108, "workers"],
]);

const output = [];
const fleet = spawn("pnpm", ["dev:services"], {
  env: process.env,
  detached: process.platform !== "win32",
  stdio: ["ignore", "pipe", "pipe"],
});
fleet.stdout.on("data", (chunk) => output.push(chunk.toString()));
fleet.stderr.on("data", (chunk) => output.push(chunk.toString()));

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForService(port, expected) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (fleet.exitCode !== null) throw new Error(`Service fleet exited with code ${fleet.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health/live`);
      const body = await response.json();
      if (response.ok && body.status === "ok" && body.application === expected) return;
    } catch {}
    await pause(250);
  }
  throw new Error(`${expected} did not become healthy on port ${port}`);
}

function stopFleet() {
  if (!fleet.pid || fleet.exitCode !== null) return;
  if (process.platform === "win32") fleet.kill("SIGTERM");
  else process.kill(-fleet.pid, "SIGTERM");
}

try {
  await Promise.all([...services].map(([port, name]) => waitForService(port, name)));
  const response = await fetch("http://127.0.0.1:3105/api/v1/integrations/solana-pay/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operation: "createTransferUrl", payload: { recipient: "11111111111111111111111111111111", amount: "1.25", label: "PowerChain" } }),
  });
  const result = await response.json();
  if (!response.ok || result.state !== "available" || !result.data?.url?.startsWith("solana:")) throw new Error("Solana Pay integration smoke request failed");
  console.log(`Service smoke passed (${services.size} healthy apps and protected integration execution).`);
} catch (error) {
  const tail = output.join("").trim().split("\n").slice(-80).join("\n");
  if (tail) console.error(tail);
  throw error;
} finally {
  stopFleet();
}
