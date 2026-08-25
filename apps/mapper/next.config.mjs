import { loadRootEnv } from "../../tools/load-root-env.mjs";
loadRootEnv();
/** @type {import('next').NextConfig} */
const nextConfig={poweredByHeader:false,reactStrictMode:true,transpilePackages:["@powerchain/api-client","@powerchain/geospatial","@powerchain/ui"]}; export default nextConfig;
