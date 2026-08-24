export const permissions = [
  "organization:read", "organization:manage", "member:invite", "member:manage",
  "asset:read", "asset:manage", "telemetry:read", "telemetry:manage",
  "incident:read", "incident:manage", "carbon:read", "carbon:issue",
  "treasury:read", "treasury:manage", "audit:read", "plugin:manage"
] as const;
export type Permission = (typeof permissions)[number];
export type Role = "owner" | "admin" | "operator" | "analyst" | "auditor" | "viewer";
export const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: permissions,
  admin: permissions.filter((p) => p !== "treasury:manage"),
  operator: ["organization:read","asset:read","asset:manage","telemetry:read","incident:read","incident:manage","carbon:read"],
  analyst: ["organization:read","asset:read","telemetry:read","incident:read","carbon:read","treasury:read"],
  auditor: ["organization:read","asset:read","telemetry:read","incident:read","carbon:read","treasury:read","audit:read"],
  viewer: ["organization:read","asset:read","telemetry:read","incident:read","carbon:read"]
};
export function can(role: Role, permission: Permission) { return rolePermissions[role].includes(permission); }
