export type ProgramTarget = "devnet" | "mainnet-beta";

export interface ProgramNetworkConfig {
  target: ProgramTarget;
  clusterUrl: string;
  programId: string;
  commitment: "confirmed" | "finalized";
}

const fallbackProgramId = "11111111111111111111111111111111";

export const PROGRAM_NETWORKS: Record<ProgramTarget, ProgramNetworkConfig> = {
  devnet: {
    target: "devnet",
    clusterUrl: process.env.SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
    programId: process.env.POWERCHAIN_PROGRAM_ID_DEVNET ?? fallbackProgramId,
    commitment: "confirmed"
  },
  "mainnet-beta": {
    target: "mainnet-beta",
    clusterUrl: process.env.SOLANA_MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com",
    programId: process.env.POWERCHAIN_PROGRAM_ID_MAINNET ?? fallbackProgramId,
    commitment: "finalized"
  }
};

export function getProgramNetwork(target: ProgramTarget): ProgramNetworkConfig {
  return PROGRAM_NETWORKS[target];
}
