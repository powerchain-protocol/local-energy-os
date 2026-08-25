import { classifyRealtimeTopic, type RealtimeEventEnvelope } from "@powerchain/api/realtime";
import { publishRealtimeEvent } from "@powerchain/realtime";
import { getPrismaClient } from "@powerchain/database";

export interface JobResult { processed: number; skipped?: number; details?: Record<string, unknown> }
export interface WorkerJob { name: string; intervalMs: number; run: () => Promise<JobResult> }

async function domainEventOutbox(): Promise<JobResult> {
  const prisma = getPrismaClient();
  const events = await prisma.domainEventOutbox.findMany({ where: { processedAt: null }, orderBy: { createdAt: "asc" }, take: 100 });
  const transport = process.env.DOMAIN_EVENT_TRANSPORT ?? (process.env.POWERCHAIN_ENVIRONMENT === "production" ? "disabled" : "log");
  if (transport === "disabled") return { processed: 0, skipped: events.length, details: { reason: "DOMAIN_EVENT_TRANSPORT_DISABLED" } };
  let processed = 0;
  for (const event of events) {
    try {
      if (transport === "log") console.log(JSON.stringify({ type: "domain-event", event: { id: event.id, type: event.type, aggregateType: event.aggregateType, aggregateId: event.aggregateId } }));
      if (transport === "redis") {
        if (!event.organizationId) throw new Error("Realtime domain events require organizationId");
        const realtimeEvent: RealtimeEventEnvelope = {
          id: event.id,
          version: event.version,
          topic: classifyRealtimeTopic(event.type),
          type: event.type,
          occurredAt: event.occurredAt.toISOString(),
          organizationId: event.organizationId,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          correlationId: event.correlationId ?? undefined,
          payload: event.payload,
        };
        await publishRealtimeEvent(realtimeEvent);
      }
      await prisma.domainEventOutbox.update({ where: { id: event.id }, data: { processedAt: new Date(), attempts: { increment: 1 } } });
      processed += 1;
    } catch {
      await prisma.domainEventOutbox.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
    }
  }
  return { processed, skipped: events.length - processed, details: { transport } };
}

async function integrationOutbox(): Promise<JobResult> {
  const prisma = getPrismaClient();
  const rows = await prisma.integrationOutbox.findMany({ where: { processedAt: null }, orderBy: { createdAt: "asc" }, take: 100 });
  // Integrations remain adapter-owned. The generic worker never marks an event processed
  // unless an explicit transport is configured.
  const transport = process.env.INTEGRATION_OUTBOX_TRANSPORT ?? "disabled";
  if (transport === "disabled") return { processed: 0, skipped: rows.length, details: { reason: "INTEGRATION_OUTBOX_TRANSPORT_DISABLED" } };
  let processed = 0;
  for (const row of rows) {
    try {
      if (transport === "log") console.log(JSON.stringify({ type: "integration-outbox", topic: row.topic, aggregateId: row.aggregateId }));
      await prisma.integrationOutbox.update({ where: { id: row.id }, data: { processedAt: new Date(), attempts: { increment: 1 } } });
      processed += 1;
    } catch {
      await prisma.integrationOutbox.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    }
  }
  return { processed, skipped: rows.length - processed, details: { transport } };
}

async function cleanupIdempotency(): Promise<JobResult> {
  const result = await getPrismaClient().idempotencyRecord.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  return { processed: result.count };
}

async function noOp(reason: string): Promise<JobResult> { return { processed: 0, skipped: 1, details: { reason } }; }

export const jobs: WorkerJob[] = [
  { name: "domain-event-outbox", intervalMs: 5_000, run: domainEventOutbox },
  { name: "integration-outbox", intervalMs: 10_000, run: integrationOutbox },
  { name: "idempotency-cleanup", intervalMs: 60_000, run: cleanupIdempotency },
  { name: "meter-intervals", intervalMs: 30_000, run: () => noOp("TELEMETRY_INTERVAL_PROCESSOR_NOT_CONFIGURED") },
  { name: "energy-batch-finalization", intervalMs: 30_000, run: () => noOp("BATCH_FINALIZATION_POLICY_NOT_CONFIGURED") },
  { name: "market-matching", intervalMs: 5_000, run: () => noOp("MARKET_MATCHER_NOT_CONFIGURED") },
  { name: "settlement-reconciliation", intervalMs: 15_000, run: () => noOp("SETTLEMENT_ADAPTER_NOT_CONFIGURED") },
  { name: "pwrc-reward-epochs", intervalMs: 60_000, run: () => noOp("REWARD_EPOCH_POLICY_NOT_CONFIGURED") },
  { name: "cross-chain-reconciliation", intervalMs: 15_000, run: () => noOp("CROSS_CHAIN_ADAPTER_NOT_CONFIGURED") },
];
