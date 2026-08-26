export class RpcError extends Error {
  constructor(readonly provider: string, readonly code: number | string, message: string, readonly data?: unknown) { super(message); this.name = "RpcError"; }
}
export async function jsonRpc<T>(url: string, method: string, params: unknown[], signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }), signal });
  if (!response.ok) throw new RpcError(url, response.status, `RPC_HTTP_${response.status}`);
  const body = await response.json() as { result?: T; error?: { code: number; message: string; data?: unknown } };
  if (body.error) throw new RpcError(url, body.error.code, body.error.message, body.error.data);
  if (!("result" in body)) throw new RpcError(url, "INVALID_RESPONSE", "RPC result is missing");
  return body.result as T;
}
