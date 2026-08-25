import { withApi, readJson, requireIdempotencyKey } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { authorizeMutation } from "../../../../lib/authorize";
import { executeIdempotent } from "../../../../lib/idempotency";
import { createEnergyPosition, listEnergyPositions } from "../../../../lib/energy-ledger";
import { parseIssuePositionInput } from "@powerchain/validation";

export async function GET(req: Request) {
  return withApi(req, async ({ context }) => ({
    items: await listEnergyPositions(requireOrganization(context)),
  }));
}

export async function POST(req: Request) {
  return withApi(
    req,
    async (execution) => {
      const body = await readJson(req);
      const key = requireIdempotencyKey(req);
      requireOrganization(execution.context);
      authorizeMutation(execution, "ENERGY_POSITION_WRITE");
      return executeIdempotent({
        context: execution.context,
        key,
        method: "POST",
        path: "/api/v1/energy-positions",
        body,
        execute: () =>
          createEnergyPosition(
            execution.context,
            execution.actor,
            parseIssuePositionInput(body),
          ),
      });
    },
    { status: 201 },
  );
}
