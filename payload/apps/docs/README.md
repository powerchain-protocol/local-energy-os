# @powerchain/docs

Deployable documentation application for **PowerChain Local Energy OS v1.0.0**.

The application renders the canonical Markdown source from the monorepo root `docs/` directory. This avoids maintaining a second, divergent copy of the architecture.

## Routes

- `/` — documentation home
- `/whitepaper` — canonical whitepaper
- `/local-energy-os` — canonical full-stack platform documentation
- `/architecture`
- `/energy-rwa`
- `/pwrc`
- `/saas`
- `/p2p-local-energy`
- `/grid`
- `/settlement`
- `/solana`
- `/sui`
- `/cross-chain`
- `/x402`
- `/cctp`
- `/oracles`
- `/security`
- `/operations`
- `/api`
- `/development`

## Development

```bash
pnpm --filter @powerchain/docs dev
```

## Build

```bash
pnpm --filter @powerchain/docs build
```

Set `POWERCHAIN_DOCS_ROOT` only when the canonical repository `docs/` directory is outside the normal monorepo layout.
