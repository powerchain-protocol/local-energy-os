export const POWERCHAIN_NAME = "PowerChain" as const;
export const POWERCHAIN_PRODUCT = "Local Energy OS" as const;
export const POWERCHAIN_VERSION = "1.0.0" as const;

export const POWERCHAIN_ASSETS = {
  PWRC: { symbol: "PWRC", chain: "SOLANA", kind: "NETWORK" },
  wPWRC: { symbol: "wPWRC", chain: "SUI", kind: "BRIDGED_NETWORK", backing: "PWRC" },
  KWH_RWA: { symbol: "kWh RWA", unit: "KWH", kind: "ENERGY_RWA" },
  MWH_RWA: { symbol: "MWh RWA", unit: "MWH", kind: "ENERGY_RWA" }
} as const;

export type DocSection = {
  heading: string;
  body: string[];
  code?: string;
};

export type DocPage = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  sections: DocSection[];
};

export const DOCS_NAVIGATION = [
  { group: "Platform", items: [
    { slug: "architecture", label: "Architecture" },
    { slug: "saas", label: "SaaS Platform" },
    { slug: "api", label: "API v1" },
    { slug: "authentication", label: "Authentication" },
    { slug: "security", label: "Security" }
  ]},
  { group: "Energy", items: [
    { slug: "ems", label: "Energy Management System" },
    { slug: "energy-rwa", label: "Energy RWA" },
    { slug: "pwrc", label: "PWRC & wPWRC" },
    { slug: "protocols", label: "Protocols" },
    { slug: "data-plane", label: "Data Plane" }
  ]},
  { group: "Engineering", items: [
    { slug: "shared", label: "Shared Package" },
    { slug: "storage", label: "Storage" },
    { slug: "store", label: "Application Store" }
  ]}
] as const;

export const DOC_PAGES: DocPage[] = [
  {
    slug: "architecture",
    eyebrow: "System Design",
    title: "Canonical architecture",
    description: "The production boundaries connecting participants, SaaS, physical energy, Energy RWAs, markets, settlement, Solana and Sui.",
    sections: [
      { heading: "Operating model", body: ["Physical electricity remains authoritative. PowerChain verifies measurements before energy becomes economically active.", "SaaS entitlements control product access while authorization, policy and physical-supply invariants remain authoritative on the server."], code: "Participants → Local Energy OS → API v1 → Energy Ledger → Market/Grid → Settlement → Solana/Sui" },
      { heading: "Ledger separation", body: ["Physical energy, market commitments, settlement, financial accounting, rewards and audit records are kept conceptually separate.", "A blockchain confirmation never substitutes for meter reconciliation or double-entry financial accounting."] }
    ]
  },
  {
    slug: "ems",
    eyebrow: "Energy Operations",
    title: "Energy Management System",
    description: "Physical generation, demand, storage, grid exchange, forecasts, flexibility and safe dispatch with explicit units, timestamps and freshness.",
    sections: [
      { heading: "Operational hierarchy", body: ["The EMS presents live physical state before forecasts, flexibility, dispatch, verified energy evidence or settlement details.", "If source, unit, timestamp or freshness cannot be established, the value remains unavailable rather than inferred."], code: "Observe → Forecast → Simulate → Policy → Approve → Dispatch → Verify → Settle" },
      { heading: "Power vs energy", body: ["Live operating state uses kW/MW. Interval and settlement-grade physical energy uses integer Wh with kWh/MWh/GWh presentation units.", "Verified Energy Batches must never be converted into synthetic live power readings."], code: "Live state: kW / MW\nPhysical energy: Wh / kWh / MWh\nStorage: SOC % + power + energy" },
      { heading: "Dispatch safety", body: ["Physical dispatch requires current state, simulation, policy evaluation, approval, bounded execution and post-action telemetry verification."] }
    ]
  },
  {
    slug: "energy-rwa",
    eyebrow: "Real-World Assets",
    title: "kWh and MWh Energy RWA",
    description: "Physically backed energy positions using canonical integer Wh accounting and anti-overissuance controls.",
    sections: [
      { heading: "Canonical units", body: ["PowerChain stores physical quantities as integer watt-hours. kWh and MWh are denominations and market presentation units, not independent physical supplies."], code: "WH = 1\nKWH = 1,000 Wh\nMWH = 1,000,000 Wh\nGWH = 1,000,000,000 Wh" },
      { heading: "Supply invariant", body: ["Issued and reserved Energy RWA can never exceed verified backing after invalidations.", "The same constraint applies to API transactions, database writes, SVM programs, Sui Move objects and cross-chain representations."], code: "issuedWh + reservedWh <= verifiedWh - invalidatedWh" }
    ]
  },
  {
    slug: "pwrc",
    eyebrow: "Network Assets",
    title: "PWRC and wPWRC",
    description: "PWRC is native on Solana. wPWRC is its 1:1 bridged Sui representation and is economically separate from Energy RWA.",
    sections: [
      { heading: "Canonical authority", body: ["PWRC supply authority remains on Solana. wPWRC must remain fully backed by PWRC committed to the bridge."], code: "PWRC = Solana native\nwPWRC = Sui bridged representation\n1 wPWRC = 1 PWRC" },
      { heading: "Asset separation", body: ["PWRC rewards participation and protocol activity. It is not a kWh or MWh claim.", "USDC/EURC provide financial settlement while Energy RWA represents verified physical energy."] }
    ]
  },
  {
    slug: "saas",
    eyebrow: "Control Plane",
    title: "PowerChain SaaS",
    description: "Tenant, subscription, plan, app and feature entitlement resolution for multi-workspace energy deployments.",
    sections: [
      { heading: "Entitlement chain", body: ["The SaaS package resolves tenant subscription state into app and feature access without duplicating authorization logic in every application."], code: "Tenant → Subscription → Plan → Apps → Features" },
      { heading: "Deployment modes", body: ["The same control plane can support shared SaaS, dedicated databases, private cloud, regional deployments and on-premise installations."] }
    ]
  },
  {
    slug: "api",
    eyebrow: "Developer Platform",
    title: "API v1",
    description: "Context-aware APIs for participants, Energy Ledger, SaaS, grid operations and settlement.",
    sections: [
      { heading: "Request context", body: ["API calls propagate request, correlation, tenant, organization, workspace and operating-context identifiers."], code: "requestId • correlationId • tenantId • organizationId • workspaceId • contextType" },
      { heading: "Energy Ledger", body: ["Canonical resources include energy-proofs, energy-batches, energy-positions, energy-reservations and energy-retirements."] }
    ]
  },
  {
    slug: "protocols",
    eyebrow: "Interoperability",
    title: "Protocol registry",
    description: "Configuration-driven protocol boundaries for metering, grid systems, EV charging, machine payments, cross-chain settlement and oracles.",
    sections: [
      { heading: "Energy protocols", body: ["DLMS/COSEM, MQTT, OPC UA, Modbus, IEC 61850, OCPP, ISO 15118, OCPI, OpenADR and IEC CIM remain adapter boundaries rather than core-domain dependencies."] },
      { heading: "Digital infrastructure", body: ["Solana/SVM, Sui Move, x402, CCTP, Pyth and Chainlink are accessed through dedicated packages and capability configuration."] }
    ]
  },
  {
    slug: "shared",
    eyebrow: "Engineering",
    title: "Shared package",
    description: "Stable cross-domain constants, documentation metadata and non-business-specific helpers shared across applications.",
    sections: [
      { heading: "Ownership", body: ["@powerchain/shared is intentionally small. Business invariants remain inside their domain packages rather than becoming a generic shared dumping ground."] },
      { heading: "Allowed contents", body: ["Brand metadata, canonical version values, docs metadata, harmless formatting helpers and broadly reusable primitives belong here."] }
    ]
  },
  {
    slug: "storage",
    eyebrow: "Infrastructure",
    title: "Storage boundary",
    description: "A provider-neutral object-storage abstraction for evidence, exports, reports and integration payloads.",
    sections: [
      { heading: "Storage classes", body: ["Evidence objects, reports, exports and integration payloads use explicit namespaces and metadata.", "Raw telemetry should use purpose-built high-volume storage rather than being treated as generic application blobs."] },
      { heading: "Provider isolation", body: ["Domain services depend on the PowerChain ObjectStorage contract. S3-compatible, Supabase Storage or other providers can implement that contract without changing domain logic."] }
    ]
  },
  {
    slug: "store",
    eyebrow: "Frontend State",
    title: "Application store",
    description: "Small framework-neutral stores for cross-component client state such as operating context, filters and UI status.",
    sections: [
      { heading: "Server state stays server state", body: ["The client store must not become a second database. Energy balances, settlement states and authorization remain server-authoritative."] },
      { heading: "Energy context", body: ["The canonical context store carries household, community, company, client or grid-operator selection and is consumed through React useSyncExternalStore."] }
    ]
  },
  {
    slug: "authentication",
    eyebrow: "Identity",
    title: "Authentication and wallet ownership",
    description: "Persisted Solana challenges, exact-message verification, opaque sessions and organization membership authorization.",
    sections: [
      { heading: "Wallet sign-in", body: ["PowerChain stores the exact challenge message and verifies the wallet signature before atomically consuming the nonce."], code: "Challenge → Signature → Verify → Consume → Session" },
      { heading: "Authorization", body: ["Wallet ownership is not tenant authority. OrganizationMembership provides the role used by server-side policy."] }
    ]
  },
  {
    slug: "security",
    eyebrow: "Security",
    title: "Fail-closed economic operations",
    description: "Tenant scoping, runtime policy, idempotency, audit, event outbox and RLS defense in depth.",
    sections: [
      { heading: "Economic writes", body: ["Energy mutations require tenant scope, an authorized role, a safe runtime mode, validation and an Idempotency-Key."], code: "Auth → Tenant → Role → Policy → Domain invariant → Transaction" },
      { heading: "Defense in depth", body: ["API policy remains authoritative while PostgreSQL/Supabase RLS protects direct authenticated reads."] }
    ]
  },
  {
    slug: "data-plane",
    eyebrow: "Energy Data",
    title: "Metering and telemetry data plane",
    description: "Freshness, physical plausibility and the transition from raw telemetry into settlement-grade Energy Proofs.",
    sections: [
      { heading: "Pipeline", body: ["Telemetry is evidence, not authority. Freshness and meter plausibility checks precede Energy Proof creation."], code: "Meter → Telemetry → Plausibility → Interval → Energy Proof" },
      { heading: "Storage", body: ["High-frequency raw telemetry belongs in time-series/data-lake storage; PostgreSQL remains canonical for operational and economic state."] }
    ]
  },
];

export function getDocPage(slug: string): DocPage | undefined {
  return DOC_PAGES.find((page) => page.slug === slug);
}
