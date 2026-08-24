import type { Role } from "@/lib/rbac/permissions";
export type TenantContext = { organizationId: string; userId: string; role: Role; locale: string };
export function getDemoTenant(): TenantContext { return { organizationId: "org_powerchain", userId: "user_demo", role: "owner", locale: "en" }; }
