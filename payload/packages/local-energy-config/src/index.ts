export const POWERCHAIN_LOCAL_ENERGY = {
  product: "PowerChain Local Energy OS",
  version: "1.0.0",
  canonicalEnergyUnit: "Wh",
  displayEnergyUnits: ["kWh", "MWh", "GWh"],
  energyRwaMetadata: { standard: "PET-20", version: "1.0.0" },
  assets: {
    PWRC: { network: "SOLANA", kind: "UTILITY_REWARD", energyAsset: false },
    wPWRC: { network: "SUI", kind: "BRIDGED_UTILITY", backing: "PWRC", ratio: "1:1", energyAsset: false },
  },
  providers: {
    pythHermes: "https://pyth.dourolabs.app/hermes",
    birdeye: "https://public-api.birdeye.so",
    coinmarketcap: "https://pro-api.coinmarketcap.com",
    solscan: "https://solscan.io",
    suiscan: "https://suiscan.xyz",
  },
} as const;
