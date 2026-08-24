import { existsSync } from "node:fs";
const required = [
  "apps/platform/src/app", "apps/platform/src/components/provider/wallet-provider.tsx", "packages/shared/src/context/index.ts",
  "packages/shared/src/constants/index.ts", "packages/shared/src/common/index.ts", "packages/database/src/clients/supabase",
  "packages/types/src/schemas/config", "packages/types/src/types/runtime/node.d.ts", "docs/api/swagger.yaml"
];
const forbidden = ["supabase", "schema", "apps/platform/src/components/wallet/wallet-provider.tsx"];
const errors = [];
for (const path of required) if (!existsSync(path)) errors.push(`Missing required path: ${path}`);
for (const path of forbidden) if (existsSync(path)) errors.push(`Remove deprecated path: ${path}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("PowerChain structure check passed.");
