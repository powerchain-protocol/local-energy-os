# PowerChain App Router

The application uses the Next.js App Router exclusively. Route handlers live under `src/app/api/v1`; UI workspaces live under `src/app`. Canonical route constants are exported by `src/config/routes.ts`. Shared providers are composed in `src/app/providers.tsx`, while wallet state is owned by `src/components/provider/wallet-provider.tsx`.
