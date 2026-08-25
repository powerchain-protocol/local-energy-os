import { withApi } from "../../../../../lib/api";
import { getPrismaClient } from "@powerchain/database";
import { hashSessionToken } from "@powerchain/auth";

function sessionToken(req: Request): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "powerchain_session") return decodeURIComponent(rest.join("="));
  }
}

export async function GET(req: Request) {
  return withApi(req, async ({ actor }) => {
    if (actor.source === "ANONYMOUS") throw Object.assign(new Error("Authentication required"), { code: "UNAUTHENTICATED", status: 401 });
    return { authenticated: true, userId: actor.id, role: actor.role, source: actor.source };
  });
}

export async function DELETE(req: Request) {
  const response = await withApi(req, async ({ actor }) => {
    if (actor.source === "ANONYMOUS") return { signedOut: true };
    const token = sessionToken(req);
    if (token) await getPrismaClient().session.updateMany({ where: { tokenHash: hashSessionToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
    return { signedOut: true };
  });
  response.headers.append("set-cookie", "powerchain_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return response;
}
