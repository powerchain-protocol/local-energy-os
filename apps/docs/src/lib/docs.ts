import "server-only";

import fs from "node:fs";
import path from "node:path";

export type DocGroup =
  | "Overview"
  | "Energy"
  | "Markets & Grid"
  | "Networks"
  | "Platform"
  | "Operations";

export interface DocDefinition {
  slug: string;
  file: string;
  title: string;
  description: string;
  group: DocGroup;
  featured?: boolean;
}

export const DOCS: readonly DocDefinition[] = [
  {
    slug: "whitepaper",
    file: "WHITEPAPER.md",
    title: "Whitepaper",
    description: "Energy infrastructure, verified Energy RWA, multi-chain settlement and machine economy.",
    group: "Overview",
    featured: true,
  },
  {
    slug: "local-energy-os",
    file: "LOCAL-ENERGY-OS.md",
    title: "Local Energy OS",
    description: "Canonical full-stack platform documentation.",
    group: "Overview",
    featured: true,
  },
  {
    slug: "architecture",
    file: "ARCHITECTURE.md",
    title: "Architecture",
    description: "System layers, boundaries and canonical platform model.",
    group: "Overview",
    featured: true,
  },
  {
    slug: "energy-rwa",
    file: "ENERGY-RWA.md",
    title: "Energy RWA",
    description: "Verified kWh and MWh real-world energy representations backed by Wh.",
    group: "Energy",
    featured: true,
  },
  {
    slug: "pwrc",
    file: "PWRC.md",
    title: "PWRC & wPWRC",
    description: "PWRC on Solana and the 1:1 bridge-backed wPWRC representation on Sui.",
    group: "Energy",
    featured: true,
  },
  {
    slug: "p2p-local-energy",
    file: "P2P-LOCAL-ENERGY.md",
    title: "P2P Local Energy",
    description: "Local market matching, delivery and reconciliation.",
    group: "Markets & Grid",
  },
  {
    slug: "grid",
    file: "GRID.md",
    title: "Grid Digital Twin",
    description: "Grid areas, substations, transformers, feeders and connection points.",
    group: "Markets & Grid",
  },
  {
    slug: "mapper",
    file: "MAPPER.md",
    title: "Mapper",
    description: "Geospatial energy intelligence and network topology.",
    group: "Markets & Grid",
  },
  {
    slug: "ev-charging",
    file: "EV-CHARGING.md",
    title: "EV Charging",
    description: "OCPP, ISO 15118, OCPI, smart charging and V2G.",
    group: "Markets & Grid",
  },
  {
    slug: "power-plants",
    file: "POWER-PLANTS.md",
    title: "Power Plants",
    description: "Utility-scale generation and settlement.",
    group: "Energy",
  },
  {
    slug: "wind-farms",
    file: "WIND-FARMS.md",
    title: "Wind Farms",
    description: "Wind-farm operational model and MWh Energy RWA.",
    group: "Energy",
  },
  {
    slug: "supply-chain",
    file: "SUPPLY-CHAIN.md",
    title: "Supply Chain",
    description: "Infrastructure lifecycle, evidence and asset passports.",
    group: "Energy",
  },
  {
    slug: "solana",
    file: "SOLANA.md",
    title: "Solana / SVM",
    description: "Primary blockchain execution, RPC and program architecture.",
    group: "Networks",
  },
  {
    slug: "sui",
    file: "SUI.md",
    title: "Sui / Move",
    description: "Object-centric representations, wPWRC and Move modules.",
    group: "Networks",
  },
  {
    slug: "cross-chain",
    file: "CROSS-CHAIN.md",
    title: "Cross-Chain",
    description: "Representation allocation and non-duplication invariants.",
    group: "Networks",
  },
  {
    slug: "cctp",
    file: "CCTP.md",
    title: "CCTP",
    description: "Native USDC cross-chain settlement.",
    group: "Networks",
  },
  {
    slug: "programs",
    file: "PROGRAMS.md",
    title: "Programs",
    description: "Anchor and Pinocchio program architecture.",
    group: "Networks",
  },
  {
    slug: "oracles",
    file: "ORACLES.md",
    title: "Oracle Router",
    description: "Pyth, Chainlink, freshness and fail-safe policy.",
    group: "Platform",
  },
  {
    slug: "x402",
    file: "X402.md",
    title: "x402 Machine Economy",
    description: "Machine payments, agent spend controls and paid APIs.",
    group: "Platform",
  },
  {
    slug: "saas",
    file: "SAAS.md",
    title: "SaaS Control Plane",
    description: "Tenants, plans, applications, entitlements and workspaces.",
    group: "Platform",
  },
  {
    slug: "settlement",
    file: "SETTLEMENT.md",
    title: "Settlement",
    description: "Energy, financial and blockchain settlement separation.",
    group: "Platform",
  },
  {
    slug: "api",
    file: "API.md",
    title: "API",
    description: "Canonical /api/v1 resource structure.",
    group: "Platform",
  },
  {
    slug: "protocol-registry",
    file: "PROTOCOL-REGISTRY.md",
    title: "Protocol Registry",
    description: "Metering, grid, EV, blockchain and machine-payment capabilities.",
    group: "Platform",
  },
  {
    slug: "security",
    file: "SECURITY.md",
    title: "Security",
    description: "Safety invariants and execution controls.",
    group: "Operations",
  },
  {
    slug: "operations",
    file: "OPERATIONS.md",
    title: "Operations",
    description: "Runtime safety, subsystem health and degraded-service behavior.",
    group: "Operations",
  },
  {
    slug: "development",
    file: "DEVELOPMENT.md",
    title: "Development",
    description: "Local development and monorepo integration.",
    group: "Operations",
  },
] as const;

function docsRootCandidates(): string[] {
  const configured = process.env.POWERCHAIN_DOCS_ROOT;
  return [
    ...(configured ? [path.resolve(configured)] : []),
    path.resolve(process.cwd(), "docs"),
    path.resolve(process.cwd(), "../../docs"),
    path.resolve(process.cwd(), "../docs"),
  ];
}

export function resolveDocsRoot(): string {
  for (const candidate of docsRootCandidates()) {
    if (
      fs.existsSync(candidate) &&
      fs.existsSync(path.join(candidate, "LOCAL-ENERGY-OS.md"))
    ) {
      return candidate;
    }
  }

  throw new Error(
    "Unable to locate canonical PowerChain docs/. Set POWERCHAIN_DOCS_ROOT when building outside the monorepo.",
  );
}

export function getDocDefinition(slug: string): DocDefinition | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}

export function readDoc(slug: string): { definition: DocDefinition; markdown: string } {
  const definition = getDocDefinition(slug);
  if (!definition) throw new Error(`Unknown documentation slug: ${slug}`);

  const file = path.join(resolveDocsRoot(), definition.file);
  const markdown = fs.readFileSync(file, "utf8");
  return { definition, markdown };
}

export function groupDocs(): Array<{ group: DocGroup; docs: DocDefinition[] }> {
  const order: DocGroup[] = [
    "Overview",
    "Energy",
    "Markets & Grid",
    "Networks",
    "Platform",
    "Operations",
  ];

  return order.map((group) => ({
    group,
    docs: DOCS.filter((doc) => doc.group === group),
  }));
}
