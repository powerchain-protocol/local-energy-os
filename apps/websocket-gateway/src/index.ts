import { createApplication, json } from "@powerchain/application-runtime";

export const applicationName = "websocket-gateway" as const;
export const realtimeChannels = ["platform.status", "energy.telemetry", "market.quotes", "settlement.status", "notifications"] as const;

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain WebSocket Gateway",
    version: "1.0.0",
    description: "Authenticated realtime subscriptions and operational event delivery.",
    basePath: "/ws",
    capabilities: ["subscriptions", "events", "telemetry", "reconnect"],
  },
  routes: [{ method: "GET", path: "/api/v1/realtime/channels", summary: "List public realtime channel names", handler: () => json({ data: realtimeChannels, websocketPath: "/ws" }) }],
});
