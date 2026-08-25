import { withApi } from "../../../../../lib/api";

export async function GET(req: Request) {
  return withApi(req, async () => ({
    rest: { version: "v1", basePath: "/api/v1", openapi: "/openapi.yaml", swagger: "/docs" },
    websocket: { version: "1.0", url: process.env.POWERCHAIN_REALTIME_URL ?? "ws://localhost:3012/v1/events", ticketEndpoint: "/api/v1/realtime/tickets", configured: Boolean(process.env.POWERCHAIN_REALTIME_TICKET_SECRET) },
    grpc: { version: "v1", address: process.env.POWERCHAIN_GRPC_PUBLIC_ADDRESS ?? "localhost:50051", protoRoot: "packages/api/grpc/proto/powerchain/v1", configured: process.env.NODE_ENV !== "production" || Boolean(process.env.GRPC_SERVICE_TOKEN) },
  }));
}
