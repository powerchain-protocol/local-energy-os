# Proof of Energy architecture

Proof of Energy turns signed meter observations into an auditable energy record. An observation enters through the integration fabric, is normalized to canonical units, checked for device identity and time continuity, then evaluated by the proof policy before issuance.

Production issuers must retain source provenance, policy version, validation outcome, and immutable identifiers. A failed or stale upstream check cannot be represented as verified generation; the record remains rejected or pending until evidence is sufficient.
