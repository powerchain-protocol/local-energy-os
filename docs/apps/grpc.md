# PowerChain gRPC

`@powerchain/app-grpc` is the internal service-to-service gRPC gateway on port `50051`. Protobuf contracts are owned by `packages/api/grpc/proto/powerchain/v1`. Production requires `GRPC_SERVICE_TOKEN` and should be deployed behind TLS/mTLS or a service mesh.
