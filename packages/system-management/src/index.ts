export type ServiceState = "OPERATIONAL" | "DEGRADED" | "DELAYED" | "UNAVAILABLE" | "MAINTENANCE";
export type ServiceName = "API"|"DATABASE"|"REALTIME"|"TELEMETRY"|"MARKET"|"SETTLEMENT"|"SOLANA"|"SUI"|"SAP"|"ORACLES"|"REWARDS";
export interface ServiceHealth { name: ServiceName; state: ServiceState; updatedAt: string; message?: string }
export function writeAllowed(services: ServiceHealth[]) {
  const critical = new Set<ServiceName>(["DATABASE","SETTLEMENT"]);
  return !services.some(s => critical.has(s.name) && (s.state === "UNAVAILABLE" || s.state === "MAINTENANCE"));
}
export function degradedPolicy(service: ServiceName, state: ServiceState): string {
  if (state === "OPERATIONAL") return "continue";
  const policies: Partial<Record<ServiceName,string>> = {
    SOLANA:"preserve-submitted-state;delay-confirmation;no-duplicate-submit",
    SUI:"pause-sui-finalization;preserve-canonical-ledger",
    SAP:"queue-outbox;continue-core-domain",
    TELEMETRY:"mark-stale;block-low-quality-settlement",
    MARKET:"preserve-orders;pause-new-matching",
    REWARDS:"pause-rewards;continue-energy"
  };
  return policies[service] ?? "degrade-safely";
}
