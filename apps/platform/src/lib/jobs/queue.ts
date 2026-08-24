export type JobName = "telemetry.ingest" | "asset.health.recalculate" | "alerts.evaluate" | "carbon.reconcile" | "reports.generate";
export interface Job<T=unknown>{ id:string; name:JobName; payload:T; createdAt:string }
const jobs:Job[]=[];
export async function enqueue<T>(name:JobName,payload:T){ const job={id:crypto.randomUUID(),name,payload,createdAt:new Date().toISOString()}; jobs.push(job); return job; }
export async function pendingJobs(){ return [...jobs]; }
