import { createHmac } from "node:crypto";
import { PostgresEnergyOutboxWorkerRepository } from "@powerchain/database/energy-outbox-worker";
import type { ClaimedEnergyOutboxEvent } from "@powerchain/database/energy-outbox-worker";

export interface DigitalEnergyOutboxPublisherStatus {
  enabled: boolean;
  running: boolean;
  sinkConfigured: boolean;
  databaseConfigured: boolean;
  intervalMs: number;
  batchSize: number;
  maxAttempts: number;
  leaseSeconds: number;
  lastRunAt?: string;
  lastPublishedAt?: string;
  lastError?: string;
  claimed: number;
  published: number;
  failed: number;
}

const repository = new PostgresEnergyOutboxWorkerRepository();
const status: DigitalEnergyOutboxPublisherStatus = {
  enabled: false,
  running: false,
  sinkConfigured: false,
  databaseConfigured: false,
  intervalMs: 5_000,
  batchSize: 25,
  maxAttempts: 10,
  leaseSeconds: 300,
  claimed: 0,
  published: 0,
  failed: 0,
};

let timer: NodeJS.Timeout | undefined;
let inFlight = false;

function positiveInteger(name: string, fallback: number, min: number, max: number) {
  const parsed = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.max(min, Math.min(parsed, max));
}

function sinkConfig() {
  const url = String(process.env.POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_URL ?? "").trim();
  const token = String(process.env.POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_TOKEN ?? "").trim();
  const signingSecret = String(process.env.POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_SIGNING_SECRET ?? "").trim();
  if (url && process.env.NODE_ENV === "production") {
    const parsed = new URL(url);
    const local = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    if (parsed.protocol !== "https:" && !local) throw new Error("DIGITAL_ENERGY_EVENT_SINK_HTTPS_REQUIRED");
  }
  return { url, token, signingSecret };
}

async function publish(event: ClaimedEnergyOutboxEvent) {
  const { url, token, signingSecret } = sinkConfig();
  if (!url) throw new Error("POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_URL is not configured");

  const body = JSON.stringify({
    eventId: event.id,
    topic: event.topic,
    organizationId: event.organizationId,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    payload: event.payload,
    attempt: event.attempts,
    createdAt: event.createdAt.toISOString(),
  });
  const signature = signingSecret
    ? `sha256=${createHmac("sha256", signingSecret).update(body).digest("hex")}`
    : undefined;

  const controller = new AbortController();
  const timeoutMs = positiveInteger("DIGITAL_ENERGY_OUTBOX_HTTP_TIMEOUT_MS", 10_000, 1_000, 60_000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": event.id,
        "x-powerchain-event-id": event.id,
        "x-powerchain-event-topic": event.topic,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(signature ? { "x-powerchain-signature": signature } : {}),
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseBody = (await response.text()).slice(0, 1_000);
      throw new Error(`EVENT_SINK_HTTP_${response.status}${responseBody ? `:${responseBody}` : ""}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function runDigitalEnergyOutboxPublisherOnce() {
  if (inFlight) return status;
  const { url } = sinkConfig();
  status.databaseConfigured = Boolean(process.env.DATABASE_URL);
  status.sinkConfigured = Boolean(url);
  status.enabled = status.databaseConfigured && status.sinkConfigured;
  status.intervalMs = positiveInteger("DIGITAL_ENERGY_OUTBOX_INTERVAL_MS", 5_000, 1_000, 60_000);
  status.batchSize = positiveInteger("DIGITAL_ENERGY_OUTBOX_BATCH_SIZE", 25, 1, 100);
  status.maxAttempts = positiveInteger("DIGITAL_ENERGY_OUTBOX_MAX_ATTEMPTS", 10, 1, 100);
  status.leaseSeconds = positiveInteger("DIGITAL_ENERGY_OUTBOX_LEASE_SECONDS", 300, 30, 3_600);

  if (!status.enabled) return status;

  inFlight = true;
  status.running = true;
  status.lastRunAt = new Date().toISOString();
  status.lastError = undefined;

  try {
    const events = await repository.claimBatch({
      limit: status.batchSize,
      maxAttempts: status.maxAttempts,
      leaseSeconds: status.leaseSeconds,
    });
    status.claimed += events.length;

    const concurrency = positiveInteger("DIGITAL_ENERGY_OUTBOX_CONCURRENCY", 4, 1, 16);
    for (let index = 0; index < events.length; index += concurrency) {
      const chunk = events.slice(index, index + concurrency);
      await Promise.all(chunk.map(async event => {
        try {
          await publish(event);
          await repository.markPublished(event.id);
          status.published += 1;
          status.lastPublishedAt = new Date().toISOString();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown Digital Energy outbox publish error";
          await repository.markFailed({ id: event.id, error: message, attempts: event.attempts });
          status.failed += 1;
          status.lastError = message;
        }
      }));
    }
  } catch (error) {
    status.lastError = error instanceof Error ? error.message : "Digital Energy outbox processing failed";
  } finally {
    inFlight = false;
    status.running = false;
  }

  return status;
}

export function getDigitalEnergyOutboxPublisherStatus(): DigitalEnergyOutboxPublisherStatus {
  return { ...status };
}

export function startDigitalEnergyOutboxPublisher() {
  status.intervalMs = positiveInteger("DIGITAL_ENERGY_OUTBOX_INTERVAL_MS", 5_000, 1_000, 60_000);
  status.databaseConfigured = Boolean(process.env.DATABASE_URL);
  status.sinkConfigured = Boolean(sinkConfig().url);
  status.enabled = status.databaseConfigured && status.sinkConfigured;

  if (!status.enabled || timer) return getDigitalEnergyOutboxPublisherStatus();

  void runDigitalEnergyOutboxPublisherOnce();
  timer = setInterval(() => void runDigitalEnergyOutboxPublisherOnce(), status.intervalMs);
  timer.unref?.();
  return getDigitalEnergyOutboxPublisherStatus();
}

export async function stopDigitalEnergyOutboxPublisher() {
  if (timer) clearInterval(timer);
  timer = undefined;
  await repository.close();
}
