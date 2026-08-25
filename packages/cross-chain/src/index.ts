export type Chain = "SOLANA" | "SUI";
export type RepresentationState = "ACTIVE"|"LOCKED"|"BURNING"|"MIGRATING"|"RETIRED";
export interface ChainRepresentation { positionId: string; chain: Chain; amountWh: bigint; state: RepresentationState; reference: string }
export function assertRwaCrossChainInvariant(canonicalWh: bigint, reps: ChainRepresentation[]) {
  const active = reps.filter(r => r.state === "ACTIVE" || r.state === "LOCKED" || r.state === "MIGRATING").reduce((a,r)=>a+r.amountWh,0n);
  if (active > canonicalWh) throw new Error("CROSS_CHAIN_ENERGY_OVERISSUANCE");
}
export interface CrossChainAdapter {
  quote(input: {asset:string; amountBaseUnits:bigint; from:Chain; to:Chain}): Promise<{feeBaseUnits:bigint; expiresAt:string}>;
  submit(input: {asset:string; amountBaseUnits:bigint; from:Chain; to:Chain; idempotencyKey:string}): Promise<{transferId:string}>;
  status(transferId:string): Promise<{state:string}>;
}
