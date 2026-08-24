import { assertWrappedSupply } from "@powerchain/pwrc";

export type PwrcBridgeState =
  | "REQUESTED"
  | "LOCKING"
  | "LOCKED"
  | "MINTING"
  | "ACTIVE"
  | "BURNING"
  | "RELEASING"
  | "COMPLETED"
  | "FAILED";

export interface PwrcBridgePosition {
  id: string;
  sourceNetwork: "SOLANA";
  destinationNetwork: "SUI";
  pwrcAmountBaseUnits: bigint;
  sourceReference?: string;
  destinationReference?: string;
  state: PwrcBridgeState;
}

export interface PwrcBridgeSupply {
  lockedPwrcBaseUnits: bigint;
  mintedWpwrcBaseUnits: bigint;
}

export function validatePwrcBridgeSupply(supply: PwrcBridgeSupply) {
  assertWrappedSupply(supply.lockedPwrcBaseUnits, supply.mintedWpwrcBaseUnits);
  return supply;
}

export function toWpwrcAmount(pwrcBaseUnits: bigint): bigint {
  if (pwrcBaseUnits < 0n) throw new RangeError("PWRC amount cannot be negative");
  return pwrcBaseUnits;
}
