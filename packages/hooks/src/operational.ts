"use client";
import { useCallback, useState } from "react";
import type { AuthAdapter, AuthSession, WalletAccount, WalletAdapter } from "@powerchain/adapters";
import type { EmsService } from "@powerchain/ems";
import type { IoTService } from "@powerchain/iot";
import type { DePinService } from "@powerchain/depin";
import { useAsyncResource } from "./core";

export function useAuthSession(adapter: AuthAdapter) {
  return useAsyncResource<AuthSession | null>(() => adapter.getSession({}), [adapter]);
}

export function useWallet(adapter: WalletAdapter) {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const refresh = useCallback(async () => {
    try { const next = await adapter.accounts(); setAccounts(next); return next; }
    catch (cause) { const next = cause instanceof Error ? cause : new Error("Wallet account lookup failed"); setError(next); throw next; }
  }, [adapter]);

  const connect = useCallback(async () => {
    setPending(true); setError(undefined);
    try { const next = await adapter.connect(); setAccounts(next); return next; }
    catch (cause) { const next = cause instanceof Error ? cause : new Error("Wallet connection failed"); setError(next); throw next; }
    finally { setPending(false); }
  }, [adapter]);

  const disconnect = useCallback(async () => {
    setPending(true); setError(undefined);
    try { await adapter.disconnect(); setAccounts([]); }
    catch (cause) { const next = cause instanceof Error ? cause : new Error("Wallet disconnect failed"); setError(next); throw next; }
    finally { setPending(false); }
  }, [adapter]);

  return { accounts, pending, error, connect, disconnect, refresh };
}

export function useEmsSnapshot(service: EmsService, siteId: string) {
  return useAsyncResource((signal) => service.snapshot(siteId, signal), [service, siteId]);
}

export function useIoTDevices(service: IoTService, organizationId: string) {
  return useAsyncResource((signal) => service.listDevices(organizationId, signal), [service, organizationId]);
}

export function useDePinNodes(service: DePinService, organizationId: string) {
  return useAsyncResource((signal) => service.listNodes(organizationId, signal), [service, organizationId]);
}
