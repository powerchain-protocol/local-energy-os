import type { PlatformWorker } from "./types";

const workers = new Map<string, PlatformWorker>();

export function registerWorker(worker: PlatformWorker): PlatformWorker {
  workers.set(worker.id, worker);
  return worker;
}

export function listWorkers(): PlatformWorker[] {
  return [...workers.values()];
}

export function getWorker(id: string): PlatformWorker | undefined {
  return workers.get(id);
}
