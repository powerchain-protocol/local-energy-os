export type PublicationClassification =
  | "normative-standard"
  | "reference-model"
  | "reference-architecture"
  | "engineering-guide"
  | "informative-report"
  | "governance-document";

export type PublicationStatus =
  | "proposal"
  | "working-draft"
  | "public-review"
  | "candidate-standard"
  | "approved-standard"
  | "long-term-support"
  | "deprecated"
  | "retired";

export type StandardsPublication = {
  id: string;
  title: string;
  portfolio: "foundation" | "core" | "domain" | "reference" | "engineering" | "governance" | "conformance";
  classification: PublicationClassification;
  status: PublicationStatus;
  version: string;
  owner: string;
  summary: string;
  dependencies: string[];
  profiles: string[];
};

export type ConformanceProfile = {
  id: "core" | "utility" | "commercial" | "edge" | "cloud" | "research";
  title: string;
  audience: string;
  requiredStandards: string[];
  optionalCapabilities: string[];
};

export type GovernanceBody = {
  id: string;
  title: string;
  mandate: string;
  owns: string[];
};
