# PowerChain Workers

Idempotent job service on port `3108`. It accepts supported reconciliation,
notification, and health jobs, exposes queue statistics, and keeps explicit
queued, running, completed, and failed states.

Run with `pnpm --filter @powerchain/workers dev`.
