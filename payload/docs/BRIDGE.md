# PWRC / wPWRC Bridge

PWRC is the native PowerChain ecosystem asset on Solana. wPWRC is the 1:1 bridge-backed representation on Sui.

```text
Solana PWRC → Lock / Escrow → Cross-Chain Verification → Mint wPWRC on Sui
Sui wPWRC → Burn → Cross-Chain Verification → Release PWRC on Solana
```

Invariant:

```text
wPWRC circulating on Sui <= PWRC committed to bridge backing
```

PWRC and wPWRC are network utility/reward assets and are economically distinct from Wh, kWh RWA and MWh RWA.
