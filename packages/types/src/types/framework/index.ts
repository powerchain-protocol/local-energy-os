export type FrameworkProgramId = "PAF" | "PPS" | "PEP" | "PRI";

export type FrameworkProgram = {
  id: FrameworkProgramId;
  title: string;
  purpose: string;
  owns: string[];
  cadence: string;
  compatibility: string;
};

export type ArchitectureProfile = {
  id: string;
  title: string;
  audience: string;
  requiredCapabilities: string[];
  standards: string[];
  securityControls: string[];
  conformanceProfile: string;
};

export type CapabilityOwner = {
  capability: string;
  domain: string;
  owner: string;
  lifecycle: "active" | "incubating" | "deprecated";
};

export type EcosystemMetric = {
  id: string;
  title: string;
  value: number;
  unit: "%" | "days" | "count";
  target: number;
  direction: "higher" | "lower";
  updatedAt: string;
};

export type FrameworkNode = {
  id: string;
  kind: "principle" | "capability" | "reference-model" | "standard" | "engineering-asset" | "implementation" | "test" | "profile";
  title: string;
  owner: string;
  version: string;
  status: string;
  dependencies: string[];
};
