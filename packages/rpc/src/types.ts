export interface RpcProviderHealth { provider: string; latencyMs?: number; healthy: boolean; checkedAt: string; }
export interface RpcRouteDecision { provider: string; reason: string; failover: boolean; }
