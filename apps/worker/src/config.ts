export type DomainEventTransport = "disabled" | "log" | "redis";
export type IntegrationOutboxTransport = "disabled" | "log";

export interface WorkerConfig {
  domainEventTransport: DomainEventTransport;
  integrationOutboxTransport: IntegrationOutboxTransport;
  domainEventIntervalMs: number;
  integrationOutboxIntervalMs: number;
  idempotencyCleanupIntervalMs: number;
  runOnStart: boolean;
  shutdownTimeoutMs: number;
}

function enumValue<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  if ((allowed as readonly string[]).includes(raw)) return raw as T;
  throw new Error(`${name} must be one of: ${allowed.join(", ")}`);
}

function positiveInt(name: string, fallback: number, minimum = 1_000): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`${name} must be an integer >= ${minimum}`);
  return value;
}

function booleanValue(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  throw new Error(`${name} must be true or false`);
}

export function loadWorkerConfig(): WorkerConfig {
  const production = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV) === "production";
  return {
    domainEventTransport: enumValue("DOMAIN_EVENT_TRANSPORT", ["disabled", "log", "redis"] as const, production ? "disabled" : "log"),
    integrationOutboxTransport: enumValue("INTEGRATION_OUTBOX_TRANSPORT", ["disabled", "log"] as const, "disabled"),
    domainEventIntervalMs: positiveInt("WORKER_DOMAIN_EVENT_INTERVAL_MS", 5_000),
    integrationOutboxIntervalMs: positiveInt("WORKER_INTEGRATION_OUTBOX_INTERVAL_MS", 10_000),
    idempotencyCleanupIntervalMs: positiveInt("WORKER_IDEMPOTENCY_CLEANUP_INTERVAL_MS", 60_000),
    runOnStart: booleanValue("WORKER_RUN_ON_START", true),
    shutdownTimeoutMs: positiveInt("WORKER_SHUTDOWN_TIMEOUT_MS", 10_000),
  };
}

export const workerCapabilities = [
  { name: "meter-intervals", state: "disabled", reason: "TELEMETRY_INTERVAL_PROCESSOR_NOT_CONFIGURED" },
  { name: "energy-batch-finalization", state: "disabled", reason: "BATCH_FINALIZATION_POLICY_NOT_CONFIGURED" },
  { name: "market-matching", state: "disabled", reason: "MARKET_MATCHER_NOT_CONFIGURED" },
  { name: "settlement-reconciliation", state: "disabled", reason: "SETTLEMENT_ADAPTER_NOT_CONFIGURED" },
  { name: "pwrc-reward-epochs", state: "disabled", reason: "REWARD_EPOCH_POLICY_NOT_CONFIGURED" },
  { name: "cross-chain-reconciliation", state: "disabled", reason: "CROSS_CHAIN_ADAPTER_NOT_CONFIGURED" },
] as const;
