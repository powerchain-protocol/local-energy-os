# Shared Package

`@powerchain/shared` contains stable cross-domain metadata and harmless primitives that truly belong to multiple applications.

Do not move physical-energy invariants, settlement logic, authorization or bridge accounting into `shared`; those remain in their domain packages. This prevents a generic shared package from becoming an unowned dependency sink.
