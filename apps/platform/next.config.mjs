import { loadRootEnv } from "../../tools/load-root-env.mjs";
loadRootEnv();
/** @type {import("next").NextConfig} */
const nextConfig={ reactStrictMode:true, poweredByHeader:false, transpilePackages:["@powerchain/config","@powerchain/contracts","@powerchain/api-client","@powerchain/saas","@powerchain/energy-core","@powerchain/energy-rwa","@powerchain/pwrc","@powerchain/ui"] };
export default nextConfig;
