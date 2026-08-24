export type OperationState =
  "received" | "executing" | "succeeded" | "failed" | "reconciliation-required";
export interface IdempotentCommand<T> {
  operationId: string;
  actorId: string;
  payload: T;
  requestedAt: string;
}
export interface IdempotencyRecord {
  operationId: string;
  state: OperationState;
  updatedAt: string;
  providerReference?: string;
}
export class MemoryIdempotencyStore {
  private records = new Map<string, IdempotencyRecord>();
  get(id: string) {
    return this.records.get(id);
  }
  set(record: IdempotencyRecord) {
    this.records.set(record.operationId, record);
    return record;
  }
}
