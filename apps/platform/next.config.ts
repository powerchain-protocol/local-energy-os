import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "../../packages/configuration/src/config/routes";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "X-Frame-Options", value: "DENY" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
  transpilePackages: ["@powerchain/actions", "@powerchain/configuration", "@powerchain/data", "@powerchain/database", "@powerchain/integration", "@powerchain/shared", "@powerchain/types", "@powerchain/ui", "@powerchain/ai-core", "@powerchain/ai-gateway", "@powerchain/ai-ui", "@powerchain/credits", "@powerchain/contracts"],
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s2.coinmarketcap.com", pathname: "/static/img/coins/**" },
      { protocol: "https", hostname: "cryptoicons.cc", pathname: "/**" }
    ]
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "recharts"]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return Object.entries(LEGACY_REDIRECTS).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  turbopack: {}

};

export default nextConfig;
