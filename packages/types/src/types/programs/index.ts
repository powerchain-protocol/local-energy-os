export type ProgramNetwork = "localnet" | "devnet" | "mainnet-beta";

export interface PowerChainProgramDefinition {
  id: string;
  name: string;
  domain: string;
  networks: ProgramNetwork[];
  status: "draft" | "test" | "audited" | "deployed";
  invariant: string;
}
