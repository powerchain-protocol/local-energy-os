export interface IndexedChainReference {
  network: "SOLANA" | "SUI";
  reference: string;
  kind:
    | "ENERGY_BATCH"
    | "ENERGY_POSITION"
    | "SETTLEMENT"
    | "PWRC"
    | "WPWRC"
    | "PROVENANCE";
  observedAt: Date;
}

export function localEnergyIndexKey(reference: IndexedChainReference) {
  return `${reference.network}:${reference.kind}:${reference.reference}`;
}
