# PWRC and wPWRC

## PWRC

PWRC is the native PowerChain ecosystem asset on **Solana**. It supports ecosystem utility, operating rewards, DePIN incentives, machine-economy services, configured protocol fees, network participation, treasury operations, and application utility.

PWRC does **not** represent electricity.

```text
PWRC != Wh
PWRC != kWh
PWRC != MWh
```

## wPWRC

wPWRC is the **1:1 bridged Sui representation** of PWRC.

```text
SOLANA PWRC → Lock / Escrow → Cross-Chain Verification → SUI → Mint wPWRC
SUI wPWRC → Burn → Cross-Chain Verification → Release PWRC → SOLANA
```

Invariant: `wPWRC circulating on Sui <= PWRC committed to bridge backing`.
