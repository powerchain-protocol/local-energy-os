export type ContractDomain = "proof-of-energy" | "digital-twin" | "gridllm" | "pwrc-solana";
export interface ContractDefinition { id: string; domain: ContractDomain; version: string; normativePath: string; implementationPath?: string; }
export const contractRegistry: ContractDefinition[] = [
  { id: "PCC-PoE-001", domain: "proof-of-energy", version: "1.0.0", normativePath: "docs/contracts/m/proof-of-energy/README.md", implementationPath: "programs/src/proof_of_energy.rs" },
  { id: "PCC-DT-001", domain: "digital-twin", version: "1.0.0", normativePath: "docs/contracts/m/digital-twin/README.md", implementationPath: "programs/src/digital_twin.rs" },
  { id: "PCC-AI-001", domain: "gridllm", version: "1.0.0", normativePath: "docs/contracts/m/gridllm/README.md", implementationPath: "programs/src/gridllm.rs" },
  { id: "PCC-BRIDGE-001", domain: "pwrc-solana", version: "1.0.0", normativePath: "docs/contracts/m/pwrc-solana/README.md", implementationPath: "programs/pwrc-bridge" }
];
export function requireContract(id: string): ContractDefinition { const contract = contractRegistry.find(item => item.id === id); if (!contract) throw new Error(`Unknown PowerChain contract: ${id}`); return contract; }
