"use client";

import { useEffect, useState } from "react";

export type NetworkStatus = "connecting" | "online" | "degraded" | "offline";

type StatusPayload = {
  status?: NetworkStatus;
  latencyMs?: number;
  updatedAt?: string;
};

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>("connecting");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;

    const usePollingFallback = () => {
      const poll = async () => {
        const started = performance.now();
        try {
          const response = await fetch("/api/v1/status", { cache: "no-store" });
          if (!active) return;
          setStatus(response.ok ? "online" : "degraded");
          setLatencyMs(Math.round(performance.now() - started));
        } catch {
          if (active) setStatus("offline");
        }
      };
      void poll();
      return window.setInterval(poll, 30_000);
    };

    let pollingId: number | undefined;
    if (typeof EventSource !== "undefined") {
      source = new EventSource("/api/v1/status/stream");
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as StatusPayload;
          setStatus(payload.status ?? "online");
          setLatencyMs(payload.latencyMs ?? null);
        } catch {
          setStatus("degraded");
        }
      };
      source.onerror = () => {
        source?.close();
        source = null;
        if (pollingId === undefined) pollingId = usePollingFallback();
      };
    } else {
      pollingId = usePollingFallback();
    }

    return () => {
      active = false;
      source?.close();
      if (pollingId !== undefined) window.clearInterval(pollingId);
    };
  }, []);

  return { status, latencyMs };
}
