import { jsonRpc } from "./rpc";
export interface SuiClientConfig { network: "devnet" | "testnet" | "mainnet" | "localnet"; rpcUrl: string; }
export class SuiRpcClient {
  constructor(readonly config: SuiClientConfig) {}
  call<T>(method: string, params: unknown[] = [], signal?: AbortSignal) { return jsonRpc<T>(this.config.rpcUrl, method, params, signal); }
  getLatestCheckpointSequenceNumber(signal?: AbortSignal) { return this.call<string>("sui_getLatestCheckpointSequenceNumber", [], signal); }
  getBalance(owner: string, coinType?: string, signal?: AbortSignal) { return this.call<unknown>("suix_getBalance", coinType ? [owner, coinType] : [owner], signal); }
}
