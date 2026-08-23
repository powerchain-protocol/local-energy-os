import { WPWRC } from "@powerchain/pwrc";
export const SUI_LOCAL_ENERGY = {
  network: "SUI",
  wrappedAsset: WPWRC.symbol,
  representationKinds: ["ENERGY_POSITION", "ENERGY_BATCH", "ASSET_PASSPORT", "CERTIFICATE", "SETTLEMENT_PROOF"],
} as const;
