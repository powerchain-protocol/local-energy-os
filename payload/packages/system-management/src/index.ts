export type Environment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type OperatingMode = "SIMULATION" | "LIVE";
export type DataMode = "MOCK" | "LIVE";
export type WriteMode = "SIMULATED" | "DISABLED" | "ENABLED";
export type Network = "DEVNET" | "TESTNET" | "MAINNET";

export interface RuntimeConfiguration {
  environment: Environment;
  operatingMode: OperatingMode;
  dataMode: DataMode;
  writeMode: WriteMode;
  network: Network;
  version: string;
}

export function validateRuntimeConfiguration(config: RuntimeConfiguration): RuntimeConfiguration {
  if (config.network === "MAINNET" && config.dataMode === "MOCK" && config.writeMode === "ENABLED") {
    throw new Error("UNSAFE_RUNTIME: MAINNET + MOCK DATA + WRITES ENABLED is forbidden");
  }
  if (config.network === "MAINNET" && config.operatingMode === "SIMULATION" && config.writeMode === "ENABLED") {
    throw new Error("UNSAFE_RUNTIME: MAINNET simulation cannot enable writes");
  }
  if (config.operatingMode === "LIVE" && config.dataMode !== "LIVE") {
    throw new Error("UNSAFE_RUNTIME: LIVE operating mode requires LIVE data");
  }
  return config;
}

export type SubsystemState = "OPERATIONAL" | "DEGRADED" | "DELAYED" | "UNAVAILABLE" | "MAINTENANCE";

export type Subsystem =
  | "API" | "DATABASE" | "SUPABASE" | "TELEMETRY" | "MARKET_MATCHER"
  | "SETTLEMENT" | "SOLANA_RPC" | "SUI_RPC" | "INDEXER" | "ORACLE_ROUTER"
  | "SAP" | "X402" | "CCTP" | "WORKERS" | "NOTIFICATIONS" | "REWARDS";

export interface HealthSignal {
  subsystem: Subsystem;
  state: SubsystemState;
  observedAt: Date;
  message?: string;
}

export const DEGRADED_POLICIES = {
  SOLANA_RPC: "PRESERVE_PENDING_SETTLEMENT_NO_DUPLICATE_SUBMISSION",
  SUI_RPC: "PAUSE_BRIDGE_COMPLETION_PRESERVE_SOURCE_STATE",
  ORACLE_ROUTER: "STOP_PRICE_SENSITIVE_OPERATIONS",
  SAP: "QUEUE_SYNCHRONIZATION",
  TELEMETRY: "MARK_STALE_AND_BLOCK_SETTLEMENT_WHEN_REQUIRED",
  REWARDS: "ENERGY_OPERATIONS_CONTINUE",
} as const;
