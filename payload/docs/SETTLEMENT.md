# Settlement

PowerChain separates Energy Settlement, Financial Settlement, and Blockchain Settlement.

```text
DELIVERY_PENDING → METERING → RECONCILING → CALCULATED → PAYMENT_PENDING → PAID → RECONCILED
```

Exceptional states: `DISPUTED`, `FAILED`, `REQUIRES_REVIEW`.

The canonical financial ledger is double-entry. Blockchain is a settlement rail, not the accounting database, and payment confirmation is not proof of physical delivery.
