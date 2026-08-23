export const LOCAL_ENERGY_OS = {
  version: "1.0.0",
  canonicalEnergyUnit: "Wh",
  displayUnits: ["kWh", "MWh", "GWh"],
  settlementAssets: ["EUR", "EURC", "USDC", "PWRC"],
  networks: {
    pwrc: "SOLANA",
    wpwrc: "SUI",
  },
} as const;
