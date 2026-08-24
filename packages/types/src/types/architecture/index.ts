export type ArchitectureLayerId =
  | "business"
  | "capability"
  | "information"
  | "protocol"
  | "execution"
  | "integration"
  | "deployment"
  | "operations";

export type ArchitectureLayer = {
  id: ArchitectureLayerId;
  title: string;
  concern: string;
  contract: string;
  owner: string;
  outputs: string[];
  qualityObjectives: string[];
};

export type StandardEntry = {
  id: string;
  title: string;
  status: "draft" | "stable" | "planned";
  layer: ArchitectureLayerId;
};
