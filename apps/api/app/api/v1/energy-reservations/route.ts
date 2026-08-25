import { withApi, readJson, requireIdempotencyKey } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { authorizeMutation } from "../../../../lib/authorize";
import { executeIdempotent } from "../../../../lib/idempotency";
import { listEnergyReservations, reserveEnergyPosition } from "../../../../lib/energy-ledger";
import { parsePositionAmountInput } from "@powerchain/validation";

export async function GET(req: Request) {
  return withApi(req, async ({ context }) => ({
    items: await listEnergyReservations(requireOrganization(context)),
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
        path: "/api/v1/energy-reservations",
        body,
        execute: () =>
          reserveEnergyPosition(
            execution.context,
            execution.actor,
            parsePositionAmountInput(body),
          ),
      });
    },
    { status: 201 },
  );
}
