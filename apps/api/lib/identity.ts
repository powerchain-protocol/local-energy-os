import { getPrismaClient } from "@powerchain/database";
import { hashSessionToken } from "@powerchain/auth";
import type { PowerChainRole } from "@powerchain/policy";
import type { RuntimeConfig } from "@powerchain/config";

const ROLES = new Set<PowerChainRole>(["SUPERADMIN", "PLATFORM_ADMIN", "COMPANY_OWNER", "COMPANY_ADMIN", "GRID_OPERATOR", "ENERGY_TRADER", "METER_OPERATOR", "FIELD_TECHNICIAN", "HOMEOWNER", "PROSUMER", "CONSUMER", "AUDITOR", "VIEWER"]);
export interface RequestActor { id?: string; role?: PowerChainRole; source: "SESSION" | "DEV_HEADER" | "ANONYMOUS" }

function cookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function resolveActor(req: Request, runtime: RuntimeConfig, organizationId?: string): Promise<RequestActor> {
  const token = cookie(req, "powerchain_session");
  if (token) {
    try {
      const session = await getPrismaClient().session.findUnique({
        where: { tokenHash: hashSessionToken(token) },
        include: { user: { include: { memberships: organizationId ? { where: { organizationId }, take: 1 } : { take: 1 } } } },
      });
      if (session && !session.revokedAt && session.expiresAt > new Date() && !session.user.disabledAt) {
        const membership = session.user.memberships[0];
        const role = membership?.role as PowerChainRole | undefined;
        return { id: session.userId, role: role && ROLES.has(role) ? role : undefined, source: "SESSION" };
      }
    } catch {
      // A stale cookie must not make health/config routes unavailable when the DB is offline.
    }
  }
  const allowDevHeaders = runtime.environment !== "production" && process.env.POWERCHAIN_TRUST_DEV_HEADERS === "true";
  if (allowDevHeaders) {
    const role = req.headers.get("x-powerchain-role") as PowerChainRole | null;
    return { id: req.headers.get("x-powerchain-user-id") ?? undefined, role: role && ROLES.has(role) ? role : undefined, source: "DEV_HEADER" };
  }
  return { source: "ANONYMOUS" };
}
