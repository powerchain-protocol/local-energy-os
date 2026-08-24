import type { PlatformCatalogSummary, PlatformLayer } from "@/types/platform";

export const PLATFORM_LAYERS: PlatformLayer[] = [
  {
    id: "foundation",
    name: "Foundation",
    eyebrow: "Trust, identity and policy",
    description: "Shared enterprise controls inherited by every PowerChain cloud, runtime and workspace.",
    capabilities: [
      { id: "identity", name: "Identity Foundation", description: "Multi-tenant identity, users, teams, federation, SSO, OAuth and passkeys.", href: "/organizations/participants", status: "available", services: ["Organizations", "RBAC", "ABAC", "Sessions"] },
      { id: "security", name: "Security Foundation", description: "Zero-trust controls, secrets, device identity, certificates and API security.", href: "/settings/integrations", status: "preview", services: ["Secret manager", "KMS", "Device trust", "Audit"] },
      { id: "trust", name: "Trust Foundation", description: "Proof-of-Energy, provenance, oracle trust and immutable asset lineage.", href: "/proof-of-energy", status: "available", services: ["Attestations", "Signatures", "Provenance", "Lineage"] },
      { id: "governance", name: "Governance Foundation", description: "Policy, treasury, voting, compliance, AI governance and data governance.", href: "/tokenization", status: "preview", services: ["Policies", "DAO", "Treasury", "Compliance"] },
    ],
  },
  {
    id: "cloud",
    name: "Platform Clouds",
    eyebrow: "Domain capabilities at cloud scale",
    description: "Composable clouds for energy, AI, finance, enterprise operations, data, IoT and marketplaces.",
    capabilities: [
      { id: "energy-cloud", name: "Energy Cloud", description: "Generation, grid, assets, storage, forecasting and digital twins.", href: "/energy", status: "available", services: ["Renewables", "Smart Grid", "Storage", "Digital Twins"] },
      { id: "ai-cloud", name: "AI Cloud", description: "GRIDLLM models, agents, skills, memory, evaluation and optimization.", href: "/intelligence", status: "available", services: ["Forecasting", "Agents", "Optimization", "Copilot"] },
      { id: "financial-cloud", name: "Financial Cloud", description: "Treasury, settlement, billing, wallets, escrow and tokenized assets.", href: "/wallet", status: "available", services: ["Treasury", "Payments", "Escrow", "Billing"] },
      { id: "marketplace-cloud", name: "Marketplace Cloud", description: "Multi-market commerce for energy, carbon, storage, charging and services.", href: "/exchange", status: "available", services: ["Order books", "Matching", "Pricing", "Settlement"] },
      { id: "iot-cloud", name: "IoT & DePIN Cloud", description: "Smart meters, gateways, telemetry, device management and validator networks.", href: "/metering/smart-meters", status: "available", services: ["Meters", "Gateways", "LoRaWAN", "DePIN"] },
      { id: "developer-cloud", name: "Developer Cloud", description: "APIs, SDKs, webhooks, extensions, plugins and integration services.", href: "/settings/integrations", status: "preview", services: ["OpenAPI", "SDKs", "Webhooks", "Plugins"] },
    ],
  },
  {
    id: "fabric",
    name: "Platform Fabric",
    eyebrow: "Connected data and automation",
    description: "The connective tissue joining energy flows, events, twins, integrations, security and AI.",
    capabilities: [
      { id: "energy-fabric", name: "Energy Fabric", description: "Generation-to-settlement orchestration with trusted physical provenance.", href: "/proof-of-energy", status: "available", services: ["Verification", "Tokenization", "Distribution", "Settlement"] },
      { id: "data-fabric", name: "Data Fabric", description: "Streaming, time-series, catalogs, knowledge graphs and operational analytics.", href: "/analytics", status: "preview", services: ["Events", "Time series", "Catalog", "Knowledge graph"] },
      { id: "ai-fabric", name: "AI Fabric", description: "Models, agents, skills, context, planning, tools and governed automation.", href: "/chat", status: "preview", services: ["Models", "Agents", "Skills", "Memory"] },
      { id: "integration-fabric", name: "Integration Fabric", description: "APIs, event bus, webhooks, queues, enterprise connectors and MCP.", href: "/settings/integrations", status: "preview", services: ["REST", "Events", "Queues", "Connectors"] },
      { id: "twin-fabric", name: "Digital Twin Fabric", description: "Live representations of plants, meters, storage, buildings and grids.", href: "/digital-twins", status: "available", services: ["State", "Telemetry", "Simulation", "Lifecycle"] },
    ],
  },
  {
    id: "runtime",
    name: "Managed Runtime",
    eyebrow: "Execution and orchestration",
    description: "Managed runtimes for AI, agents, workflows, applications, contracts, events and edge devices.",
    capabilities: [
      { id: "ai-runtime", name: "AI & Agent Runtime", description: "Model routing, context, planning, tool execution and multi-agent coordination.", href: "/intelligence", status: "preview", services: ["Routing", "Context", "Planning", "Tools"] },
      { id: "workflow-runtime", name: "Workflow Runtime", description: "Rules, approvals, schedules, events, retries and human-in-the-loop operations.", status: "planned", services: ["Rules", "Approvals", "Schedules", "Retries"] },
      { id: "blockchain-runtime", name: "Blockchain Runtime", description: "Solana programs, Sui modules, settlement, governance and future EVM adapters.", href: "/blockchain", status: "available", services: ["Solana", "Sui", "Programs", "Treasury"] },
      { id: "iot-runtime", name: "IoT & Edge Runtime", description: "Secure execution for meters, sensors, gateways, firmware and edge AI.", href: "/hardwares", status: "available", services: ["Devices", "Firmware", "Telemetry", "Edge AI"] },
      { id: "event-runtime", name: "Event Runtime", description: "Immutable domain events, routing, delivery guarantees and integration hooks.", status: "preview", services: ["Domain events", "Subscriptions", "Replay", "Audit"] },
    ],
  },
  {
    id: "studios",
    name: "Digital Studios",
    eyebrow: "Visual builders",
    description: "Low-code workspaces for building AI, workflows, integrations, twins, dashboards and marketplaces.",
    capabilities: [
      { id: "ai-studio", name: "AI Studio", description: "Build, evaluate, deploy and monitor models, prompts, agents and LoRA adapters.", href: "/ai", status: "preview", services: ["Models", "Agents", "Prompts", "Evaluation"] },
      { id: "workflow-studio", name: "Workflow Studio", description: "Design event-driven automations, approvals, schedules and AI actions.", status: "planned", services: ["Canvas", "Rules", "Approvals", "Actions"] },
      { id: "twin-studio", name: "Digital Twin Studio", description: "Model renewable sites, grids, buildings, storage and urban infrastructure.", href: "/digital-twins", status: "preview", services: ["Models", "Topology", "Simulation", "Telemetry"] },
      { id: "dashboard-studio", name: "Dashboard Studio", description: "Compose role-aware operational dashboards from governed data products.", href: "/analytics", status: "planned", services: ["Widgets", "KPIs", "Layouts", "Sharing"] },
    ],
  },
  {
    id: "hubs",
    name: "Ecosystem Hubs",
    eyebrow: "Communities and collaboration",
    description: "Purpose-built hubs for enterprise users, developers, partners, researchers and energy communities.",
    capabilities: [
      { id: "energy-hub", name: "Energy Hub", description: "Assets, operations, projects, communities and verified energy commerce.", href: "/ecosystem", status: "available", services: ["Operations", "Projects", "Communities", "Commerce"] },
      { id: "developer-hub", name: "Developer Hub", description: "Documentation, API keys, SDKs, samples, plugins and application publishing.", href: "/settings/integrations", status: "preview", services: ["Docs", "API keys", "SDKs", "Plugins"] },
      { id: "partner-hub", name: "Partner Hub", description: "Co-selling, integrations, service catalogs, referrals and revenue sharing.", href: "/organizations/participants", status: "preview", services: ["Partners", "Catalog", "Referrals", "Revenue"] },
      { id: "community-hub", name: "Community Hub", description: "Shared energy, governance, local projects, rewards and member participation.", href: "/p2p-energy", status: "available", services: ["P2P", "Projects", "Governance", "Rewards"] },
    ],
  },
  {
    id: "marketplaces",
    name: "Marketplaces",
    eyebrow: "Renewable digital economy",
    description: "Unified commerce for energy, environmental assets, hardware, software and professional services.",
    capabilities: [
      { id: "energy-market", name: "Energy Marketplace", description: "Spot, scheduled, bilateral, community and capacity energy markets.", href: "/exchange", status: "available", services: ["Energy", "Storage", "Charging", "Flexibility"] },
      { id: "carbon-market", name: "Carbon Marketplace", description: "Issue, trade, transfer and retire verified environmental assets.", href: "/carbon", status: "available", services: ["CRT", "REC", "GO", "Retirement"] },
      { id: "hardware-market", name: "Hardware Marketplace", description: "Certified smart meters, gateways, chargers, controllers and edge devices.", href: "/products/devices", status: "available", services: ["Meters", "Gateways", "Chargers", "Sensors"] },
      { id: "service-market", name: "Service Marketplace", description: "Installation, verification, maintenance, finance and professional services.", href: "/marketplace", status: "preview", services: ["Installers", "Auditors", "Finance", "Support"] },
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    eyebrow: "Decision support across the ecosystem",
    description: "Specialized intelligence products for energy, climate, markets, treasury, customers and operations.",
    capabilities: [
      { id: "energy-intelligence", name: "Energy Intelligence", description: "Forecast production, consumption, constraints and dispatch.", href: "/intelligence", status: "available", services: ["Forecasting", "Dispatch", "Optimization", "Risk"] },
      { id: "market-intelligence", name: "Marketplace Intelligence", description: "Price, liquidity, matching, counterparty and settlement intelligence.", href: "/exchange", status: "available", services: ["Pricing", "Liquidity", "Matching", "Risk"] },
      { id: "carbon-intelligence", name: "Carbon Intelligence", description: "Carbon performance, credit pricing, compliance and reduction opportunities.", href: "/carbon", status: "available", services: ["Accounting", "Pricing", "Compliance", "Optimization"] },
      { id: "operations-intelligence", name: "Operational Intelligence", description: "Fleet health, incidents, maintenance and system-wide recommendations.", href: "/", status: "available", services: ["Health", "Incidents", "Maintenance", "Recommendations"] },
    ],
  },
  {
    id: "experience",
    name: "Experience Layer",
    eyebrow: "Role-aware workspaces",
    description: "Personalized, accessible experiences for every participant in the renewable-energy economy.",
    capabilities: [
      { id: "role-dashboards", name: "Personalized Dashboards", description: "Consumer, prosumer, utility, enterprise, government, partner and validator views.", href: "/", status: "available", services: ["Consumer", "Prosumer", "Utility", "Executive"] },
      { id: "collaboration", name: "Collaboration", description: "Teams, shared workspaces, projects, tasks, comments and operational chat.", href: "/chat", status: "preview", services: ["Teams", "Projects", "Tasks", "Chat"] },
      { id: "content", name: "Content & Knowledge", description: "Documents, contracts, certificates, reports, images and knowledge bases.", status: "planned", services: ["Documents", "Contracts", "Reports", "Knowledge"] },
      { id: "customer-success", name: "Customer Success", description: "Support, service portals, tickets, health scores and AI assistance.", href: "/crm", status: "planned", services: ["Support", "Tickets", "Health", "Portal"] },
    ],
  },
  {
    id: "ecosystem",
    name: "Global Ecosystem",
    eyebrow: "Participants and network effects",
    description: "Utilities, enterprises, governments, communities, manufacturers, developers, researchers and investors.",
    capabilities: [
      { id: "participants", name: "Organizations & Participants", description: "A unified multi-role model for every ecosystem participant.", href: "/organizations/participants", status: "available", services: ["Utilities", "Enterprises", "Communities", "Partners"] },
      { id: "research", name: "Research Network", description: "Universities, laboratories and climate researchers collaborating on open innovation.", status: "planned", services: ["Universities", "Labs", "Datasets", "Pilots"] },
      { id: "capital", name: "Investment Network", description: "Renewable project finance, crowdfunding, institutional capital and impact reporting.", href: "/crowdfunding", status: "available", services: ["Projects", "Funding", "Investors", "Impact"] },
    ],
  },
];

export function summarizePlatformCatalog(): PlatformCatalogSummary {
  const capabilities = PLATFORM_LAYERS.flatMap((layer) => layer.capabilities);
  return {
    layers: PLATFORM_LAYERS.length,
    capabilities: capabilities.length,
    available: capabilities.filter((item) => item.status === "available").length,
    preview: capabilities.filter((item) => item.status === "preview").length,
    planned: capabilities.filter((item) => item.status === "planned").length,
  };
}
