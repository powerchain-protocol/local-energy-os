export async function rpcRequest<T>(method: string, params: unknown[] = []): Promise<T> {
  const endpoint = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
    next: { revalidate: 15 },
  });
  if (!response.ok) throw new Error(`RPC request failed: ${response.status}`);
  const payload = (await response.json()) as { result?: T; error?: { message: string } };
  if (payload.error) throw new Error(payload.error.message);
  return payload.result as T;
}
