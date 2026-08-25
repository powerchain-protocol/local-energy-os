# Realtime / WebSocket

Clients obtain a short-lived ticket from `POST /api/v1/realtime/tickets`, then connect to `ws://localhost:3012/v1/events?ticket=<ticket>`.

Topics: `system`, `energy`, `market`, `settlement`, `devices`, `rewards`, `cross-chain`, `audit`.

The worker publishes committed domain-event outbox rows to Redis when `DOMAIN_EVENT_TRANSPORT=redis`. The realtime gateway subscribes to the Redis event bus and only forwards events whose `organizationId` matches the signed ticket. WebSocket delivery is observational; economic writes still go through authenticated REST mutations and idempotency/policy checks.
