export const roles = ["viewer", "operator", "manager", "administrator"] as const;
export type Role = (typeof roles)[number];

export type Permission =
  | "assets:read"
  | "assets:write"
  | "telemetry:read"
  | "alarms:acknowledge"
  | "billing:manage"
  | "users:manage";

const grants: Record<Role, readonly Permission[]> = {
  viewer: ["assets:read", "telemetry:read"],
  operator: ["assets:read", "assets:write", "telemetry:read", "alarms:acknowledge"],
  manager: ["assets:read", "assets:write", "telemetry:read", "alarms:acknowledge", "billing:manage"],
  administrator: ["assets:read", "assets:write", "telemetry:read", "alarms:acknowledge", "billing:manage", "users:manage"],
};

export function can(role: Role, permission: Permission) {
  return grants[role].includes(permission);
}
