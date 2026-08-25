/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@powerchain/shared", "@powerchain/ui"]
};
export default nextConfig;
