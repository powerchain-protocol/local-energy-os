import { z } from "zod";
import { db } from "@/lib/server/db";
import { publicKeySchema } from "@/types/validate";

const evmAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const suiAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);
const schema = z.discriminatedUnion("network", [
  z.object({ address: publicKeySchema, network: z.literal("solana"), provider: z.string().trim().min(2).max(60) }),
  z.object({ address: suiAddressSchema, network: z.literal("sui"), provider: z.string().trim().min(2).max(60) }),
  z.object({ address: evmAddressSchema, network: z.literal("evm"), provider: z.string().trim().min(2).max(60) }),
]);

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ ok: false, error: "Invalid wallet session", issues: parsed.error.issues }, { status: 400 });
  const session = await db.walletSession.upsert({ ...parsed.data, connectedAt: new Date().toISOString() });
  return Response.json({ ok: true, data: session }, { status: 201 });
}
