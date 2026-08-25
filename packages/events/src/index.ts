import { randomUUID } from "node:crypto";
import type { RequestContext } from "@powerchain/contracts";

export interface DomainEvent<T> {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  organizationId?: string;
  aggregateType: string;
  aggregateId: string;
  requestId?: string;
  correlationId?: string;
  causationId?: string;
  payload: T;
}

export function createDomainEvent<T>(input: { type: string; aggregateType: string; aggregateId: string; payload: T; context?: Partial<RequestContext>; causationId?: string; version?: number }): DomainEvent<T> {
  return {
    id: randomUUID(),
    type: input.type,
    version: input.version ?? 1,
    occurredAt: new Date().toISOString(),
    organizationId: input.context?.organizationId,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    requestId: input.context?.requestId,
    correlationId: input.context?.correlationId,
    causationId: input.causationId,
    payload: input.payload,
  };
}
