import type { EnergyContextType, RequestContext } from "@powerchain/contracts";
import { requestId } from "./http";

const CONTEXTS = new Set<EnergyContextType>(["HOUSEHOLD", "COMMUNITY", "COMPANY", "CLIENT", "GRID_OPERATOR"]);

export function resolveContext(req: Request): RequestContext {
  const rid = requestId(req);
  const rawContext = req.headers.get("x-powerchain-context") as EnergyContextType | null;
  return {
    requestId: rid,
    correlationId: req.headers.get("x-correlation-id") ?? rid,
    organizationId: req.headers.get("x-organization-id") ?? undefined,
    tenantId: req.headers.get("x-tenant-id") ?? undefined,
    workspaceId: req.headers.get("x-workspace-id") ?? undefined,
    contextType: rawContext && CONTEXTS.has(rawContext) ? rawContext : undefined,
  };
}

export function requireOrganization(context: RequestContext): string {
  if (!context.organizationId) {
    throw Object.assign(new Error("Organization context is required"), { code: "ORGANIZATION_CONTEXT_REQUIRED", status: 401 });
  }
  return context.organizationId;
}
