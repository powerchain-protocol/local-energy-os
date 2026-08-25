import { readJson, withApi } from "../../../../../../lib/api";
import { persistSolanaChallenge } from "../../../../../../lib/auth-service";
import { requireString } from "@powerchain/validation";

export async function POST(req: Request) {
  return withApi(req, async () => {
    const body = (await readJson(req)) as Record<string, unknown>;
    return persistSolanaChallenge({
      wallet: requireString(body.wallet, "wallet"),
      origin: requireString(body.origin, "origin"),
      cluster: requireString(body.cluster, "cluster"),
    });
  });
}
