# @powerchain/contracts

Canonical cross-workspace TypeScript contracts for PowerChain Local Energy OS v1.0.0.

This package contains **wire and context types only**. Domain calculations remain in `energy-core`, `energy-rwa`, `pwrc`, `ledger`, `settlement`, and other domain packages. Keeping contracts small prevents UI/API transport concerns from becoming business authority.

## Modules

```text
src/
├── api.ts       API envelopes, metadata and error payloads
├── bridge.ts    cross-chain state/network identifiers
├── context.ts   request and workspace context
├── energy.ts    participant, source, RWA unit and position states
└── index.ts     public exports
```

## API boundary

Successful responses use:

```ts
interface ApiSuccess<T> {
  data: T;
  meta: { requestId: string; generatedAt: string };
}
```

Failures use a stable error envelope:

```ts
interface ApiFailure {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: Record<string, unknown>;
  };
}
```

`ApiErrorPayload.requestId` is optional only for client-side fallback failures where an upstream server did not return a PowerChain envelope. Server-generated `ApiFailure` always includes it.

## Energy quantity rule

Internal physical accounting uses `bigint` Wh. JSON boundaries must serialize base-unit quantities as decimal strings. `kWh` and `MWh` are denominations of canonical Wh, not independent physical supplies.

## Stability rules

- Add fields compatibly where possible.
- Do not silently rename error codes or enum values.
- Version breaking wire changes under `/api/v2`, not by mutating `/api/v1`.
- Never add secrets, private keys, RPC credentials, or deployment authority material.
- Do not encode economic policy in this package.

## Validation

```bash
pnpm --filter @powerchain/contracts typecheck
pnpm --filter @powerchain/api-client typecheck
pnpm api:docs:verify
```
