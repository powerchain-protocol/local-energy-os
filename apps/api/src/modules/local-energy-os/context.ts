export interface RequestContext {
  requestId: string;
  correlationId?: string;
  organizationId?: string;
  tenantId?: string;
  workspaceId?: string;
  contextType?: "HOUSEHOLD" | "COMMUNITY" | "COMPANY" | "CLIENT" | "GRID_OPERATOR" | "PORTFOLIO" | "VPP";
}
export function resolveRequestContext(request: any): RequestContext {
  const headers = request?.headers ?? {};
  return {
    requestId: String(request?.id ?? headers["x-request-id"] ?? crypto.randomUUID()),
    correlationId: headers["x-correlation-id"] ? String(headers["x-correlation-id"]) : undefined,
    organizationId: headers["x-organization-id"] ? String(headers["x-organization-id"]) : undefined,
    tenantId: headers["x-tenant-id"] ? String(headers["x-tenant-id"]) : undefined,
    workspaceId: headers["x-workspace-id"] ? String(headers["x-workspace-id"]) : undefined,
    contextType: headers["x-context-type"] as RequestContext["contextType"],
  };
}
