import { loadRootEnv } from "../../tools/load-root-env.mjs";
loadRootEnv();
/** @type {import('next').NextConfig} */
const nextConfig={poweredByHeader:false,reactStrictMode:true,transpilePackages:["@powerchain/shared","@powerchain/api-client","@powerchain/ui"]}; export default nextConfig;
