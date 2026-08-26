import { createBackendApp } from "./server.js";
const { app, config } = createBackendApp();
const server = app.listen(config.BACKEND_PORT, config.BACKEND_HOST, () => {
  console.log(`[PowerChain backend] http://${config.BACKEND_HOST}:${config.BACKEND_PORT}/api/v1`);
});
function shutdown(signal: string) {
  console.log(`[PowerChain backend] ${signal}; shutting down`);
  server.close((error) => process.exit(error ? 1 : 0));
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
