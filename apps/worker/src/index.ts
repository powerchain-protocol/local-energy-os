import { loadPowerChainRootEnv } from "@powerchain/config/node-env";
loadPowerChainRootEnv();

import { CANONICAL_VERSION } from "@powerchain/config";
import { disconnectPrismaClient } from "@powerchain/database";
import { closeRealtimePublisher } from "@powerchain/realtime";
import { degradedPolicy } from "@powerchain/system-management";
import { loadWorkerConfig, workerCapabilities } from "./config";
import { createWorkerJobs, type WorkerJob } from "./jobs";

const config = loadWorkerConfig();
const jobs = createWorkerJobs(config);
const timers = new Map<string, ReturnType<typeof setInterval>>();
const inFlight = new Map<string, Promise<void>>();
let stopping = false;

function log(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ service: "powerchain-worker", ...payload }));
}

function logError(payload: Record<string, unknown>) {
  console.error(JSON.stringify({ service: "powerchain-worker", ...payload }));
}

function execute(job: WorkerJob): Promise<void> {
  if (stopping) return Promise.resolve();
  const existing = inFlight.get(job.name);
  if (existing) {
    log({ job: job.name, status: "skipped-overlap" });
    return existing;
  }
  const run = (async () => {
    const startedAt = Date.now();
    try {
      const result = await job.run();
      log({ job: job.name, status: "ok", durationMs: Date.now() - startedAt, ...result });
    } catch (error) {
      logError({ job: job.name, status: "failed", durationMs: Date.now() - startedAt, message: error instanceof Error ? error.message : "unknown error" });
    } finally {
      inFlight.delete(job.name);
    }
  })();
  inFlight.set(job.name, run);
  return run;
}

async function main() {
  log({
    status: "starting",
    version: CANONICAL_VERSION,
    jobs: jobs.map((job) => ({ name: job.name, intervalMs: job.intervalMs })),
    disabledCapabilities: workerCapabilities,
    transports: {
      domainEvents: config.domainEventTransport,
      integrationOutbox: config.integrationOutboxTransport,
    },
    solanaDegradedPolicy: degradedPolicy("SOLANA", "DEGRADED"),
  });

  for (const job of jobs) {
    if (config.runOnStart) await execute(job);
    timers.set(job.name, setInterval(() => void execute(job), job.intervalMs));
  }
  log({ status: "ready", scheduledJobs: jobs.length });
}

async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  for (const timer of timers.values()) clearInterval(timer);
  timers.clear();
  log({ status: "stopping", signal, inFlight: [...inFlight.keys()] });

  const drain = Promise.allSettled([...inFlight.values()]);
  const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), config.shutdownTimeoutMs));
  const result = await Promise.race([drain, timeout]);
  if (result === "timeout") logError({ status: "shutdown-timeout", timeoutMs: config.shutdownTimeoutMs });

  await Promise.allSettled([closeRealtimePublisher(), disconnectPrismaClient()]);
  log({ status: "stopped" });
  process.exitCode = result === "timeout" ? 1 : 0;
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
void main().catch(async (error) => {
  logError({ status: "fatal", message: error instanceof Error ? error.message : "unknown error" });
  await Promise.allSettled([closeRealtimePublisher(), disconnectPrismaClient()]);
  process.exitCode = 1;
});
