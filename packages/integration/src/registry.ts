export type IntegrationCategory =
  "payments" | "pricing" | "liquidity" | "infrastructure" | "assets" | "depin";
export interface IntegrationDefinition {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: IntegrationCategory;
  availability: "available" | "beta" | "planned";
  capabilities: string[];
  documentationPath: string;
}
export const integrationDefinitions: IntegrationDefinition[] = [
  {
    id: "stripe",
    slug: "stripe",
    name: "Stripe",
    summary: "Hosted checkout sessions and card payment orchestration.",
    category: "payments",
    availability: "available",
    capabilities: ["checkout", "payments", "idempotency"],
    documentationPath: "/docs/integrations#stripe",
  },
  {
    id: "moonpay",
    slug: "moonpay",
    name: "MoonPay",
    summary: "Fiat-to-crypto quotes and on-ramp funding.",
    category: "payments",
    availability: "beta",
    capabilities: ["quotes", "on-ramp", "funding"],
    documentationPath: "/docs/integrations#moonpay",
  },
  {
    id: "coinbase-pay",
    slug: "coinbase-pay",
    name: "Coinbase Pay",
    summary: "Coinbase-hosted on-ramp session creation.",
    category: "payments",
    availability: "beta",
    capabilities: ["sessions", "on-ramp", "funding"],
    documentationPath: "/docs/integrations#coinbase-pay",
  },
  {
    id: "solana-pay",
    slug: "solana-pay",
    name: "Solana Pay",
    summary: "Non-custodial transfer request URLs for Solana wallets.",
    category: "payments",
    availability: "available",
    capabilities: ["transfer URLs", "references", "SPL tokens"],
    documentationPath: "/docs/integrations#solana-pay",
  },
  {
    id: "onramp",
    slug: "onramp",
    name: "Onramp",
    summary: "Fiat-to-digital-asset funding and checkout sessions.",
    category: "payments",
    availability: "beta",
    capabilities: ["quotes", "sessions", "compliance"],
    documentationPath: "/docs/integrations#onramp",
  },
  {
    id: "circle",
    slug: "circle",
    name: "Circle",
    summary: "USDC settlement, treasury transfers and payment operations.",
    category: "payments",
    availability: "beta",
    capabilities: ["USDC", "transfers", "payments"],
    documentationPath: "/docs/integrations#circle",
  },
  {
    id: "pyth",
    slug: "pyth",
    name: "Pyth Hermes",
    summary: "Authenticated market-price retrieval and streaming.",
    category: "pricing",
    availability: "available",
    capabilities: ["prices", "streaming", "snapshots"],
    documentationPath: "/docs/integrations#pyth",
  },
  {
    id: "jupiter",
    slug: "jupiter",
    name: "Jupiter",
    summary: "Solana quote routing and transaction construction.",
    category: "liquidity",
    availability: "beta",
    capabilities: ["quotes", "swaps", "routing"],
    documentationPath: "/docs/integrations#jupiter",
  },
  {
    id: "raydium",
    slug: "raydium",
    name: "Raydium",
    summary: "Solana liquidity pools and swap execution boundaries.",
    category: "liquidity",
    availability: "beta",
    capabilities: ["pools", "swaps", "liquidity"],
    documentationPath: "/docs/integrations#raydium",
  },
  {
    id: "orca",
    slug: "orca",
    name: "Orca",
    summary: "Whirlpool liquidity and concentrated-liquidity operations.",
    category: "liquidity",
    availability: "beta",
    capabilities: ["whirlpools", "quotes", "positions"],
    documentationPath: "/docs/integrations#orca",
  },
  {
    id: "meteora",
    slug: "meteora",
    name: "Meteora",
    summary: "Dynamic liquidity and market-making integrations.",
    category: "liquidity",
    availability: "beta",
    capabilities: ["DLMM", "pools", "positions"],
    documentationPath: "/docs/integrations#meteora",
  },
  {
    id: "helius",
    slug: "helius",
    name: "Helius",
    summary: "Solana RPC, DAS, webhooks and transaction enrichment.",
    category: "infrastructure",
    availability: "available",
    capabilities: ["RPC", "DAS", "webhooks"],
    documentationPath: "/docs/integrations#helius",
  },
  {
    id: "metaplex",
    slug: "metaplex",
    name: "Metaplex",
    summary: "Token metadata and digital-asset lifecycle operations.",
    category: "assets",
    availability: "beta",
    capabilities: ["metadata", "digital assets", "collections"],
    documentationPath: "/docs/integrations#metaplex",
  },
  {
    id: "helium",
    slug: "helium",
    name: "Helium",
    summary: "Sourced DePIN hotspot and network information.",
    category: "depin",
    availability: "beta",
    capabilities: ["hotspots", "coverage", "network data"],
    documentationPath: "/docs/integrations#helium",
  },
  {
    id: "cetus",
    slug: "cetus",
    name: "Cetus",
    summary: "Sui CLMM quote, pool and swap construction.",
    category: "liquidity",
    availability: "available",
    capabilities: ["CLMM", "quotes", "swaps"],
    documentationPath: "/docs/integrations#cetus",
  },
  {
    id: "streamflow",
    slug: "streamflow",
    name: "Streamflow",
    summary: "Token vesting, streaming and distribution workflows.",
    category: "payments",
    availability: "beta",
    capabilities: ["vesting", "streams", "distribution"],
    documentationPath: "/docs/integrations#streamflow",
  },
];
export function getIntegration(idOrSlug: string) {
  return integrationDefinitions.find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
  );
}
export function searchIntegrations(query: string) {
  const q = query.trim().toLowerCase();
  return q
    ? integrationDefinitions.filter((item) =>
        `${item.name} ${item.summary} ${item.capabilities.join(" ")}`
          .toLowerCase()
          .includes(q),
      )
    : integrationDefinitions;
}
