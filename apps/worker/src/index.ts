import { CANONICAL_VERSION } from "@powerchain/config";
import { degradedPolicy } from "@powerchain/system-management";
import { jobs } from "./jobs";

let stopping = false;
const timers: Array<ReturnType<typeof setInterval>> = [];

async function execute(job: (typeof jobs)[number]) {
  if (stopping) return;
  const startedAt = Date.now();
  try {
    const result = await job.run();
    console.log(JSON.stringify({ service: "powerchain-worker", job: job.name, status: "ok", durationMs: Date.now() - startedAt, ...result }));
  } catch (error) {
    console.error(JSON.stringify({ service: "powerchain-worker", job: job.name, status: "failed", durationMs: Date.now() - startedAt, message: error instanceof Error ? error.message : "unknown error" }));
  }
}

async function main() {
  console.log(JSON.stringify({
    service: "powerchain-worker",
    version: CANONICAL_VERSION,
    jobs: jobs.map(job => job.name),
    solanaDegradedPolicy: degradedPolicy("SOLANA", "DEGRADED"),
  }));
  for (const job of jobs) {
    await execute(job);
    timers.push(setInterval(() => void execute(job), job.intervalMs));
  }
}

function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  for (const timer of timers) clearInterval(timer);
  console.log(JSON.stringify({ service: "powerchain-worker", status: "stopping", signal }));
  process.exitCode = 0;
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
void main().catch(error => { console.error(error); process.exitCode = 1; });
