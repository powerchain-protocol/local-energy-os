# Proof of Energy contract

The Proof of Energy contract accepts a canonical observation reference, asset and meter identifiers, measurement interval, quantity and unit, provenance digest, policy version, and verification outcome. Machine contracts live in `packages/contracts` and schemas remain authoritative.

Consumers must reject unknown required versions and must not infer verified status from the presence of a record alone.
