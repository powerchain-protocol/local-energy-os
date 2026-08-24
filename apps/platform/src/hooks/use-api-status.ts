"use client";

import { useCallback, useEffect, useState } from "react";
import { powerchainApi } from "@/lib/powerchain/api";

export interface ApiStatus {
  status: "healthy" | "degraded" | "offline";
  version?: string;
  timestamp?: string;
}

export function useApiStatus(intervalMs = 30_000) {
  const [data, setData] = useState<ApiStatus>({ status: "offline" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await powerchainApi<ApiStatus>("/api/v1/health", { timeoutMs: 5_000 });
      setData(result);
      setError(null);
    } catch (cause) {
      setData({ status: "offline" });
      setError(cause instanceof Error ? cause : new Error("Health check failed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, refresh]);

  return { data, error, isLoading, refresh };
}
