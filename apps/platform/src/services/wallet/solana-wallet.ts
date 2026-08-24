import type { WalletNetwork, WalletSnapshot } from "@/types/wallet";
import { publicKeySchema } from "@/types/validate";

const RPC_ENDPOINTS: Record<WalletNetwork, string> = {
  "solana-mainnet": process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  "solana-devnet": process.env.SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
};
async function rpc<T>(network: WalletNetwork, method: string, params: unknown[]): Promise<T> {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(RPC_ENDPOINTS[network], { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }), signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`Solana RPC ${response.status}`);
    const payload = await response.json() as { result?: T; error?: { message: string } };
    if (payload.error || payload.result === undefined) throw new Error(payload.error?.message ?? "Invalid RPC response");
    return payload.result;
  } finally { clearTimeout(timeout); }
}
export async function fetchWalletSnapshot(addressInput: string, network: WalletNetwork = "solana-mainnet"): Promise<WalletSnapshot> {
  const address = publicKeySchema.parse(addressInput);
  try {
    const [balance, signatures, tokenAccounts] = await Promise.all([
      rpc<{ value: number }>(network, "getBalance", [address, { commitment: "confirmed" }]),
      rpc<Array<{ signature: string; slot: number; blockTime: number | null; err: unknown }>>(network, "getSignaturesForAddress", [address, { limit: 10 }, "confirmed"]),
      rpc<{ value: Array<{ account: { data: { parsed?: { info?: { mint?: string; tokenAmount?: { amount?: string; decimals?: number; uiAmount?: number } } } } } }> }>(network, "getTokenAccountsByOwner", [address, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }]),
    ]);
    const assets = tokenAccounts.value.map((entry, index) => { const info = entry.account.data.parsed?.info; const token = info?.tokenAmount; return { symbol: `SPL-${index + 1}`, name: "Solana token", amount: token?.uiAmount ?? Number(token?.amount ?? 0) / 10 ** (token?.decimals ?? 0), decimals: token?.decimals ?? 0, usdValue: null, mint: info?.mint }; }).filter((asset) => asset.amount > 0);
    return { address, network, lamports: balance.value, sol: balance.value / 1_000_000_000, assets, signatures: signatures.map((item) => ({ signature: item.signature, slot: item.slot, blockTime: item.blockTime, status: item.err ? "failed" : "confirmed" })), fetchedAt: new Date().toISOString(), source: "rpc" };
  } catch {
    return { address, network, lamports: 0, sol: 0, assets: [], signatures: [], fetchedAt: new Date().toISOString(), source: "fallback" };
  }
}
