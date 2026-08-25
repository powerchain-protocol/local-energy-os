import type { SystemManagementStatus, SystemServiceId, SystemServiceState, SystemServiceStatus } from "./types/status";

const unavailable = (services: SystemServiceStatus[], id: SystemServiceId) =>
  services.some(service => service.id === id && ["UNAVAILABLE", "UNCONFIGURED", "MAINTENANCE"].includes(service.state));

export function degradedPolicy(service: SystemServiceId | string, state: SystemServiceState): string {
  if (state === "OPERATIONAL") return "continue";
  const policies: Partial<Record<SystemServiceId, string>> = {
    database: "block-economic-writes;preserve-read-only-surfaces",
    redis: "degrade-realtime;preserve-canonical-database-state",
    realtime: "degrade-streaming;allow-request-response-api",
    grpc: "degrade-internal-streaming;preserve-rest-api",
    solana: "preserve-submitted-state;delay-confirmation;no-duplicate-submit",
    sui: "pause-sui-finalization;preserve-canonical-ledger",
    telemetry: "mark-stale;block-low-quality-settlement",
    market: "preserve-orders;pause-new-matching",
    settlement: "pause-final-settlement;preserve-delivery-evidence",
    oracles: "block-price-sensitive-execution;preserve-last-observation-with-stale-marker",
    rewards: "pause-rewards;continue-energy",
    storage: "queue-noncritical-evidence-exports;block-required-evidence-finalization",
  };
  const normalized = service.toLowerCase() as SystemServiceId;
  return policies[normalized] ?? "degrade-safely";
}

export function managementStatus(services: SystemServiceStatus[]): SystemManagementStatus {
  const reasons: string[] = [];
  const databaseUnavailable = unavailable(services, "database");
  const settlementUnavailable = unavailable(services, "settlement");
  const marketUnavailable = unavailable(services, "market");
  const solanaUnavailable = unavailable(services, "solana");
  const rewardsUnavailable = unavailable(services, "rewards");

  if (databaseUnavailable) reasons.push("database-unavailable");
  if (settlementUnavailable) reasons.push("settlement-unavailable");
  if (marketUnavailable) reasons.push("market-unavailable");
  if (solanaUnavailable) reasons.push("solana-unavailable");
  if (rewardsUnavailable) reasons.push("rewards-unavailable");

  return {
    writesAllowed: !databaseUnavailable && !settlementUnavailable,
    settlementAllowed: !databaseUnavailable && !settlementUnavailable,
    marketMatchingAllowed: !databaseUnavailable && !marketUnavailable,
    bridgeFinalizationAllowed: !databaseUnavailable && !solanaUnavailable,
    rewardsAllowed: !databaseUnavailable && !rewardsUnavailable,
    reasons,
  };
}

// Backwards-compatible aliases used by the worker and older call sites.
export type ServiceState = SystemServiceState;
export type ServiceName = "API" | "DATABASE" | "REALTIME" | "TELEMETRY" | "MARKET" | "SETTLEMENT" | "SOLANA" | "SUI" | "SAP" | "ORACLES" | "REWARDS";
export interface ServiceHealth { name: ServiceName; state: SystemServiceState; updatedAt: string; message?: string }

export function writeAllowed(services: ServiceHealth[]): boolean {
  return !services.some(service => ["DATABASE", "SETTLEMENT"].includes(service.name) && ["UNAVAILABLE", "UNCONFIGURED", "MAINTENANCE"].includes(service.state));
}
