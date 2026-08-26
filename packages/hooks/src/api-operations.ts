"use client";
import { useCallback, useState } from "react";
import { useAsyncResource } from "./core";
import type { EmsSnapshot } from "@powerchain/ems";
import type { IoTDevice } from "@powerchain/iot";
import type { DePinNode } from "@powerchain/depin";
import type { PreparedActionKind } from "@powerchain/safe-actions";

export interface OperationsClientOptions { apiBase?: string; organizationId?: string; fetcher?: typeof fetch; }
function base(options?: OperationsClientOptions) { return (options?.apiBase ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, ""); }
async function request<T>(path: string, options?: OperationsClientOptions, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (options?.organizationId) headers.set("x-organization-id", options.organizationId);
  const response = await (options?.fetcher ?? fetch)(`${base(options)}${path}`, { ...init, headers });
  const payload = await response.json() as { data?: T; error?: { message?: string; code?: string } };
  if (!response.ok) throw Object.assign(new Error(payload.error?.message ?? `HTTP ${response.status}`), { code: payload.error?.code ?? "OPERATIONS_API_ERROR", status: response.status });
  return payload.data as T;
}

export function useOperationalHealth(options?: OperationsClientOptions) { return useAsyncResource(() => request("/api/v1/health", options), [options?.apiBase, options?.organizationId]); }
export function useEmsOverview(siteId: string, options?: OperationsClientOptions) { return useAsyncResource<EmsSnapshot>(() => request(`/api/v1/ems/overview?siteId=${encodeURIComponent(siteId)}`, options), [siteId, options?.apiBase, options?.organizationId]); }
export function useIotDevices(siteId: string, options?: OperationsClientOptions) { return useAsyncResource<IoTDevice[]>(() => request(`/api/v1/iot/devices?siteId=${encodeURIComponent(siteId)}`, options), [siteId, options?.apiBase, options?.organizationId]); }
export function useDepinNodes(siteId: string, options?: OperationsClientOptions) { return useAsyncResource<DePinNode[]>(() => request(`/api/v1/depin/nodes?siteId=${encodeURIComponent(siteId)}`, options), [siteId, options?.apiBase, options?.organizationId]); }
export function useMarketPrices(symbols: string[], options?: OperationsClientOptions) { const key = symbols.join(","); return useAsyncResource<Array<{ symbol: string; priceUsd: number; observedAt: string; provider: string }>>(() => request(`/api/v1/market-data/prices?symbols=${encodeURIComponent(key)}`, options), [key, options?.apiBase, options?.organizationId]); }

export function useSafeAction(options?: OperationsClientOptions) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error>();
  const prepare = useCallback(async (input: { kind: PreparedActionKind; siteId?: string; request?: Record<string, unknown>; idempotencyKey?: string }) => {
    setPending(true); setError(undefined);
    try { return await request<{ id: string; kind: PreparedActionKind; state: string; disposition: string; requiresReview: boolean; requiresWalletSignature: boolean; expiresAt: string; executionEndpointAvailable: false }>("/api/v1/actions/prepare", options, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": input.idempotencyKey ?? crypto.randomUUID() }, body: JSON.stringify({ kind: input.kind, siteId: input.siteId, request: input.request ?? {} }) }); }
    catch (cause) { const next = cause instanceof Error ? cause : new Error("Safe-action preparation failed"); setError(next); throw next; }
    finally { setPending(false); }
  }, [options?.apiBase, options?.organizationId]);
  return { prepare, pending, error };
}
