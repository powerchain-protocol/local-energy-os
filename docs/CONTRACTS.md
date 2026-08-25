# PowerChain Contracts

PowerChain uses `@powerchain/contracts` as the stable transport boundary between applications, API services, workers and shared packages. It intentionally does not replace domain models or the PostgreSQL schema.

## Contract layers

```text
Physical/domain state
  ↓ domain packages
Application service
  ↓ @powerchain/contracts
/api/v1 JSON envelope
  ↓ @powerchain/api-client
Web / worker / integration consumer
```

## Compatibility

`/api/v1` contracts are additive by default. Breaking changes require an explicit version transition. Request IDs and correlation IDs must survive all internal hops. Economic mutations also require `Idempotency-Key`.

## Bigint safety

Energy Wh and token base units are not transported as JavaScript numbers. Servers serialize them as decimal strings; consumers convert to `bigint` only inside trusted code.

## Error contract

Every PowerChain-originated API failure contains `code`, `message`, and `requestId`; structured `details` are optional. Client-generated transport fallbacks may lack `requestId` when no server response identifier exists.
