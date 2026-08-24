import type { ComponentType } from "react";
import {
  BackpackIcon,
  BarChartIcon,
  ChatBubbleIcon,
  CubeIcon,
  DashboardIcon,
  FileTextIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
  LightningBoltIcon,
  LockClosedIcon,
  MixerHorizontalIcon,
  PersonIcon,
  ReaderIcon,
  RocketIcon,
  MagicWandIcon,
  Link2Icon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import type { AppRole } from "@/types/auth";
import { ROUTES } from "@/config/routes";

export type NavigationIcon = ComponentType<{ className?: string }>;
export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIcon;
  roles?: AppRole[];
  description?: string;
};
export type NavigationGroup = { label: string; items: NavigationItem[] };

const all: AppRole[] = ["consumer", "prosumer", "client", "company", "admin", "super-admin"];
const operators: AppRole[] = ["prosumer", "company", "admin", "super-admin"];
const admins: AppRole[] = ["admin", "super-admin"];

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Overview", href: ROUTES.home, icon: DashboardIcon, roles: all },
      { label: "Digital Energy OS", href: ROUTES.digitalEnergy, icon: LightningBoltIcon, roles: all, description: "Physical energy, Digital Twin operations, Energy RWA, delivery and settlement" },
      { label: "Energy RWA", href: ROUTES.energyRwa, icon: CubeIcon, roles: all, description: "PET-20 verified Energy Positions and Solana/Sui representations" },
      { label: "Energy Operations", href: ROUTES.energyOperations, icon: MixerHorizontalIcon, roles: operators, description: "Delivery, meter reconciliation and financial settlement lifecycle" },
      { label: "Institutional Controls", href: ROUTES.digitalEnergyControls, icon: LockClosedIcon, roles: ["company", "admin", "super-admin"], description: "Maker-checker settlement approvals and transactional event reliability" },
      { label: "Operational Twin", href: ROUTES.digitalEnergyTwin, icon: CubeIcon, roles: operators, description: "Telemetry freshness and physical asset operating state" },
      { label: "Asset Graph", href: ROUTES.assetGraph, icon: Link2Icon, roles: all, description: "Site, batch, Energy Position and chain-representation relationships" },
      { label: "Proof of Energy", href: ROUTES.proofOfEnergy, icon: Link2Icon, roles: all },
      { label: "Smart Grid", href: ROUTES.smartGridMap, icon: GlobeIcon, roles: operators },
      { label: "Analytics", href: ROUTES.analytics, icon: BarChartIcon, roles: operators },
    ],
  },
  {
    label: "Copilot",
    items: [
      { label: "PowerChain Copilot", href: ROUTES.copilot, icon: MagicWandIcon, roles: all, description: "Unified Renewable RWA operating intelligence" },
      { label: "Action Center", href: ROUTES.copilotActionCenter, icon: LockClosedIcon, roles: all, description: "Review findings, drafts and approval-required actions" },
      { label: "Architecture", href: ROUTES.copilotArchitecture, icon: Link2Icon, roles: all, description: "Copilot, RWA Orchestrator, agents, skills and human-control architecture" },
      { label: "Agents", href: ROUTES.copilotAgents, icon: PersonIcon, roles: all, description: "Renewable RWA specialist workforce" },
      { label: "Agent Builder", href: ROUTES.copilotAgentBuilder, icon: GearIcon, roles: ["company", "admin", "super-admin"], description: "Create scoped custom agent drafts without autonomous financial execution" },
      { label: "Skills", href: ROUTES.copilotSkills, icon: CubeIcon, roles: all, description: "Reusable analysis, verification, capital and operations capabilities" },
      { label: "Prompt Library", href: ROUTES.copilotPrompts, icon: ChatBubbleIcon, roles: all },
      { label: "AI Settings", href: ROUTES.copilotSettings, icon: GearIcon, roles: all },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products Overview", href: ROUTES.products, icon: RocketIcon, roles: all, description: "PowerChain product portfolio" },
      { label: "Local Energy OS", href: ROUTES.localEnergy, icon: LightningBoltIcon, roles: all, description: "Communities, P2P market, grid flexibility, devices and local settlement" },
      { label: "Local Market", href: ROUTES.localEnergyMarketplace, icon: GlobeIcon, roles: all, description: "Grid-aware prosumer offers and shared energy assets" },
      { label: "Marketplace", href: ROUTES.marketplace, icon: GlobeIcon, roles: all },
      { label: "Device Products", href: ROUTES.deviceProducts, icon: BackpackIcon, roles: all },
      { label: "Infrastructure", href: ROUTES.blockchain, icon: GlobeIcon, roles: operators },
      { label: "Intelligence Cloud", href: ROUTES.platform, icon: GlobeIcon, roles: all },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Exchange", href: ROUTES.exchange, icon: BarChartIcon, roles: all },
      { label: "Carbon Exchange", href: ROUTES.carbonExchange, icon: GlobeIcon, roles: all },
      { label: "Certification", href: ROUTES.certification, icon: ReaderIcon, roles: all },
      { label: "Checkout", href: ROUTES.checkout, icon: BackpackIcon, roles: all },
      { label: "Crowdfunding", href: ROUTES.crowdfunding, icon: RocketIcon, roles: all },
      { label: "Projects", href: ROUTES.projects, icon: ReaderIcon, roles: all },
    ],
  },
  {
    label: "Assets & Edge",
    items: [
      { label: "Portfolio", href: ROUTES.portfolio, icon: CubeIcon, roles: ["prosumer", "client", "company", "admin", "super-admin"] },
      { label: "Renewables", href: ROUTES.renewables, icon: SewingPinIcon, roles: all },
      { label: "Digital Twins", href: ROUTES.digitalTwins, icon: CubeIcon, roles: all },
      { label: "Energy", href: ROUTES.energy, icon: LightningBoltIcon, roles: all },
      { label: "Smart Meters", href: ROUTES.smartMeters, icon: MixerHorizontalIcon, roles: operators },
      { label: "Hardware Fleet", href: ROUTES.hardwares, icon: CubeIcon, roles: operators },
      { label: "Firmware", href: ROUTES.firmwares, icon: GearIcon, roles: operators },
      { label: "DePIN & Helium", href: ROUTES.depin, icon: RocketIcon, roles: operators },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Wallet", href: ROUTES.wallet, icon: BackpackIcon, roles: all },
      { label: "Tokenization", href: ROUTES.tokenization, icon: CubeIcon, roles: all },
      { label: "PWRC Token", href: ROUTES.tokenPwrc, icon: CubeIcon, roles: all },
      { label: "Rewards & Leaderboard", href: ROUTES.leaderboard, icon: BarChartIcon, roles: all },
      { label: "Governance", href: ROUTES.governance, icon: CubeIcon, roles: all },
      { label: "Billing", href: ROUTES.billing, icon: FileTextIcon, roles: all },
      { label: "Pricing", href: ROUTES.pricing, icon: FileTextIcon, roles: all },
      { label: "CRM", href: ROUTES.crm, icon: PersonIcon, roles: ["company", "admin", "super-admin"] },
      { label: "Case Studies", href: ROUTES.caseStudies, icon: HomeIcon, roles: all },
    ],
  },
  {
    label: "References",
    items: [
      { label: "Documentation", href: ROUTES.docs, icon: ReaderIcon, roles: all },
      { label: "Architecture", href: ROUTES.architecture, icon: CubeIcon, roles: all },
      { label: "Engineering Framework", href: ROUTES.framework, icon: RocketIcon, roles: all },
      { label: "Technical Standards", href: ROUTES.standards, icon: FileTextIcon, roles: all },
      { label: "Protocols", href: ROUTES.protocols, icon: Link2Icon, roles: all },
      { label: "Legal & Policies", href: ROUTES.docsLegal, icon: FileTextIcon, roles: all },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Participants", href: ROUTES.participants, icon: PersonIcon, roles: ["company", "admin", "super-admin"] },
      { label: "Users", href: ROUTES.users, icon: PersonIcon, roles: admins },
      { label: "Organization", href: ROUTES.organization, icon: CubeIcon, roles: admins },
      { label: "Settings", href: ROUTES.profile, icon: GearIcon, roles: all },
    ],
  },
];
