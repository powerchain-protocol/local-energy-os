import { withApi, readJson, requireIdempotencyKey } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { authorizeMutation } from "../../../../lib/authorize";
import { executeIdempotent } from "../../../../lib/idempotency";
import { createEnergyProof, listEnergyProofs } from "../../../../lib/energy-ledger";
import { parseCreateEnergyProofInput } from "@powerchain/validation";

export async function GET(req: Request) {
  return withApi(req, async ({ context }) => ({
    items: await listEnergyProofs(requireOrganization(context)),
  }));
}

export async function POST(req: Request) {
  return withApi(
    req,
    async (execution) => {
      const body = await readJson(req);
      const key = requireIdempotencyKey(req);
      requireOrganization(execution.context);
      authorizeMutation(execution, "ENERGY_PROOF_WRITE");
      return executeIdempotent({
        context: execution.context,
        key,
        method: "POST",
        path: "/api/v1/energy-proofs",
        body,
        execute: () =>
          createEnergyProof(
            execution.context,
            execution.actor,
            parseCreateEnergyProofInput(body),
          ),
      });
    },
    { status: 201 },
  );
}
