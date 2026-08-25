import { withApi, readJson, requireIdempotencyKey } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { authorizeMutation } from "../../../../lib/authorize";
import { executeIdempotent } from "../../../../lib/idempotency";
import { createEnergyBatch, listEnergyBatches } from "../../../../lib/energy-ledger";
import { parseCreateBatchInput } from "@powerchain/validation";

export async function GET(req: Request) {
  return withApi(req, async ({ context }) => ({
    items: await listEnergyBatches(requireOrganization(context)),
  }));
}

export async function POST(req: Request) {
  return withApi(
    req,
    async (execution) => {
      const body = await readJson(req);
      const key = requireIdempotencyKey(req);
      requireOrganization(execution.context);
      authorizeMutation(execution, "ENERGY_BATCH_WRITE");
      return executeIdempotent({
        context: execution.context,
        key,
        method: "POST",
        path: "/api/v1/energy-batches",
        body,
        execute: () =>
          createEnergyBatch(
            execution.context,
            execution.actor,
            parseCreateBatchInput(body),
          ),
      });
    },
    { status: 201 },
  );
}
