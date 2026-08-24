export type SuiNetwork = "mainnet" | "testnet" | "devnet" | "localnet";

const DEFAULT_RPC: Record<SuiNetwork, string> = {
  mainnet: "https://fullnode.mainnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
  localnet: "http://127.0.0.1:9000",
};

export function getSuiRpcUrl(): string {
  const network = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as SuiNetwork;
  return process.env.SUI_RPC_URL ?? DEFAULT_RPC[network] ?? DEFAULT_RPC.testnet;
}

export async function suiRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(getSuiRpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Sui RPC failed with ${response.status}`);
  const body = (await response.json()) as { result?: T; error?: { message?: string } };
  if (body.error) throw new Error(body.error.message ?? "Sui RPC request failed");
  if (body.result === undefined) throw new Error("Sui RPC returned no result");
  return body.result;
}

export function getSuiBalances(owner: string) {
  return suiRpc<unknown[]>("suix_getAllBalances", [owner]);
}
