export const PWRC_CHAIN = "SOLANA" as const;
export const WPWRC_CHAIN = "SUI" as const;
export const PWRC_DECIMALS = 9;
export const PWRC_MINT = "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" as const;
export const PWRC_FIXED_SUPPLY = 18_446_000_000n;

export interface PwrcBridgeAccounting {
  canonicalSupplyBaseUnits: bigint;
  solanaUnlockedBaseUnits: bigint;
  solanaEscrowedBaseUnits: bigint;
  suiWrappedBaseUnits: bigint;
}

export function assertPwrcBridgeInvariant(a: PwrcBridgeAccounting) {
  if (a.suiWrappedBaseUnits > a.solanaEscrowedBaseUnits) throw new Error("WPWRC_UNDERBACKED");
  if (a.solanaUnlockedBaseUnits + a.solanaEscrowedBaseUnits > a.canonicalSupplyBaseUnits) throw new Error("PWRC_SUPPLY_EXCEEDED");
}

export function quoteBridgeToSui(amountBaseUnits: bigint) {
  if (amountBaseUnits <= 0n) throw new Error("INVALID_PWRC_BRIDGE_AMOUNT");
  return { sourceAsset: "PWRC", destinationAsset: "wPWRC", sourceChain: PWRC_CHAIN, destinationChain: WPWRC_CHAIN, inputBaseUnits: amountBaseUnits, outputBaseUnits: amountBaseUnits } as const;
}
