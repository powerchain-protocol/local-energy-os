# Compatibility policy

Stable contracts preserve existing required fields, identifiers, event meanings, and error semantics within a major release. New optional fields may be added when older consumers can safely ignore them. Removing fields or changing their interpretation requires a new major contract version.

Deprecations are announced with replacement guidance and a supported transition window. Conformance tests cover both the current stable contract and any explicitly supported predecessor.
