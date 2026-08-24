export type PowerChainProductId =
  | "digital-energy-os"
  | "copilot"
  | "energy-rwa"
  | "local-energy"
  | "infrastructure"
  | "device-products";

export interface PowerChainProduct {
  id: PowerChainProductId;
  name: string;
  eyebrow: string;
  description: string;
  href: string;
  status: "CANONICAL" | "INTEGRATED";
  capabilities: string[];
}

export const POWERCHAIN_PRODUCTS: readonly PowerChainProduct[] = [
  {
    id:"digital-energy-os",
    name:"Digital Energy OS",
    eyebrow:"Energy infrastructure operating system",
    description:"Coordinate physical energy, telemetry, Digital Twin operations, verified Energy Positions, delivery, reconciliation and settlement.",
    href:"/digital-energy",
    status:"CANONICAL",
    capabilities:["Digital Twin","Energy Ledger","Energy Operations","Asset Graph","Settlement controls"],
  },
  {
    id:"copilot",
    name:"PowerChain Copilot",
    eyebrow:"Renewable RWA operating intelligence",
    description:"Ask naturally. Agents do the analysis. Skills execute the work. You stay in control.",
    href:"/copilot",
    status:"CANONICAL",
    capabilities:["RWA Orchestrator","Renewable RWA agents","Skills","Action Center","Human approval"],
  },
  {
    id:"energy-rwa",
    name:"Energy RWA",
    eyebrow:"Verified real-world energy assets",
    description:"PET-20 VERIFIED_ENERGY_POSITION assets backed by the authoritative PowerChain Energy Ledger.",
    href:"/energy-rwa",
    status:"CANONICAL",
    capabilities:["PET-20","Wh backing","Solana representation","Sui representation","Retirement"],
  },
  {
    id:"local-energy",
    name:"Local Energy OS",
    eyebrow:"Local energy coordination system",
    description:"Coordinate households, prosumers, communities, grid constraints, smart meters, batteries, EV charging, local markets, delivery and settlement.",
    href:"/local-energy",
    status:"CANONICAL",
    capabilities:["Local market","Grid & flexibility","Smart metering","Storage & EV","Delivery & settlement"],
  },
  {
    id:"infrastructure",
    name:"PowerChain Infrastructure",
    eyebrow:"Multi-network execution and data",
    description:"Solana/SVM, Sui/Move, oracle, explorer, RPC, settlement and machine-payment infrastructure for PowerChain applications.",
    href:"/blockchain",
    status:"INTEGRATED",
    capabilities:["Solana","Sui","Pyth","Helius","x402"],
  },
  {
    id:"device-products",
    name:"Energy Devices",
    eyebrow:"Trusted energy edge",
    description:"Smart metering, EV charging, renewable controls and edge hardware integrated with the Digital Energy OS.",
    href:"/products/devices",
    status:"INTEGRATED",
    capabilities:["Smart meters","EVSE","Edge gateways","Storage controls","Telemetry"],
  },
] as const;
