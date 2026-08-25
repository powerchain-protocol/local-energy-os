import type { RequestContext } from "@powerchain/contracts";
import type { RuntimeConfig } from "@powerchain/config";

export type PowerChainRole = "SUPERADMIN" | "PLATFORM_ADMIN" | "COMPANY_OWNER" | "COMPANY_ADMIN" | "GRID_OPERATOR" | "ENERGY_TRADER" | "METER_OPERATOR" | "FIELD_TECHNICIAN" | "HOMEOWNER" | "PROSUMER" | "CONSUMER" | "AUDITOR" | "VIEWER";
export type PolicyAction = "ENERGY_PROOF_WRITE" | "ENERGY_BATCH_WRITE" | "ENERGY_POSITION_WRITE" | "ENERGY_RETIRE" | "SAAS_ADMIN" | "GRID_WRITE";
export type PolicyDecision = { outcome: "ALLOW" | "REVIEW" | "BLOCK"; reason: string };

const mutationRoles: Record<PolicyAction, ReadonlySet<PowerChainRole>> = {
  ENERGY_PROOF_WRITE: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "METER_OPERATOR", "COMPANY_ADMIN"]),
  ENERGY_BATCH_WRITE: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "METER_OPERATOR", "COMPANY_ADMIN"]),
  ENERGY_POSITION_WRITE: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "COMPANY_ADMIN", "ENERGY_TRADER", "PROSUMER"]),
  ENERGY_RETIRE: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "COMPANY_ADMIN", "ENERGY_TRADER"]),
  SAAS_ADMIN: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "COMPANY_OWNER", "COMPANY_ADMIN"]),
  GRID_WRITE: new Set(["SUPERADMIN", "PLATFORM_ADMIN", "GRID_OPERATOR"]),
};

export function decidePolicy(input: { action: PolicyAction; role?: PowerChainRole; context: RequestContext; runtime: RuntimeConfig }): PolicyDecision {
  if (input.runtime.writeMode === "disabled" || input.runtime.operatingMode === "READ_ONLY" || input.runtime.operatingMode === "MAINTENANCE") {
    return { outcome: "BLOCK", reason: "RUNTIME_WRITES_DISABLED" };
  }
  if (!input.context.organizationId) return { outcome: "BLOCK", reason: "ORGANIZATION_CONTEXT_REQUIRED" };
  if (!input.role) return { outcome: "BLOCK", reason: "ROLE_REQUIRED" };
  if (!mutationRoles[input.action].has(input.role)) return { outcome: "BLOCK", reason: "ROLE_NOT_AUTHORIZED" };
  if (input.runtime.writeMode === "simulated") return { outcome: "REVIEW", reason: "SIMULATED_WRITE_MODE" };
  return { outcome: "ALLOW", reason: "POLICY_ALLOW" };
}

export function assertPolicyAllowed(decision: PolicyDecision): void {
  if (decision.outcome === "BLOCK") throw Object.assign(new Error(decision.reason), { code: "POLICY_BLOCKED", status: 403 });
}
