export type CctpTransferState =
  | "CREATED" | "QUOTED" | "BURN_SUBMITTED" | "BURN_CONFIRMED"
  | "ATTESTATION_PENDING" | "ATTESTED" | "MINT_SUBMITTED" | "COMPLETED"
  | "FAILED" | "REQUIRES_REVIEW";
export interface CctpTransfer {
  id: string;
  sourceNetwork: string;
  destinationNetwork: string;
  amountBaseUnits: bigint;
  asset: "USDC";
  state: CctpTransferState;
  burnReference?: string;
  attestation?: string;
  mintReference?: string;
}
