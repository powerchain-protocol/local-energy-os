export type BridgeState =
  | "CREATED"
  | "SOURCE_LOCKED"
  | "ATTESTED"
  | "DESTINATION_MINTED"
  | "RETURN_BURNED"
  | "SOURCE_RELEASED"
  | "FAILED";

export type PowerChainNetwork = "SOLANA" | "SUI";
