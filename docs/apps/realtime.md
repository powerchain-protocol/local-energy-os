# PowerChain Realtime

`@powerchain/app-realtime` is the organization-scoped WebSocket gateway. It listens on port `3012`, accepts short-lived tickets issued by `POST /api/v1/realtime/tickets`, subscribes to Redis Pub/Sub, and forwards only the topics authorized by the ticket.

The service is observational. It never performs economic mutations.
