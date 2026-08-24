export interface MeterTelemetry {
  meterId: string;
  voltage: number;
  current: number;
  frequency: number;
  activePower: number;
  reactivePower: number;
  powerFactor: number;
  thd: number;
  signal: number;
  latency: number;
  timestamp: string;
}

export function healthScore(telemetry: MeterTelemetry): number {
  const frequencyPenalty = Math.min(30, Math.abs(50 - telemetry.frequency) * 20);
  const powerFactorPenalty = Math.min(20, Math.max(0, 0.95 - telemetry.powerFactor) * 100);
  const distortionPenalty = Math.min(20, Math.max(0, telemetry.thd - 3) * 2);
  const signalPenalty = Math.min(15, Math.max(0, -85 - telemetry.signal) * 0.75);
  const latencyPenalty = Math.min(15, Math.max(0, telemetry.latency - 100) / 40);
  return Math.max(0, Math.round(100 - frequencyPenalty - powerFactorPenalty - distortionPenalty - signalPenalty - latencyPenalty));
}
