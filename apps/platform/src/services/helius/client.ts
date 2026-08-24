import { resolveServerSolanaRpc } from "@/config/server-networks";
import type { SolanaCluster } from "@/config/networks";

export interface HeliusClientOptions {
  cluster: SolanaCluster;
  apiKey?: string;
  rpcUrl?: string;
  timeoutMs?: number;
}

export class HeliusClient {
  constructor(private readonly options: HeliusClientOptions) {}

  private endpoint(): string {
    if (this.options.rpcUrl) return this.options.rpcUrl;
    if (this.options.apiKey && this.options.cluster !== "custom") {
      const network = this.options.cluster === "devnet" ? "devnet" : "mainnet";
      return `https://${network}.helius-rpc.com/?api-key=${encodeURIComponent(this.options.apiKey)}`;
    }
    return resolveServerSolanaRpc(this.options.cluster);
  }

  async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 10_000);
    try {
      const response = await fetch(this.endpoint(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`RPC request failed (${response.status})`);
      const payload = (await response.json()) as { result?: T; error?: { message?: string } };
      if (payload.error) throw new Error(payload.error.message || "RPC error");
      if (payload.result === undefined) throw new Error("RPC response did not include a result");
      return payload.result;
    } finally {
      clearTimeout(timeout);
    }
  }
}
