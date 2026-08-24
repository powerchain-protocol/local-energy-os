export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";
const RPCS: Record<SolanaCluster,string>={"mainnet-beta":"https://api.mainnet-beta.solana.com",devnet:"https://api.devnet.solana.com",testnet:"https://api.testnet.solana.com",localnet:"http://127.0.0.1:8899"};
export function getSolanaRpcUrl(){const c=(process.env.NEXT_PUBLIC_SOLANA_CLUSTER??"devnet") as SolanaCluster;return process.env.SOLANA_RPC_URL??RPCS[c]??RPCS.devnet;}
export async function solanaRpc<T>(method:string,params:unknown[]=[]):Promise<T>{const r=await fetch(getSolanaRpcUrl(),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:crypto.randomUUID(),method,params}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error(`Solana RPC failed with ${r.status}`);const b=await r.json() as {result?:T;error?:{message?:string}};if(b.error)throw new Error(b.error.message??"Solana RPC request failed");if(b.result===undefined)throw new Error("Solana RPC returned no result");return b.result;}
export async function getSolBalance(address:string){const result=await solanaRpc<{value:number}>("getBalance",[address,{commitment:"confirmed"}]);return result.value/1_000_000_000;}
export function getAccountInfo(address:string){return solanaRpc("getAccountInfo",[address,{encoding:"jsonParsed",commitment:"confirmed"}]);}
export function getTokenAccounts(address:string){return solanaRpc("getTokenAccountsByOwner",[address,{programId:"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{encoding:"jsonParsed",commitment:"confirmed"}]);}
export function getSignatures(address:string,limit=20){return solanaRpc("getSignaturesForAddress",[address,{limit}]);}

/** Backward-compatible account lookup used by API routes. */
export const getSolanaAccount = getAccountInfo;

export async function getSignatureStatus(signature: string) {
  const result = await solanaRpc<{ value: Array<unknown | null> }>("getSignatureStatuses", [
    [signature],
    { searchTransactionHistory: true },
  ]);
  return result.value[0] ?? null;
}
