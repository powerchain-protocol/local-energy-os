import type { RequestContext } from "@powerchain/contracts";

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  actorId?: string;
  actorRole?: string;
  organizationId?: string;
  requestId: string;
  correlationId: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED";
  metadata?: Record<string, unknown>;
}

export function auditEntry(input: Omit<AuditEntry, "requestId" | "correlationId" | "organizationId"> & { context: RequestContext }): AuditEntry {
  return {
    ...input,
    organizationId: input.context.organizationId,
    requestId: input.context.requestId,
    correlationId: input.context.correlationId,
  };
}
