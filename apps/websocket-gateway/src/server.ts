import { startApplication } from "@powerchain/application-runtime";
import { gateway } from "@powerchain/websocket";
import { application } from "./index.ts";

const runtime = startApplication(application, 3107);
const realtime = gateway.createPowerChainWebSocketServer({ server: runtime.server, path: "/ws" });

const shutdown = async () => {
  await realtime.close();
  await runtime.close();
};
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
