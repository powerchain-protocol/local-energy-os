# PowerChain Energy RWA — PET-20 v1.0.0

PowerChain Energy RWA represents a verified physical-energy position without making blockchain state authoritative for electricity.

## Canonical hierarchy

```text
Energy Proof
    ↓
Finalized Energy Batch
    ↓
Canonical Energy Position
    ↓
PET-20 Metadata
    ↓
Optional representations
   ├── Solana / SPL Token-2022
   └── Sui / Move Object
```

PET-20 uses:

```text
assetClass    = VERIFIED_ENERGY_POSITION
backingLedger = POWERCHAIN_ENERGY_LEDGER
canonicalUnit = Wh
version       = 1.0.0
```

## Backing invariant

```text
Active reservations
+
Active Solana representation Wh
+
Active Sui representation Wh
+
Retired Wh
<=
Canonical Energy Position Wh
```

Across positions, active economic energy cannot exceed verified Energy Batch backing.

## Position lifecycle

```text
AVAILABLE → RESERVED → COMMITTED → DELIVERING → DELIVERED
                                              ↓
                                         SETTLING
                                              ↓
                                           SETTLED
                                              ↓
                                           RETIRED
```

Controlled release/dispute paths remain part of `@powerchain/energy-core`.

## Safe actions

The Energy RWA workspace uses review-first execution. Reserve, represent and retire operations fetch current backing before final submission and the server revalidates the invariant inside the authoritative runtime.

A canonical Energy Position cannot retire while active reservations or chain representations remain. Reservations must be released and active representations must be retired/migrated first.

## Cross-chain

Solana and Sui representations share one canonical backing pool:

```text
Solana Active Wh + Sui Active Wh <= Canonical Position Wh
```

Creating 100 MWh on Solana and another 100 MWh on Sui from the same 100 MWh physical position is invalid.

PWRC and wPWRC are separate from Energy RWA accounting:

```text
PWRC  = native Solana utility/governance asset
wPWRC = 1:1 bridge-backed Sui representation of PWRC
Wh    = physical energy accounting unit
```
