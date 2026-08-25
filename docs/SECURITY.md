# Security Architecture

PowerChain uses layered authorization:

```text
Authentication → Tenant → Workspace → Role → Permission → Policy → Resource Scope → Domain Invariant
```

UI visibility is not authorization. Economic mutations require organization context, an authorized role, a safe runtime mode, and `Idempotency-Key`.

## Economic write controls

Energy Proof, Batch, Position, Reservation and Retirement writes use:

- request/correlation context;
- organization scoping;
- runtime write-mode checks;
- centralized policy decisions;
- validated integer-string energy quantities;
- transactional database operations;
- optimistic concurrency guards;
- idempotency records;
- audit entries;
- domain-event outbox records.

## Tenant isolation

The API scopes queries by organization. Supabase/PostgreSQL RLS provides defense in depth for direct authenticated reads by resolving the current PowerChain user through `users.supabase_user_id` and `organization_memberships`.

Service-role and backend database credentials remain server-only.

## Runtime safety

Mainnet writes cannot run against mock or simulated physical-energy data. Read-only and simulation modes cannot silently become live write paths.
