import type { AppRole } from "@/types/auth";

export type Permission =
  | "dashboard:view" | "assets:view" | "assets:manage" | "marketplace:trade"
  | "treasury:view" | "treasury:manage" | "users:manage" | "system:admin" | "ai:use";

const matrix: Record<AppRole, readonly Permission[]> = {
  consumer: ["dashboard:view", "assets:view", "marketplace:trade", "ai:use"],
  prosumer: ["dashboard:view", "assets:view", "assets:manage", "marketplace:trade", "treasury:view", "ai:use"],
  company: ["dashboard:view", "assets:view", "assets:manage", "marketplace:trade", "treasury:view", "treasury:manage", "users:manage", "ai:use"],
  admin: ["dashboard:view", "assets:view", "assets:manage", "marketplace:trade", "treasury:view", "treasury:manage", "users:manage", "ai:use"],
  "super-admin": ["dashboard:view", "assets:view", "assets:manage", "marketplace:trade", "treasury:view", "treasury:manage", "users:manage", "system:admin", "ai:use"],
  client: ["dashboard:view", "assets:view", "marketplace:trade", "treasury:view", "ai:use"]
};

export function can(role: AppRole, permission: Permission): boolean { return matrix[role].includes(permission); }
export function requirePermission(role: AppRole, permission: Permission): void { if (!can(role, permission)) throw new Error(`Missing permission: ${permission}`); }
export const rolePermissions = matrix;
