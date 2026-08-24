import { getDigitalEnergyOutboxPublisherStatus, runDigitalEnergyOutboxPublisherOnce } from "./digital-energy-outbox.ts";
import { ApplicationError, createApplication, json, readJson } from "@powerchain/application-runtime";

export const applicationName = "workers" as const;

function requireWorkerAdmin(request: Request) {
  const configured = String(process.env.POWERCHAIN_WORKER_ADMIN_TOKEN ?? "").trim();
  if (!configured) throw new ApplicationError("WORKER_ADMIN_DISABLED", "Manual worker execution is disabled", 503);
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization !== `Bearer ${configured}`) throw new ApplicationError("WORKER_ADMIN_FORBIDDEN", "Worker admin authorization is required", 403);
}
export type JobType = "health.snapshot" | "notifications.dispatch" | "settlement.reconcile";
export interface WorkerJob { id: string; type: JobType; payload: Record<string, unknown>; status: "queued" | "running" | "completed" | "failed"; idempotencyKey: string; attempts: number; createdAt: string; updatedAt: string; result?: Record<string, unknown>; }

export function createWorkerQueue() {
  const jobs = new Map<string, WorkerJob>();
  const idempotency = new Map<string, string>();
  const supported = new Set<JobType>(["health.snapshot", "notifications.dispatch", "settlement.reconcile"]);
  const get = (id: string) => { const job = jobs.get(id); if (!job) throw new ApplicationError("JOB_NOT_FOUND", "Job was not found", 404); return job; };
  return {
    enqueue(input: { type?: JobType; payload?: Record<string, unknown>; idempotencyKey?: string }) {
      if (!input.type || !supported.has(input.type)) throw new ApplicationError("JOB_TYPE_NOT_SUPPORTED", "Job type is not supported");
      if (!input.idempotencyKey?.trim()) throw new ApplicationError("IDEMPOTENCY_KEY_REQUIRED", "idempotencyKey is required");
      const existingId = idempotency.get(input.idempotencyKey);
      if (existingId) return jobs.get(existingId)!;
      const now = new Date().toISOString();
      const job: WorkerJob = { id: `job_${crypto.randomUUID().replaceAll("-", "")}`, type: input.type, payload: input.payload ?? {}, status: "queued", idempotencyKey: input.idempotencyKey, attempts: 0, createdAt: now, updatedAt: now };
      jobs.set(job.id, job); idempotency.set(job.idempotencyKey, job.id); return job;
    },
    get,
    run(id: string) {
      const current = get(id);
      if (current.status !== "queued" && current.status !== "failed") throw new ApplicationError("INVALID_JOB_STATE", `Cannot run a ${current.status} job`, 409);
      const running: WorkerJob = { ...current, status: "running", attempts: current.attempts + 1, updatedAt: new Date().toISOString() }; jobs.set(id, running);
      const completed: WorkerJob = { ...running, status: "completed", updatedAt: new Date().toISOString(), result: { accepted: true, processor: running.type, correlationId: running.id } }; jobs.set(id, completed); return completed;
    },
    stats() { const values = [...jobs.values()]; return { total: values.length, queued: values.filter((job) => job.status === "queued").length, running: values.filter((job) => job.status === "running").length, failed: values.filter((job) => job.status === "failed").length, completed: values.filter((job) => job.status === "completed").length }; },
  };
}

export const workerQueue = createWorkerQueue();
export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Workers",
    version: "1.0.0",
    description: "Idempotent asynchronous work queue and controlled processor boundary.",
    basePath: "/api/v1/jobs",
    capabilities: ["jobs", "idempotency", "reconciliation", "notifications", "digital-energy-outbox"],
  },
  routes: [
    { method: "GET", path: "/api/v1/jobs/digital-energy-outbox", summary: "Return Digital Energy transactional outbox publisher status", handler: () => json(getDigitalEnergyOutboxPublisherStatus()) },
    { method: "POST", path: "/api/v1/jobs/digital-energy-outbox/run", summary: "Run one Digital Energy outbox publisher cycle", async handler(request) { requireWorkerAdmin(request); return json(await runDigitalEnergyOutboxPublisherOnce()); } },
    { method: "GET", path: "/api/v1/jobs/stats", summary: "Return worker queue statistics", handler: () => json(workerQueue.stats()) },
    { method: "POST", path: "/api/v1/jobs", summary: "Enqueue idempotent work", async handler(request) { return json(workerQueue.enqueue(await readJson<{ type?: JobType; payload?: Record<string, unknown>; idempotencyKey?: string }>(request)), { status: 202 }); } },
    { method: "GET", path: "/api/v1/jobs/:id", summary: "Read job state", handler(_request, { params }) { return json(workerQueue.get(params.id)); } },
    { method: "POST", path: "/api/v1/jobs/:id/run", summary: "Run a queued job", handler(_request, { params }) { return json(workerQueue.run(params.id)); } },
  ],
});
