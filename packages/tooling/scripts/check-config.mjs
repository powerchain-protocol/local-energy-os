import fs from "node:fs";

const forbidden = ["auth.ts", "iot.ts", "depin.ts", "middleware.ts"];
for (const file of forbidden) {
  if (fs.existsSync(file)) throw new Error(`Root file should be organized elsewhere: ${file}`);
}

const required = [
  "apps/platform/proxy.ts",
  "packages/configuration/src/config/networks.ts",
  "packages/configuration/src/config/server-networks.ts",
  "packages/configuration/src/config/status.ts",
  "packages/configuration/src/env/schema.ts",
  "packages/configuration/src/env/client.ts",
  "packages/configuration/src/env/server.ts",
  "packages/configuration/src/env/index.ts",
  "apps/platform/tsconfig.e2e.json"
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing required config: ${file}`);
}
console.log("Configuration checks passed");
