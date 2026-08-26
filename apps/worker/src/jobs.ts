import { classifyRealtimeTopic, type RealtimeEventEnvelope } from "@powerchain/api/realtime";
import { publishRealtimeEvent } from "@powerchain/realtime";
import { getPrismaClient } from "@powerchain/database";
import type { WorkerConfig } from "./config";

export interface JobResult {
  processed: number;
  skipped?: number;
  failed?: number;
  details?: Record<string, unknown>;
}

export interface WorkerJob {
  name: string;
  intervalMs: number;
  run: () => Promise<JobResult>;
}

async function domainEventOutbox(transport: WorkerConfig["domainEventTransport"]): Promise<JobResult> {
  const prisma = getPrismaClient();
  const events = await prisma.domainEventOutbox.findMany({
    where: { processedAt: null },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  let processed = 0;
  let failed = 0;
  for (const event of events) {
    try {
      if (transport === "log") {
        console.log(JSON.stringify({ type: "domain-event", event: { id: event.id, type: event.type, aggregateType: event.aggregateType, aggregateId: event.aggregateId } }));
      } else if (transport === "redis") {
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
      await prisma.domainEventOutbox.update({
        where: { id: event.id },
        data: { processedAt: new Date(), attempts: { increment: 1 } },
      });
      processed += 1;
    } catch (error) {
      failed += 1;
      await prisma.domainEventOutbox.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
      console.error(JSON.stringify({ service: "powerchain-worker", job: "domain-event-outbox", eventId: event.id, status: "event-failed", message: error instanceof Error ? error.message : "unknown error" }));
    }
  }
  return { processed, failed, skipped: events.length - processed - failed, details: { transport, fetched: events.length } };
}

async function integrationOutbox(transport: WorkerConfig["integrationOutboxTransport"]): Promise<JobResult> {
  const prisma = getPrismaClient();
  const rows = await prisma.integrationOutbox.findMany({
    where: { processedAt: null },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  let processed = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      // "log" is an explicit development/audit sink. Adapter-backed delivery must
      // be introduced as a real transport before any other mode is accepted here.
      console.log(JSON.stringify({ type: "integration-outbox", topic: row.topic, aggregateId: row.aggregateId }));
      await prisma.integrationOutbox.update({
        where: { id: row.id },
        data: { processedAt: new Date(), attempts: { increment: 1 } },
      });
      processed += 1;
    } catch (error) {
      failed += 1;
      await prisma.integrationOutbox.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
      console.error(JSON.stringify({ service: "powerchain-worker", job: "integration-outbox", rowId: row.id, status: "row-failed", message: error instanceof Error ? error.message : "unknown error" }));
    }
  }
  return { processed, failed, skipped: rows.length - processed - failed, details: { transport, fetched: rows.length } };
}

async function cleanupIdempotency(): Promise<JobResult> {
  const result = await getPrismaClient().idempotencyRecord.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  return { processed: result.count };
}

export function createWorkerJobs(config: WorkerConfig): WorkerJob[] {
  const jobs: WorkerJob[] = [
    { name: "idempotency-cleanup", intervalMs: config.idempotencyCleanupIntervalMs, run: cleanupIdempotency },
  ];
  if (config.domainEventTransport !== "disabled") {
    jobs.unshift({ name: "domain-event-outbox", intervalMs: config.domainEventIntervalMs, run: () => domainEventOutbox(config.domainEventTransport) });
  }
  if (config.integrationOutboxTransport !== "disabled") {
    jobs.push({ name: "integration-outbox", intervalMs: config.integrationOutboxIntervalMs, run: () => integrationOutbox(config.integrationOutboxTransport) });
  }
  return jobs;
}
