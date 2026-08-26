# PowerChain Service Modules & Isolated Backend

## Boundary

The deployed `apps/energy` application remains a Next.js client/control-plane surface. It depends on provider-neutral contracts and hooks only; it does not import Express, Supabase server credentials or backend-only infrastructure.

```
apps/energy
  ├─ @powerchain/ems
  ├─ @powerchain/iot
  ├─ @powerchain/depin
  ├─ @powerchain/adapters
  ├─ @powerchain/clients
  ├─ @powerchain/safe-actions
  ├─ @powerchain/hooks
  └─ @powerchain/ui

apps/backend
  ├─ Express 5 HTTP gateway
  ├─ Prisma/PostgreSQL
  ├─ optional Supabase admin client
  ├─ EMS / IoT / DePIN services
  ├─ chain and market-data clients
  └─ safe-action execution boundary
```

## Services

- `@powerchain/ems`: physical energy snapshot, forecast, flexibility and dispatch simulation contracts.
- `@powerchain/iot`: device registry, latest telemetry and bounded device-command contracts.
- `@powerchain/depin`: node state and attestation contracts.
- `@powerchain/adapters`: provider-neutral auth and wallet interfaces/registries.
- `@powerchain/clients`: minimal Solana JSON-RPC, Sui JSON-RPC and market-data failover clients.
- `@powerchain/safe-actions`: Validate → Policy → Simulate → Approve → Execute → Verify action kernel.
- `@powerchain/hooks`: browser-safe async-resource and safe-action hooks.

## Backend API v1

- `GET /api/v1/health` — backend readiness/dependency health.
- `GET /api/v1/config` — sanitized non-secret runtime configuration.

The backend never returns database credentials, Supabase service-role keys, RPC secrets or signing material from the config route.

## Deployment rule

`apps/backend` is independently typecheckable/buildable and uses its own dependency graph. Its production bundle is generated with esbuild. Express, CORS, Zod, Supabase JS and Prisma runtime packages remain external runtime dependencies; PowerChain workspace service modules are bundled into the backend artifact.

## Stable import surfaces

```ts
import type { AuthAdapter } from "@powerchain/adapters/auth";
import type { WalletAdapter } from "@powerchain/adapters/wallet";
import { SolanaRpcClient } from "@powerchain/clients/solana";
import { SuiRpcClient } from "@powerchain/clients/sui";
import { MarketDataClient } from "@powerchain/clients/market-data";
import { defineSafeAction } from "@powerchain/safe-actions";
```

Provider-specific implementations live behind these interfaces. UI code must not import provider service-role credentials or backend server libraries.

## EMS dispatch safety integration

`@powerchain/ems/dispatch-action` binds the EMS dispatch-provider contract to the shared safe-action kernel. A dispatch cannot reach provider execution until validation, policy evaluation, simulation and approval succeed; post-execution verification must then produce evidence or the action returns `VERIFICATION_FAILED`.

## Operational hooks

`@powerchain/hooks` now exposes `useAuthSession`, `useWallet`, `useEmsSnapshot`, `useIoTDevices`, `useDePinNodes`, `useAsyncResource` and `useSafeAction`. These hooks depend only on provider-neutral contracts and React; they do not pull Express, Supabase admin credentials or database code into the Energy client.
