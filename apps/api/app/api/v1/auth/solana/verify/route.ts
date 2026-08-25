import { readJson, withApi } from "../../../../../../lib/api";
import { verifySolanaChallenge } from "../../../../../../lib/auth-service";
import { requireString } from "@powerchain/validation";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const result = await withApi(req, async () => {
    const body = (await readJson(req)) as Record<string, unknown>;
    return verifySolanaChallenge({
      wallet: requireString(body.wallet, "wallet"),
      nonce: requireString(body.nonce, "nonce"),
      signature: requireString(body.signature, "signature"),
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip,
    });
  });

  if (result.ok) {
    const payload = (await result.clone().json()) as {
      data?: { token?: string; expiresAt?: string };
    };
    const token = payload.data?.token;
    if (token) {
      const secure = process.env.POWERCHAIN_ENVIRONMENT === "production" ? "; Secure" : "";
      result.headers.append(
        "set-cookie",
        `powerchain_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${27 * 24 * 60 * 60}`,
      );
      const sanitized = structuredClone(payload);
      if (sanitized.data) delete sanitized.data.token;
      return new Response(JSON.stringify(sanitized), {
        status: result.status,
        headers: result.headers,
      });
    }
  }

  return result;
}
