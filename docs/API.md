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
