import type { WalletProviderAdapter } from "@/types/wallet/provider";

export type SolanaInjectedProvider = {
  publicKey?: { toString(): string };
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  connect(): Promise<{ publicKey?: { toString(): string } }>;
  disconnect?(): Promise<void>;
};
type SuiAccount = { address: string };
type SuiInjectedProvider = { connect(input?: { permissions?: string[] }): Promise<{ accounts?: SuiAccount[] }>; disconnect?(): Promise<void> };
type Eip1193Provider = { request(input: { method: string; params?: unknown[] }): Promise<unknown> };

declare global { interface Window { solana?: SolanaInjectedProvider; phantom?: { solana?: SolanaInjectedProvider }; solflare?: SolanaInjectedProvider; backpack?: { solana?: SolanaInjectedProvider }; suiWallet?: SuiInjectedProvider; ethereum?: Eip1193Provider; walletConnect?: Eip1193Provider } }

function phantom(){return typeof window === "undefined" ? undefined : window.phantom?.solana ?? (window.solana?.isPhantom ? window.solana : undefined)}
function solflare(){return typeof window === "undefined" ? undefined : window.solflare ?? (window.solana?.isSolflare ? window.solana : undefined)}
function backpack(){return typeof window === "undefined" ? undefined : window.backpack?.solana ?? (window.solana?.isBackpack ? window.solana : undefined)}
function solanaAdapter(id:string,name:string,provider:()=>SolanaInjectedProvider|undefined):WalletProviderAdapter{return{id,name,network:"solana",description:`Connect ${name} to authorize Solana transactions.`,detect:()=>Boolean(provider()),async connect(){const wallet=provider();if(!wallet)throw new Error(`${name} was not detected. Install or unlock the wallet and try again.`);const result=await wallet.connect();const address=result.publicKey?.toString()??wallet.publicKey?.toString();if(!address)throw new Error(`${name} did not return a public address.`);return address},async disconnect(){await provider()?.disconnect?.()}}}

export const walletProviderAdapters: WalletProviderAdapter[] = [
  solanaAdapter("phantom","Phantom",phantom),
  solanaAdapter("solflare","Solflare",solflare),
  solanaAdapter("backpack","Backpack",backpack),
  {id:"sui-wallet",name:"Sui Wallet",network:"sui",description:"Connect a Sui-compatible wallet.",detect:()=>typeof window!=="undefined"&&Boolean(window.suiWallet),async connect(){const provider=window.suiWallet;if(!provider)throw new Error("No Sui wallet was detected.");const result=await provider.connect({permissions:["viewAccount","suggestTransactions"]});const address=result.accounts?.[0]?.address;if(!address)throw new Error("The Sui wallet did not return an address.");return address},async disconnect(){await window.suiWallet?.disconnect?.()}},
  {id:"browser-evm",name:"Browser EVM Wallet",network:"evm",description:"Connect an EIP-1193 browser wallet.",detect:()=>typeof window!=="undefined"&&Boolean(window.ethereum),async connect(){const provider=window.ethereum;if(!provider)throw new Error("No EVM wallet was detected.");const accounts=await provider.request({method:"eth_requestAccounts"});const address=Array.isArray(accounts)?accounts[0]:undefined;if(typeof address!=="string")throw new Error("The EVM wallet did not return an address.");return address}},
  {id:"walletconnect",name:"WalletConnect",network:"evm",description:"WalletConnect requires an organization project ID and client configuration.",detect:()=>typeof window!=="undefined"&&Boolean(window.walletConnect),async connect(){const provider=window.walletConnect;if(!provider)throw new Error("WalletConnect is not configured. Add a WalletConnect project ID in Settings → Integrations.");const accounts=await provider.request({method:"eth_requestAccounts"});const address=Array.isArray(accounts)?accounts[0]:undefined;if(typeof address!=="string")throw new Error("WalletConnect did not return an address.");return address}},
];
export function getWalletProviderAdapter(id:string){return walletProviderAdapters.find((adapter)=>adapter.id===id)}
