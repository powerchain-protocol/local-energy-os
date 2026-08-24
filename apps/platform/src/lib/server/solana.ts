import { rpcRequest } from "./rpc";

export type SolanaHealth = { "solana-core": string; "feature-set": number };
export const getSolanaHealth = () => rpcRequest<string>("getHealth");
export const getSolanaVersion = () => rpcRequest<SolanaHealth>("getVersion");
export const getBalance = (address: string) => rpcRequest<{ value: number }>("getBalance", [address]);
