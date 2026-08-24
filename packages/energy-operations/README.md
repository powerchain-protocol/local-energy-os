# @powerchain/energy-operations

Operational layer for PowerChain Digital Energy OS.

It keeps four concerns explicit and separate:

```text
Physical telemetry -> Digital Twin -> Delivery -> Reconciliation -> Financial settlement
```

Financial settlement never creates physical delivery proof, and a blockchain confirmation never substitutes for meter evidence.
