export type PwrcBridgeDirection="powerchain-to-solana"|"solana-to-powerchain";
export interface PwrcBridgeQuote{direction:PwrcBridgeDirection;amount:string;fee:string;receiveAmount:string;sourceTicker:"PWRC";destinationTicker:"PWRC";expiresAt:string;}
export interface PwrcBridgeTransfer{id:string;direction:PwrcBridgeDirection;amount:string;sourceAddress:string;destinationAddress:string;status:"requires_signature"|"escrow_pending"|"verifying"|"minting"|"releasing"|"completed"|"failed";sourceTransaction?:string;destinationTransaction?:string;createdAt:string;}
export interface PwrcSupplyState{nativeLocked:string;solanaCirculating:string;availableToMint:string;invariantSatisfied:boolean;}
