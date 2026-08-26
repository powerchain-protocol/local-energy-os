import { jsonRpc } from "@powerchain/clients";
import type { BackendConfig } from "../config.js";

export async function probeSolana(config: BackendConfig, signal?: AbortSignal) {
  if (!config.SOLANA_RPC_URL) return { status: "unconfigured" as const, mode: "read-only" as const };
  const started = Date.now();
  try { const health = await jsonRpc<string>(config.SOLANA_RPC_URL, "getHealth", [], signal); return { status: health === "ok" ? "ok" as const : "unavailable" as const, mode: "read-only" as const, latencyMs: Date.now() - started }; }
  catch { return { status: "unavailable" as const, mode: "read-only" as const, latencyMs: Date.now() - started }; }
}

export async function probeSui(config: BackendConfig, signal?: AbortSignal) {
  if (!config.SUI_RPC_URL) return { status: "unconfigured" as const, mode: "read-only" as const };
  const started = Date.now();
  try { await jsonRpc<string>(config.SUI_RPC_URL, "sui_getLatestCheckpointSequenceNumber", [], signal); return { status: "ok" as const, mode: "read-only" as const, latencyMs: Date.now() - started }; }
  catch { return { status: "unavailable" as const, mode: "read-only" as const, latencyMs: Date.now() - started }; }
}
