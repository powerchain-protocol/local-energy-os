import { useCallback, useEffect, useState } from "react";
import type { WalletSnapshot } from "@/types/wallet";

export function useWalletData(address: string | null) {
  const [data, setData] = useState<WalletSnapshot | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!address) { setData(null); return; }
    setLoading(true); setError(null);
    try { const response = await fetch(`/api/v1/balances?address=${encodeURIComponent(address)}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to fetch wallet"); setData(payload.data); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to fetch wallet"); }
    finally { setLoading(false); }
  }, [address]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
