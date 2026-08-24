export const PWRC = {
  symbol: "PWRC",
  network: "solana-mainnet-beta",
  standard: "SPL Token-2022",
  mint: "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  decimals: 9,
  fixedSupply: 18_446_000_000n,
} as const;

export const WPWRC = {
  symbol: "wPWRC",
  network: "sui",
  backing: "PWRC",
  ratioNumerator: 1n,
  ratioDenominator: 1n,
} as const;

export function assertWrappedSupply(pwrcLockedBaseUnits: bigint, wpwrcSupplyBaseUnits: bigint) {
  if (wpwrcSupplyBaseUnits > pwrcLockedBaseUnits) {
    throw new Error("wPWRC supply exceeds locked/allocated PWRC backing");
  }
}

export function assertPwrcIsNotEnergy() {
  return {
    PWRC_IS_ENERGY: false,
    WPWRC_IS_ENERGY: false,
    ENERGY_UNIT: "Wh",
  } as const;
}
