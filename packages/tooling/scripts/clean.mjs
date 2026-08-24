import { rm } from "node:fs/promises";

await Promise.all([
  rm("apps/platform/.next", { recursive: true, force: true }),
  rm("apps/docs/.next", { recursive: true, force: true }),
  rm("apps/storybook/storybook-static", { recursive: true, force: true }),
  rm(".turbo", { recursive: true, force: true }),
  rm("coverage", { recursive: true, force: true }),
  rm("apps/platform/tsconfig.tsbuildinfo", { force: true }),
]);

console.log("PowerChain build artifacts removed.");
