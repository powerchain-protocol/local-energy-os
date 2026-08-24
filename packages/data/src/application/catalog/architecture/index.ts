import type { ArchitectureLayer, StandardEntry } from "@/types/architecture";

export const architectureLayers: ArchitectureLayer[] = [
  { id: "business", title: "Business Architecture", concern: "Actors, outcomes and policies", contract: "Business Contract", owner: "Architecture Board", outputs: ["Business capabilities", "Actors", "Policy outcomes"], qualityObjectives: ["Clarity", "Traceability"] },
  { id: "capability", title: "Capability Architecture", concern: "Stable platform capabilities", contract: "Capability Contract", owner: "Architecture Board", outputs: ["Capability map", "Dependencies", "Ownership"], qualityObjectives: ["Composability", "Coverage"] },
  { id: "information", title: "Information Architecture", concern: "Canonical semantics and lifecycle", contract: "Information Contract", owner: "Standards Council", outputs: ["Reference models", "Schemas", "Lifecycle rules"], qualityObjectives: ["Semantic consistency", "Interoperability"] },
  { id: "protocol", title: "Protocol Architecture", concern: "Messages, APIs, events and state transitions", contract: "Protocol Contract", owner: "Standards Council", outputs: ["OpenAPI", "AsyncAPI", "CloudEvents", "State machines"], qualityObjectives: ["Compatibility", "Determinism"] },
  { id: "execution", title: "Execution Architecture", concern: "Runtime behavior and transaction semantics", contract: "Execution Contract", owner: "Engineering Council", outputs: ["Runtime profiles", "Security boundaries", "Transaction rules"], qualityObjectives: ["Reliability", "Performance"] },
  { id: "integration", title: "Integration Architecture", concern: "Adapters, federation and interoperability", contract: "Integration Contract", owner: "Engineering Council", outputs: ["Adapters", "SDK contracts", "Identity federation"], qualityObjectives: ["Portability", "Interoperability"] },
  { id: "deployment", title: "Deployment Architecture", concern: "Runtime environments and resilience", contract: "Deployment Contract", owner: "Engineering Council", outputs: ["Deployment profiles", "Scaling rules", "Resilience patterns"], qualityObjectives: ["Availability", "Scalability"] },
  { id: "operations", title: "Operations Architecture", concern: "SLOs, lifecycle and recovery", contract: "Operations Contract", owner: "Conformance Council", outputs: ["SLOs", "Observability", "Backup and recovery", "Upgrade policy"], qualityObjectives: ["Observability", "Maintainability"] },
];

export const standardsCatalog: StandardEntry[] = [
  { id: "PPA-000", title: "Architecture Principles", status: "draft", layer: "business" },
  { id: "PPA-100", title: "Identity Foundation", status: "draft", layer: "information" },
  { id: "PPA-110", title: "Organizations and Tenancy", status: "draft", layer: "information" },
  { id: "PPA-120", title: "RBAC and ABAC", status: "draft", layer: "protocol" },
  { id: "PPA-200", title: "Energy Model", status: "draft", layer: "information" },
  { id: "PPA-210", title: "Proof of Energy", status: "draft", layer: "execution" },
  { id: "PPA-220", title: "Digital Twins", status: "draft", layer: "information" },
  { id: "PPA-230", title: "Smart Meter and Edge", status: "draft", layer: "protocol" },
  { id: "PPA-300", title: "Marketplace", status: "draft", layer: "execution" },
  { id: "PPA-310", title: "Settlement", status: "draft", layer: "execution" },
  { id: "PPA-500", title: "AI and Agent Runtime", status: "planned", layer: "execution" },
  { id: "PPA-600", title: "Blockchain Interoperability", status: "draft", layer: "integration" },
  { id: "PPA-700", title: "Security", status: "draft", layer: "deployment" },
  { id: "PPA-800", title: "Conformance", status: "planned", layer: "operations" },
];
