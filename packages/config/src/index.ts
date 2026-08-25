export const CANONICAL_VERSION = "1.0.0" as const;
export type Environment = "development" | "staging" | "production";
export type OperatingMode = "LIVE" | "READ_ONLY" | "SIMULATION" | "MAINTENANCE";
export type DataMode = "live" | "mock" | "tba";
export type WriteMode = "enabled" | "simulated" | "disabled";
export type PowerChainNetwork = "devnet" | "mainnet-beta";

export interface RuntimeConfig {
  version: string;
  environment: Environment;
  operatingMode: OperatingMode;
  dataMode: DataMode;
  writeMode: WriteMode;
  network: PowerChainNetwork;
}

export function assertSafeRuntime(c: RuntimeConfig): RuntimeConfig {
  if (c.version !== CANONICAL_VERSION) throw new Error(`VERSION_MISMATCH:${c.version}`);
  if (c.network === "mainnet-beta" && c.writeMode === "enabled" && c.dataMode !== "live") {
    throw new Error("UNSAFE_MAINNET_NONLIVE_WRITES");
  }
  if (c.operatingMode === "READ_ONLY" && c.writeMode === "enabled") {
    throw new Error("READ_ONLY_WRITE_CONFLICT");
  }
  if (c.operatingMode === "SIMULATION" && c.writeMode === "enabled") {
    throw new Error("SIMULATION_REAL_WRITE_CONFLICT");
  }
  return c;
}
