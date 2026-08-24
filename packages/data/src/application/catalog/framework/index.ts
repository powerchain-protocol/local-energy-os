import type { ArchitectureProfile, CapabilityOwner, EcosystemMetric, FrameworkNode, FrameworkProgram } from "@/types/framework";

export const frameworkPrograms: FrameworkProgram[] = [
  { id: "PAF", title: "PowerChain Architecture Framework", purpose: "Architecture principles, capability maps, reference models, viewpoints, contracts and quality models.", owns: ["Architecture principles", "Capability model", "Reference models", "Architecture contracts", "ADRs"], cadence: "Annual major; quarterly clarifications", compatibility: "Slow-moving and implementation-independent" },
  { id: "PPS", title: "PowerChain Protocol Standards", purpose: "Normative, externally observable behavior for interoperable digital-energy systems.", owns: ["Proof of Energy", "Identity", "Telemetry", "Marketplace", "Settlement", "Cross-chain execution", "Security"], cadence: "Semiannual standards train", compatibility: "Published backward-compatibility and deprecation policy" },
  { id: "PEP", title: "PowerChain Engineering Program", purpose: "Executable specifications, tooling, test assets, SDKs and publication automation.", owns: ["OpenAPI", "AsyncAPI", "JSON Schema", "CloudEvents", "State machines", "Test vectors", "Benchmarks", "SDKs"], cadence: "Monthly engineering release", compatibility: "Versioned alongside the standards they implement" },
  { id: "PRI", title: "Platform Reference Implementation", purpose: "A conformant implementation demonstrating the framework across cloud, edge, IoT, AI and blockchain.", owns: ["PowerChain Platform", "Reference services", "UI workspaces", "Solana programs", "Sui modules", "Deployment manifests"], cadence: "Continuous delivery with LTS releases", compatibility: "Must pass declared conformance profiles" },
];

export const architectureProfiles: ArchitectureProfile[] = [
  { id: "residential-energy", title: "Residential Energy", audience: "Households, prosumers and energy communities", requiredCapabilities: ["Smart metering", "Local energy trading", "Settlement", "Carbon reporting"], standards: ["PTSP-100", "PTSP-210", "PTSP-220", "PTSP-300", "PTSP-310"], securityControls: ["Consumer identity", "Device attestation", "Payment authorization"], conformanceProfile: "Core + Edge" },
  { id: "commercial-buildings", title: "Commercial Buildings", audience: "Offices, campuses, retail and property portfolios", requiredCapabilities: ["Portfolio management", "Digital twins", "Forecasting", "Marketplace", "ESG"], standards: ["PTSP-210", "PTSP-230", "PTSP-300", "PTSP-400", "PTSP-500"], securityControls: ["Tenant isolation", "RBAC/ABAC", "Audit retention"], conformanceProfile: "Commercial + Cloud" },
  { id: "industrial-manufacturing", title: "Industrial Manufacturing", audience: "Factories, logistics and data centers", requiredCapabilities: ["Industrial telemetry", "Demand response", "Predictive maintenance", "Treasury"], standards: ["PTSP-220", "PTSP-240", "PTSP-310", "PTSP-500", "PTSP-700"], securityControls: ["OT segmentation", "Signed commands", "Dual approval"], conformanceProfile: "Commercial + Utility" },
  { id: "utility-operations", title: "Utility Operations", audience: "DSOs, TSOs and municipal utilities", requiredCapabilities: ["Grid operations", "Meter fleet", "Flexibility", "Settlement", "Reliability"], standards: ["PTSP-210", "PTSP-220", "PTSP-240", "PTSP-300", "PTSP-310", "PTSP-700"], securityControls: ["Critical infrastructure controls", "MFA", "Immutable audit"], conformanceProfile: "Utility + Cloud" },
  { id: "edge-gateway", title: "Edge Gateway", audience: "Meters, gateways and constrained devices", requiredCapabilities: ["Protocol normalization", "Offline queue", "Encryption", "Device identity"], standards: ["PTSP-100", "PTSP-140", "PTSP-220", "PTSP-240", "PTSP-700"], securityControls: ["Secure boot", "Hardware keys", "Certificate rotation"], conformanceProfile: "Edge" },
  { id: "cloud-platform", title: "Cloud Platform", audience: "Multi-region SaaS and managed services", requiredCapabilities: ["Multi-tenancy", "Event fabric", "AI runtime", "Observability", "Disaster recovery"], standards: ["PTSP-100", "PTSP-140", "PTSP-500", "PTSP-700", "PTSP-800"], securityControls: ["Zero trust", "Secrets management", "Continuous assurance"], conformanceProfile: "Cloud" },
  { id: "research-sandbox", title: "Research Sandbox", audience: "Universities and experimental deployments", requiredCapabilities: ["Experimental protocols", "Synthetic datasets", "Benchmarking"], standards: ["PTSP-000", "PTSP-020", "PTSP-500", "PTSP-800"], securityControls: ["Isolated environment", "Data minimization"], conformanceProfile: "Research" },
];

export const capabilityOwners: CapabilityOwner[] = [
  { capability: "Renewable Verification", domain: "Energy", owner: "Energy Working Group", lifecycle: "active" },
  { capability: "Smart Meter Management", domain: "IoT", owner: "Edge Systems Working Group", lifecycle: "active" },
  { capability: "Digital Twin Synchronization", domain: "Platform", owner: "Architecture Board", lifecycle: "active" },
  { capability: "AI Optimization", domain: "AI", owner: "AI Systems Working Group", lifecycle: "active" },
  { capability: "Treasury Settlement", domain: "Finance", owner: "Settlement Working Group", lifecycle: "active" },
  { capability: "Cross-chain Execution", domain: "Blockchain", owner: "Protocol Working Group", lifecycle: "incubating" },
];

export const ecosystemMetrics: EcosystemMetric[] = [
  { id: "traceability", title: "Requirements with end-to-end traceability", value: 94, unit: "%", target: 98, direction: "higher", updatedAt: "2026-08-01" },
  { id: "model-tests", title: "Reference models covered by tests", value: 91, unit: "%", target: 95, direction: "higher", updatedAt: "2026-08-01" },
  { id: "api-compatibility", title: "API backward compatibility", value: 99, unit: "%", target: 99, direction: "higher", updatedAt: "2026-08-01" },
  { id: "schema-compatibility", title: "Schema backward compatibility", value: 97, unit: "%", target: 99, direction: "higher", updatedAt: "2026-08-01" },
  { id: "documentation-freshness", title: "Documentation freshness", value: 96, unit: "%", target: 95, direction: "higher", updatedAt: "2026-08-01" },
  { id: "security-resolution", title: "Median security advisory resolution", value: 5, unit: "days", target: 7, direction: "lower", updatedAt: "2026-08-01" },
];

export const frameworkGraph: FrameworkNode[] = [
  { id: "PRIN-001", kind: "principle", title: "Proof-backed renewable value", owner: "Architecture Board", version: "1.0", status: "approved", dependencies: [] },
  { id: "CAP-ENERGY-VERIFY", kind: "capability", title: "Renewable Verification", owner: "Energy Working Group", version: "1.0", status: "active", dependencies: ["PRIN-001"] },
  { id: "RM-ENERGY-MEASUREMENT", kind: "reference-model", title: "Energy Measurement", owner: "Architecture Board", version: "3.0", status: "working-draft", dependencies: ["CAP-ENERGY-VERIFY"] },
  { id: "PTSP-210", kind: "standard", title: "Proof of Energy", owner: "Standards Council", version: "5.0", status: "candidate-standard", dependencies: ["RM-ENERGY-MEASUREMENT"] },
  { id: "ENG-POE-SCHEMA", kind: "engineering-asset", title: "Proof of Energy JSON Schema", owner: "Engineering Council", version: "5.0", status: "active", dependencies: ["PTSP-210"] },
  { id: "PRI-POE-SERVICE", kind: "implementation", title: "Proof of Energy Service", owner: "Platform Maintainers", version: "1.0", status: "active", dependencies: ["ENG-POE-SCHEMA"] },
  { id: "TEST-POE-001", kind: "test", title: "Exactly-once energy issuance", owner: "Conformance Council", version: "1.0", status: "active", dependencies: ["PRI-POE-SERVICE"] },
  { id: "PROFILE-UTILITY", kind: "profile", title: "Utility Profile", owner: "Conformance Council", version: "1.0", status: "working-draft", dependencies: ["TEST-POE-001"] },
];
