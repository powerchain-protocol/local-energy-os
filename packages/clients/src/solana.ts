import type { SolanaRuntimeConfig } from "@powerchain/config";
import { jsonRpc } from "./rpc";
export class SolanaRpcClient {
  constructor(readonly config: SolanaRuntimeConfig) {}
  call<T>(method: string, params: unknown[] = [], signal?: AbortSignal) { return jsonRpc<T>(this.config.rpcUrl, method, params, signal); }
  getHealth(signal?: AbortSignal) { return this.call<string>("getHealth", [], signal); }
  getSlot(signal?: AbortSignal) { return this.call<number>("getSlot", [{ commitment: "confirmed" }], signal); }
  getBalance(address: string, signal?: AbortSignal) { return this.call<{ value: number }>("getBalance", [address, { commitment: "confirmed" }], signal); }
}
