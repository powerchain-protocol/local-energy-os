export interface PlatformAccount { id: string; organizationId: string; email: string; displayName: string; role: string; avatarUrl?: string; createdAt: string; }
export function accountInitials(name: string): string { return name.trim().split(/\s+/).slice(0,2).map((part)=>part[0]?.toUpperCase() ?? "").join(""); }
