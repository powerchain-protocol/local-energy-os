# PowerChain application topology

PowerChain applications are independently startable and share the canonical
`@powerchain/application-runtime` request, health, error, metadata, and HTTP
server boundary. Every service exposes `GET /health/live`, `GET /health/ready`,
and `GET /meta` in addition to its domain routes.

| Application | Default port | Responsibility |
| --- | ---: | --- |
| `platform` | 3000 | Primary Next.js UI and application API routes |
| `docs` | 3001 | Product and engineering documentation |
| `web` | 3100 | Public product entry point |
| `api` | 3101 | Versioned API entry point and service discovery |
| `checkout` | 3102 | Pricing, review, wallet approval, and settlement lifecycle |
| `marketplace` | 3103 | Listings, inventory reservations, orders, and checkout linking |
| `ai-gateway` | 3104 | GridLLM request validation and controlled provider routing |
| `integration-gateway` | 3105 | Provider registry and capability discovery |
| `explorer` | 3106 | Canonical Solana and Sui explorer resolution |
| `websocket-gateway` | 3107 | Channel subscriptions and realtime delivery at `/ws` |
| `workers` | 3108 | Idempotent asynchronous jobs and reconciliation processors |

## Commands

```bash
pnpm dev                 # primary platform
pnpm dev:services        # service fleet
pnpm dev:all             # all application workspaces
pnpm build               # build every application
pnpm typecheck           # typecheck every application and shared workspace graph
```

Each service can also run independently:

```bash
pnpm --filter @powerchain/checkout-app dev
pnpm --filter @powerchain/marketplace-app start
```

Set `HOST` and `PORT` to override an individual service listener. Cross-service
URLs are listed in `.env.example`; no service accepts private keys or performs
wallet signing.

## Transaction boundaries

- Checkout calculates amounts with integer minor units and stops at wallet
  approval before accepting an externally produced signature.
- Marketplace inventory is reserved before checkout and can be marked paid only
  by the checkout session attached to the order.
- AI requests pass through message-size, model, provider, and cost boundaries.
- Integrations expose capability discovery separately from credentialed provider
  execution.
- Worker jobs require idempotency keys and preserve explicit queue states.

The initial runtime uses process-local repositories to make every lifecycle
executable without infrastructure. Production deployments should replace these
repositories with the canonical database and queue adapters while retaining the
same domain interfaces and state guards.
