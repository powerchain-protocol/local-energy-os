# PowerChain WebSocket Gateway

Realtime service on port `3107`. HTTP health and channel discovery share the
listener with the WebSocket endpoint at `/ws`; clients can subscribe and
unsubscribe from canonical operational channels.

Run with `pnpm --filter @powerchain/websocket-gateway dev`.
