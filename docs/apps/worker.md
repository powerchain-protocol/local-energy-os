# PowerChain Worker

**Package:** `@powerchain/app-worker`  
**Version:** `1.0.0`

## Purpose

The worker is the background execution process for implemented, durable maintenance and outbox responsibilities. It does not schedule placeholder jobs and it does not execute physical energy dispatch, settlement, market matching, rewards, or cross-chain actions unless a real adapter/policy implementation is introduced first.

## Scheduled jobs

- `domain-event-outbox` — enabled only when `DOMAIN_EVENT_TRANSPORT=log|redis`.
- `integration-outbox` — enabled only when `INTEGRATION_OUTBOX_TRANSPORT=log`.
- `idempotency-cleanup` — removes expired idempotency records.

Unimplemented capabilities are reported once at startup as disabled capabilities; they do not create recurring no-op timers.

## Runtime safety

- Jobs never overlap with another execution of the same job.
- SIGINT/SIGTERM stops scheduling, drains in-flight jobs up to `WORKER_SHUTDOWN_TIMEOUT_MS`, closes the Redis publisher, and disconnects Prisma.
- Redis publishing reuses one process-wide publisher connection rather than connecting for every event.
- Production defaults domain-event delivery to `disabled` unless explicitly configured.
- Integration delivery accepts only the explicit `log` development/audit sink until a real adapter is added.

## Configuration

```dotenv
WORKER_RUN_ON_START=true
WORKER_DOMAIN_EVENT_INTERVAL_MS=5000
WORKER_INTEGRATION_OUTBOX_INTERVAL_MS=10000
WORKER_IDEMPOTENCY_CLEANUP_INTERVAL_MS=60000
WORKER_SHUTDOWN_TIMEOUT_MS=10000
DOMAIN_EVENT_TRANSPORT=disabled
INTEGRATION_OUTBOX_TRANSPORT=disabled
```

## Development

```bash
pnpm worker:dev
pnpm worker:typecheck
pnpm worker:build
pnpm worker:start
pnpm worker:verify
```

The full release gate also runs `pnpm clean:verify`, workspace dependency-boundary validation, operations verification, Prisma generation, Turbo typechecks, and app builds.
