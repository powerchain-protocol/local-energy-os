# `/store`

Framework-neutral client state primitives for PowerChain application shells.

Use this layer for ephemeral cross-component state such as operating context, UI filters, and view preferences. Do **not** mirror authoritative balances, permissions, Energy RWA supply, or settlement records here; those remain server/domain state.

`energyContextStore` is wired into `apps/energy/components/context-provider.tsx` through React `useSyncExternalStore`.
