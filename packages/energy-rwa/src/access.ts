import type { EnergyRwaAccessContext, TenantScopedEnergyRwa } from "./types.js";

export class EnergyRwaAuthorizationError extends Error {
  constructor(readonly code: "TENANT_SCOPE_DENIED" | "ORGANIZATION_SCOPE_DENIED" | "COMPANY_SCOPE_DENIED") {
    super(code);
    this.name = "EnergyRwaAuthorizationError";
  }
}

export function assertEnergyRwaAccess(context: EnergyRwaAccessContext, asset: TenantScopedEnergyRwa): void {
  if (context.tenantId !== asset.tenantId) throw new EnergyRwaAuthorizationError("TENANT_SCOPE_DENIED");
  const crossOrg = context.scopes?.includes("energy-rwa.cross-organization") || context.scopes?.includes("tenant.admin") || false;
  if (!crossOrg && (!context.organizationId || context.organizationId !== asset.organizationId)) {
    throw new EnergyRwaAuthorizationError("ORGANIZATION_SCOPE_DENIED");
  }
  const crossCompany = context.scopes?.includes("energy-rwa.cross-company") || context.scopes?.includes("tenant.admin") || false;
  if (asset.companyId && !crossCompany && (!context.companyId || asset.companyId !== context.companyId)) {
    throw new EnergyRwaAuthorizationError("COMPANY_SCOPE_DENIED");
  }
}
