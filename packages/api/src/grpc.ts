import { fileURLToPath } from "node:url";

export const POWERCHAIN_GRPC_VERSION = "v1" as const;
export const POWERCHAIN_GRPC_DEFAULT_PORT = 50051;
export const POWERCHAIN_GRPC_PACKAGE = "powerchain.api.v1" as const;

export const POWERCHAIN_GRPC_SERVICES = {
  system: "powerchain.api.v1.SystemService",
  events: "powerchain.api.v1.EventStreamService",
} as const;

export function powerChainProtoPath(file: "system.proto" | "events.proto"): string {
  return fileURLToPath(new URL(`../grpc/proto/powerchain/v1/${file}`, import.meta.url));
}
