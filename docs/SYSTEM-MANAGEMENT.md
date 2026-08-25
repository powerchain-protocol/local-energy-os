# PowerChain System Management v1.0.0

PowerChain exposes one canonical system-management contract for runtime state, safe public configuration and degraded-service execution policy.

## Source layout

```text
packages/system-management/src/
├── types/status.ts
├── config.ts
├── status.ts
├── management.ts
└── index.ts
```

`types/status.ts` is the canonical cross-application status contract. The package is intentionally policy-oriented and contains no provider secrets or database clients.

## API

```text
GET /api/v1/system/status
GET /api/v1/system/status?probe=deep
GET /api/v1/system/config
GET /api/v1/system/management
GET /api/v1/system/health          compatibility projection
GET /api/v1/system/solana
GET /api/v1/system/storage
GET /api/v1/system/transports
```

### Shallow versus deep status

The default `status` request avoids unnecessary external network work. Database state is queried because PostgreSQL is the canonical operational store; Redis and Solana are reported as configured/unknown unless `probe=deep` is requested.

`probe=deep` adds bounded Redis TCP and Solana JSON-RPC health probes. It never returns secret connection strings or Helius API keys.

## Management gates

System management derives:

- writesAllowed
- settlementAllowed
- marketMatchingAllowed
- bridgeFinalizationAllowed
- rewardsAllowed
- machine-readable reasons

Runtime `READ_ONLY`, `MAINTENANCE`, `simulated` or `disabled` write modes override service-level readiness.

## Database states

PowerChain distinguishes:

```text
UNCONFIGURED  no valid production runtime datasource
UNAVAILABLE   datasource is configured/derived but cannot be reached
OPERATIONAL   SELECT 1 succeeds
```

Development may derive PostgreSQL from `PG*` variables or the safe `127.0.0.1:5432/powerchain` fallback. Production never uses that fallback.
