import { NextResponse } from "next/server";
import { transactionSchema } from "@/schemas/transactions";
import { parseUnits } from "@/lib/payments";
import { createId } from "@/utils/helpers";
import { errorPayload, toPowerChainError } from "@/utils/errors";
export async function POST(request: Request) {
  try { const input = transactionSchema.parse(await request.json()); parseUnits(input.amount, input.decimals); return NextResponse.json({ transaction: { id: createId("tx"), ...input, status: "requires_signature" } }, { status: 201 }); }
  catch (error) { const normalized = toPowerChainError(error); return NextResponse.json(errorPayload(normalized), { status: normalized.status }); }
}
