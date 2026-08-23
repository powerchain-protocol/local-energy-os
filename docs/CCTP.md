# CCTP

CCTP is a native USDC cross-chain settlement adapter where supported.

```text
USDC → Burn on Source → Attestation → Mint Native USDC → Destination Settlement
```

`packages/cctp/` owns quote, transfer, attestation, tracking, reconciliation, and failure recovery. Stablecoin movement is independent from Energy RWA cross-chain supply.
