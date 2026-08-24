import { solscan, suiscan } from "@powerchain/explorers";
export const LOCAL_ENERGY_EXPLORERS = {
  SOLANA: { provider:"Solscan", transaction:solscan.transaction, account:solscan.account, token:solscan.token },
  SUI: { provider:"Suiscan", transaction:suiscan.transaction, account:suiscan.account, object:suiscan.object, coin:suiscan.coin },
} as const;
export interface EnergyRwaExplorerRecord { energyRwaId:string; energyPositionId:string; metadataDigest:string; representations:Array<{network:"SOLANA"|"SUI";reference:string;explorerUrl:string;amountWh:string;state:string}>; }
