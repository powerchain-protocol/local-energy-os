import { startApplication } from "@powerchain/application-runtime";
import { application } from "./index.ts";
import { startDigitalEnergyOutboxPublisher, stopDigitalEnergyOutboxPublisher } from "./digital-energy-outbox.ts";

startDigitalEnergyOutboxPublisher();
startApplication(application, 3108);

async function shutdown() {
  await stopDigitalEnergyOutboxPublisher();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
