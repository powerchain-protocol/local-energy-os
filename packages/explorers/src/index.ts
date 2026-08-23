export type SolanaExplorerNetwork = "mainnet-beta" | "devnet" | "testnet";
export type SuiExplorerNetwork = "mainnet" | "testnet" | "devnet";

function enc(value: string): string {
  if (!value.trim()) throw new Error("EXPLORER_IDENTIFIER_REQUIRED");
  return encodeURIComponent(value.trim());
}

function solscanCluster(network: SolanaExplorerNetwork): string {
  return network === "mainnet-beta" ? "" : `?cluster=${network}`;
}

export const solscan = {
  transaction(signature: string, network: SolanaExplorerNetwork = "mainnet-beta") {
    return `https://solscan.io/tx/${enc(signature)}${solscanCluster(network)}`;
  },
  account(address: string, network: SolanaExplorerNetwork = "mainnet-beta") {
    return `https://solscan.io/account/${enc(address)}${solscanCluster(network)}`;
  },
  token(mint: string, network: SolanaExplorerNetwork = "mainnet-beta") {
    return `https://solscan.io/token/${enc(mint)}${solscanCluster(network)}`;
  },
};

export const suiscan = {
  transaction(digest: string, network: SuiExplorerNetwork = "mainnet") {
    return `https://suiscan.xyz/${network}/tx/${enc(digest)}`;
  },
  object(objectId: string, network: SuiExplorerNetwork = "mainnet") {
    return `https://suiscan.xyz/${network}/object/${enc(objectId)}/tx-blocks`;
  },
  account(address: string, network: SuiExplorerNetwork = "mainnet") {
    return `https://suiscan.xyz/${network}/account/${enc(address)}/portfolio`;
  },
  coin(coinType: string, network: SuiExplorerNetwork = "mainnet") {
    return `https://suiscan.xyz/${network}/coin/${enc(coinType)}/txs`;
  },
};

export interface ExplorerReference {
  network: "SOLANA" | "SUI";
  kind: "TRANSACTION" | "ACCOUNT" | "TOKEN" | "OBJECT" | "COIN";
  reference: string;
  url: string;
}
