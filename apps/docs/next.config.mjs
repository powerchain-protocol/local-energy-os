import { loadRootEnv } from "../../tools/load-root-env.mjs";
loadRootEnv();
/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@powerchain/docs-ui", "@powerchain/shared", "@powerchain/ui"]
};
export default nextConfig;
