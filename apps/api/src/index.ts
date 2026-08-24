import { createApplication, json } from "@powerchain/application-runtime";

export const applicationName = "api" as const;

export const serviceDirectory = [
  { id: "platform", audience: "users", url: process.env.PLATFORM_URL ?? "http://localhost:3000" },
  { id: "checkout", audience: "services", url: process.env.CHECKOUT_SERVICE_URL ?? "http://localhost:3102" },
  { id: "marketplace", audience: "services", url: process.env.MARKETPLACE_SERVICE_URL ?? "http://localhost:3103" },
  { id: "ai-gateway", audience: "services", url: process.env.AI_GATEWAY_URL ?? "http://localhost:3104" },
  { id: "integration-gateway", audience: "services", url: process.env.INTEGRATION_GATEWAY_URL ?? "http://localhost:3105" },
  { id: "explorer", audience: "services", url: process.env.EXPLORER_SERVICE_URL ?? "http://localhost:3106" },
  { id: "websocket-gateway", audience: "services", url: process.env.WEBSOCKET_GATEWAY_URL ?? "http://localhost:3107" },
  { id: "workers", audience: "services", url: process.env.WORKER_SERVICE_URL ?? "http://localhost:3108" },
] as const;

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain API",
    version: "1.0.0",
    description: "Canonical API entry point and service discovery surface.",
    basePath: "/api/v1",
    capabilities: ["service-discovery", "health", "versioning"],
  },
  routes: [
    { method: "GET", path: "/api/v1", summary: "Describe the public API", handler: () => json({ name: "PowerChain API", version: "1.0.0", documentation: "/openapi.yaml" }) },
    { method: "GET", path: "/api/v1/apps", summary: "List connected PowerChain applications", handler: () => json({ data: serviceDirectory }) },
    { method: "GET", path: "/api/v1/health", summary: "Return aggregate API liveness", handler: (_request, context) => json({ status: "ok", version: "1.0.0", requestId: context.requestId, checkedAt: context.receivedAt }) },
  ],
});
