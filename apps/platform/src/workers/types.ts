export type WorkerStatus = "idle" | "running" | "paused" | "failed";

export interface PlatformWorker<TPayload = unknown> {
  id: string;
  name: string;
  queue: string;
  status: WorkerStatus;
  attempts: number;
  payload?: TPayload;
  updatedAt: string;
}
