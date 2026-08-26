# PowerChain Operations Backend

The operations backend is an independently buildable Express/Prisma/Supabase workspace for EMS, IoT and DePIN operational data. `apps/energy` does not depend on Express, Prisma operations migrations, Supabase service-role credentials or provider SDKs.

## Trust boundary

```text
Energy / Platform clients
        ↓
apps/api (authenticated gateway)
        ↓ internal bearer + actor/org identity
apps/backend
        ↓ site_access authorization
operations PostgreSQL schema
        ├── EMS telemetry
        ├── IoT device registry
        ├── DePIN nodes/heartbeats
        ├── public wallet identities
        └── prepared safe-action intents
```

Every site-scoped request requires an explicit `site_access` row for the authenticated actor, organization and site. An organization identifier alone never grants arbitrary site access.

## Safe actions

Only preparation is exposed:

| Action | Disposition |
| --- | --- |
| `ems.dispatch.prepare` | review required |
| `iot.device.refresh` | read only |
| `depin.node.refresh` | read only |
| `wallet.signature.prepare` | wallet signature required |
| `settlement.prepare` | wallet signature required |

There is no physical dispatch execution endpoint and no settlement execution endpoint. Wallet signing stays user-controlled. The backend stores public Solana/Sui wallet identities only.

## API

Public:
- `GET /api/v1/health`
- `GET /api/v1/config`

Authenticated/site-scoped:
- `GET /api/v1/ems/overview?siteId=...`
- `GET /api/v1/iot/devices?siteId=...`
- `GET /api/v1/depin/nodes?siteId=...`
- `GET /api/v1/market-data/prices?symbols=SOL,PWRC`
- `POST /api/v1/actions/prepare`

## Prisma

The backend uses a dedicated Prisma client and PostgreSQL `operations` schema.

```bash
pnpm backend:prisma:validate
pnpm backend:prisma:generate
pnpm backend:prisma:migrate:status
pnpm backend:prisma:migrate:deploy
```

The Energy Ledger remains on the canonical root Prisma schema and migration history.
