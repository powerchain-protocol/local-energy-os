import { createBackendApp } from "./server.js";
import { disconnectOperationsPrisma } from "./db.js";

const { app, config } = createBackendApp();
const server = app.listen(config.BACKEND_PORT, config.BACKEND_HOST, () => {
  console.log(`[PowerChain backend] http://${config.BACKEND_HOST}:${config.BACKEND_PORT}/api/v1`);
});

let stopping = false;
async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  console.log(`[PowerChain backend] ${signal}; shutting down`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectOperationsPrisma();
  process.exitCode = 0;
}
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
