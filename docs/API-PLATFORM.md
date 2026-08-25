# PowerChain API Platform v1.0.0

The API platform separates contract ownership from deployable transports.

```text
packages/api
├── api/v1/            REST route manifest
├── swagger/           OpenAPI 3.1 source of truth
├── postman/           HTTP collection, environment and provisioning templates
├── websocket/         AsyncAPI 3 realtime contract
├── grpc/proto/        Protobuf contracts
└── src/               shared REST/realtime/gRPC TypeScript contracts

apps/api               Next.js REST gateway :3002
apps/realtime          WebSocket gateway :3012
apps/grpc              internal gRPC gateway :50051
apps/worker            transactional outbox publisher
Redis                  cross-process event fan-out
```

REST remains the external command/query boundary. WebSocket is for authenticated organization-scoped event delivery. gRPC is for internal service-to-service calls and server streaming. None of these transports changes the canonical PostgreSQL/Prisma energy ledger authority.
