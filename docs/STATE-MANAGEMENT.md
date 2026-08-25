# Application Store

The root `/store` layer owns small, framework-neutral client-state primitives.

The Energy app now uses `energyContextStore` for household, community, company, client and grid-operator context selection. React consumes the external store through `useSyncExternalStore`.

The client store must not be treated as an authority for Energy RWA supply, balances, permissions, settlement state or meter evidence. Those values remain server/domain data.
