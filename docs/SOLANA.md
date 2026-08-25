# Solana / SVM Runtime

PowerChain uses Solana for PWRC and Energy RWA settlement/program execution. Development defaults to Devnet; production may target mainnet-beta only with explicit live-data/write policy and a dedicated RPC.

## Network resolution

`SOLANA_CLUSTER` (or `POWERCHAIN_NETWORK`) selects `devnet` or `mainnet-beta`. `SOLANA_RPC_URL` / `SOLANA_WS_URL` override all provider resolution. When `HELIUS_ENABLED=true` and `HELIUS_API_KEY` is configured, Helius endpoints are used automatically. Public Solana RPC is suitable for development, not production traffic.

## Program IDs

Standard Solana/SPL program IDs are committed as non-secret configuration. PowerChain-owned deployable program IDs are environment-scoped and must be populated after deployment. The checked Anchor scaffold must be synchronized with the generated deployment key using `anchor keys sync`; do not deploy the `11111111111111111111111111111111` scaffold placeholder.

`PWRC_MINT_MAINNET` is the canonical Token-2022 PWRC mainnet mint. `PWRC_MINT_DEVNET` is intentionally blank unless a distinct devnet test mint is deployed. Never silently reuse the mainnet PWRC mint identity on Devnet.

## Commands

```bash
pnpm solana:doctor
pnpm solana:config
pnpm solana:programs
pnpm solana:devnet
pnpm solana:mainnet
```
