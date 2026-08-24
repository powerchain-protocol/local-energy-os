export interface IntegrationTelemetry {
  requestId: string;
  correlationId: string;
  provider: string;
  operation: string;
  state: string;
  durationMs: number;
  attempt: number;
  circuitState: string;
  idempotencyKey?: string;
}
export function redactIntegrationTelemetry(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const blocked = new Set([
    "authorization",
    "apiKey",
    "secret",
    "credential",
    "privateKey",
  ]);
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      blocked.has(key) ? "[REDACTED]" : value,
    ]),
  );
}
