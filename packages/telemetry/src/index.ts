export type TelemetryFreshness = "LIVE"|"STALE"|"RECONNECTING"|"DEGRADED"|"OFFLINE"|"SIMULATED";
export interface TelemetryEnvelope<T> { deviceId: string; sequence: bigint; observedAt: string; receivedAt: string; payload: T; signature?: string; simulated?: boolean }
export function freshness(input: { observedAt: string; now?: Date; liveMs?: number; staleMs?: number; simulated?: boolean }): TelemetryFreshness {
  if (input.simulated) return "SIMULATED";
  const age = (input.now ?? new Date()).getTime() - new Date(input.observedAt).getTime();
  if (!Number.isFinite(age) || age < -60_000) return "DEGRADED";
  if (age <= (input.liveMs ?? 30_000)) return "LIVE";
  if (age <= (input.staleMs ?? 5 * 60_000)) return "STALE";
  return "OFFLINE";
}
