import type { IntegrationHealth } from "./health";
import type { IntegrationResult } from "./result";
export interface IntegrationContext {
  requestId: string;
  correlationId: string;
  idempotencyKey?: string;
  timeoutMs: number;
  signal: AbortSignal;
}
export interface IntegrationAdapter<TRequest, TResponse> {
  readonly provider: string;
  execute(
    request: TRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<TResponse>>;
  health(): Promise<IntegrationHealth>;
}
export function createIntegrationContext(
  input: Partial<IntegrationContext> = {},
): IntegrationContext {
  const timeoutMs = input.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timeout), {
    once: true,
  });
  return {
    requestId: input.requestId ?? crypto.randomUUID(),
    correlationId: input.correlationId ?? crypto.randomUUID(),
    idempotencyKey: input.idempotencyKey,
    timeoutMs,
    signal: input.signal ?? controller.signal,
  };
}
