# gRPC

`apps/grpc` exposes internal gRPC services on port `50051` by default.

- `SystemService.Check` — service health.
- `EventStreamService.Subscribe` — organization-scoped server-streamed domain events.

Canonical protobuf files live in `packages/api/grpc/proto/powerchain/v1`. gRPC is intended for trusted service-to-service networks. Do not expose the insecure local development listener directly to the public internet; production deployments must terminate mTLS/TLS and enforce service identity at the network/service-mesh boundary.
