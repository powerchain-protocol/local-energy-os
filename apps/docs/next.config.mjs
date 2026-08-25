/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@powerchain/docs-ui", "@powerchain/shared", "@powerchain/ui"]
};
export default nextConfig;
