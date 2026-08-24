# PowerChain On-chain Programs

PowerChain programs implement meter registration, oracle attestation, Proof of Energy, tokenization, marketplace, escrow, treasury, and governance.

## Network targets

- localnet for deterministic tests
- devnet for integration and partner validation
- mainnet-beta only after audit, upgrade-authority review, and published program IDs

Run `pnpm programs:check` and `pnpm programs:test` before deployment. Program IDs and RPC endpoints are configured through `programs/config` and `src/env`.
