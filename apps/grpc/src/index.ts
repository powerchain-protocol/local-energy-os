import { loadPowerChainRootEnv } from "@powerchain/config/node-env";
loadPowerChainRootEnv();
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { powerChainProtoPath, REALTIME_TOPICS, type RealtimeEventEnvelope, type RealtimeTopic } from "@powerchain/api";
import { subscribeRealtimeEvents } from "@powerchain/realtime";

const port = Number(process.env.GRPC_PORT ?? 50051);
const bind = process.env.GRPC_BIND ?? `0.0.0.0:${port}`;
const serviceToken = process.env.GRPC_SERVICE_TOKEN?.trim();
if (process.env.NODE_ENV === "production" && !serviceToken) throw new Error("GRPC_SERVICE_TOKEN is required in production");

function authorize(metadata: grpc.Metadata): void {
  if (!serviceToken) return;
  const provided = String(metadata.get("x-powerchain-service-token")[0] ?? "");
  if (provided !== serviceToken) throw Object.assign(new Error("gRPC service authentication failed"), { code: grpc.status.UNAUTHENTICATED });
}

const options = { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true } as const;
const systemDef = protoLoader.loadSync(powerChainProtoPath("system.proto"), options);
const eventsDef = protoLoader.loadSync(powerChainProtoPath("events.proto"), options);
const systemPkg = grpc.loadPackageDefinition(systemDef) as any;
const eventsPkg = grpc.loadPackageDefinition(eventsDef) as any;
const api = systemPkg.powerchain.api.v1;
const eventApi = eventsPkg.powerchain.api.v1;

const server = new grpc.Server();
server.addService(api.SystemService.service, {
  check(call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) {
    try { authorize(call.metadata); } catch (error) { const serviceError = new Error(error instanceof Error ? error.message : "Unauthenticated") as grpc.ServiceError; serviceError.code = grpc.status.UNAUTHENTICATED; return callback(serviceError); }
    callback(null, { service: "powerchain-grpc", version: "1.0.0", status: "OPERATIONAL", generated_at: new Date().toISOString() });
  },
});

server.addService(eventApi.EventStreamService.service, {
  subscribe(call: grpc.ServerWritableStream<{ topics?: string[] }, unknown>) {
    try { authorize(call.metadata); } catch (error) { call.destroy(Object.assign(error instanceof Error ? error : new Error("Unauthenticated"), { code: grpc.status.UNAUTHENTICATED })); return; }
    const organizationId = String(call.metadata.get("x-organization-id")[0] ?? "").trim();
    if (!organizationId) {
      call.destroy(new Error("x-organization-id metadata is required"));
      return;
    }
    const requested = (call.request.topics ?? []).filter((topic): topic is RealtimeTopic => REALTIME_TOPICS.includes(topic as RealtimeTopic));
    const topics = new Set<RealtimeTopic>(requested.length ? requested : REALTIME_TOPICS);
    let closed = false;
    let unsubscribe: (() => Promise<void>) | undefined;
    void subscribeRealtimeEvents((event: RealtimeEventEnvelope) => {
      if (closed || event.organizationId !== organizationId || !topics.has(event.topic)) return;
      call.write({
        id: event.id,
        version: event.version,
        topic: event.topic,
        type: event.type,
        occurred_at: event.occurredAt,
        organization_id: event.organizationId,
        aggregate_type: event.aggregateType,
        aggregate_id: event.aggregateId,
        correlation_id: event.correlationId ?? "",
        payload_json: JSON.stringify(event.payload),
      });
    }).then((close) => { unsubscribe = close; }).catch((error) => call.destroy(error));
    call.on("cancelled", () => { closed = true; if (unsubscribe) void unsubscribe(); });
    call.on("close", () => { closed = true; if (unsubscribe) void unsubscribe(); });
  },
});

server.bindAsync(bind, grpc.ServerCredentials.createInsecure(), (error) => {
  if (error) throw error;
  console.log(JSON.stringify({ service: "powerchain-grpc", version: "1.0.0", bind, status: "listening" }));
});

function shutdown(signal: string) {
  console.log(JSON.stringify({ service: "powerchain-grpc", status: "stopping", signal }));
  server.tryShutdown((error) => { if (error) server.forceShutdown(); process.exit(error ? 1 : 0); });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
