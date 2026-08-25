"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError } from "@powerchain/api-client";
import { useEnergyContext } from "./context-provider";

export function useEnergyResource<T>(path: string) {
  const { context } = useEnergyContext();
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({ organizationId, contextType: context.type })), [apiUrl, organizationId, context.type]);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    if (!organizationId) {
      setData(null);
      setError("Set NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID to connect this workspace to tenant data.");
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    setError(null);
    client.get<T>(path, controller.signal)
      .then((response) => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "PowerChain API data is unavailable.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, organizationId, path]);

  return { data, error, loading, configured: Boolean(organizationId) };
}
