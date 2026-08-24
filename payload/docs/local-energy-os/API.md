# Local Energy API

Base namespace: `/api/v1`.

Core resources:

- `/energy-measurements`
- `/energy-proofs`
- `/energy-batches`
- `/energy-positions`
- `/energy-reservations`
- `/energy-retirements`
- `/energy-orders`
- `/trades`
- `/deliveries`
- `/settlements`
- `/grid`
- `/flexibility`
- `/vpp`
- `/pwrc`
- `/pwrc/bridge`
- `/oracle`
- `/x402`

All energy quantities are serialized as decimal strings in Wh at API boundaries to avoid JavaScript integer precision loss.
