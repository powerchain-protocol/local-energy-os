export type SystemOverallState = "OPERATIONAL" | "DEGRADED" | "UNAVAILABLE" | "MAINTENANCE";

export type SystemServiceState =
  | "OPERATIONAL"
  | "DEGRADED"
  | "DELAYED"
  | "UNAVAILABLE"
  | "MAINTENANCE"
  | "DISABLED"
  | "UNCONFIGURED"
  | "UNKNOWN";

export type SystemServiceId =
  | "api"
  | "database"
  | "redis"
  | "realtime"
  | "grpc"
  | "telemetry"
  | "market"
  | "settlement"
  | "solana"
  | "sui"
  | "oracles"
  | "rewards"
  | "storage";

export interface SystemServiceStatus {
  id: SystemServiceId;
  name: string;
  state: SystemServiceState;
  configured: boolean;
  critical: boolean;
  observedAt: string;
  latencyMs?: number;
  message?: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface SystemRuntimeStatus {
  version: string;
  environment: "development" | "staging" | "production";
  operatingMode: "LIVE" | "READ_ONLY" | "SIMULATION" | "MAINTENANCE";
  dataMode: "live" | "mock" | "tba";
  writeMode: "enabled" | "simulated" | "disabled";
  network: "devnet" | "mainnet-beta";
}

export interface SystemStatusSnapshot {
  overall: SystemOverallState;
  generatedAt: string;
  probe: "shallow" | "deep";
  runtime: SystemRuntimeStatus;
  services: SystemServiceStatus[];
  management: SystemManagementStatus;
}

export interface SystemManagementStatus {
  writesAllowed: boolean;
  settlementAllowed: boolean;
  marketMatchingAllowed: boolean;
  bridgeFinalizationAllowed: boolean;
  rewardsAllowed: boolean;
  reasons: string[];
}

export interface SystemPublicConfig {
  version: string;
  environment: SystemRuntimeStatus["environment"];
  operatingMode: SystemRuntimeStatus["operatingMode"];
  dataMode: SystemRuntimeStatus["dataMode"];
  writeMode: SystemRuntimeStatus["writeMode"];
  network: SystemRuntimeStatus["network"];
  database: {
    configured: boolean;
    source: "DIRECT_URL" | "DATABASE_URL" | "PG_VARS" | "DEVELOPMENT_FALLBACK" | "NONE";
    host?: string;
    port?: number;
    database?: string;
  };
  redis: { configured: boolean; host?: string; port?: number };
  solana: {
    cluster: "devnet" | "mainnet-beta";
    provider: "public" | "helius" | "custom";
    rpcHost?: string;
    websocketHost?: string;
    energyRwaProgramConfigured: boolean;
    pwrcMintConfigured: boolean;
    heliusEnabled: boolean;
  };
  features: Record<string, boolean>;
}
