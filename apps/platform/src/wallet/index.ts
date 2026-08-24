export interface WalletPosition { mint: string; symbol: string; amount: number; decimals: number; usdValue?: number; }
export function formatWalletAddress(address: string, edge = 4): string { return address.length <= edge * 2 + 3 ? address : `${address.slice(0,edge)}…${address.slice(-edge)}`; }
