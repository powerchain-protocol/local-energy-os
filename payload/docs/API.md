# Canonical API

```text
/api/v1/
├── participants/ ├── prosumers/ ├── consumers/ ├── clients/ ├── grid-operators/
├── energy/ ├── energy-proofs/ ├── energy-batches/ ├── energy-positions/
├── energy-reservations/ ├── energy-retirements/ ├── energy-rwa/
├── plants/ ├── wind-farms/ ├── solar-farms/ ├── batteries/ ├── chargers/ ├── charging-sessions/
├── grid/ ├── map/ ├── flexibility/ ├── vpp/
├── energy-markets/ ├── energy-orders/ ├── trades/ ├── settlements/
├── pwrc/ ├── rewards/ ├── wallets/
├── cross-chain/ ├── cctp/ ├── x402/ ├── oracles/
├── supply-chain/ ├── asset-passports/
├── saas/ ├── integrations/ └── system/
```

Request context may propagate `requestId`, `correlationId`, `organizationId`, `tenantId`, `workspaceId`, and `contextType` through middleware, tenant resolution, authorization, policy, and domain services. Energy and token base-unit BigInts are serialized as decimal strings at HTTP boundaries.

## v1.0.0 integrated endpoints

### Energy RWA

```text
GET  /api/v1/energy-rwa
GET  /api/v1/energy-rwa/:id
POST /api/v1/energy-rwa
POST /api/v1/energy-rwa/:id/representations
POST /api/v1/energy-rwa/:id/retire
```

All Energy RWA access is tenant-scoped and can be further restricted by organization/company context and authorization scopes.

### Explorers

```text
GET /api/v1/explorer/solana/:kind/:id
GET /api/v1/explorer/sui/:kind/:id
```

### Market data and rates

```text
GET  /api/v1/oracles/pyth/:feedId
GET  /api/v1/market-data/birdeye/:address
GET  /api/v1/market-data/coinmarketcap
POST /api/v1/rates/process
```

Provider credentials remain server-side.

### Reward epochs

```text
GET  /api/v1/rewards/epochs
POST /api/v1/rewards/epochs
POST /api/v1/rewards/epochs/:id/contributions
POST /api/v1/rewards/epochs/:id/finalize
```

### SaaS control plane

```text
GET  /api/v1/saas/apps
GET  /api/v1/saas/plans
GET  /api/v1/saas/tenant/:organizationId
POST /api/v1/saas/entitlements/resolve
POST /api/v1/saas/api-keys
POST /api/v1/saas/api-keys/:id/revoke
GET  /api/v1/saas/usage
```

State-changing endpoints are intended to be wrapped by Safe Actions and require idempotency keys.

