export type RealtimeConnectionState = "idle" | "connecting" | "open" | "fallback" | "closed";

export function createResilientWebSocket(
  url: string,
  handlers: { onMessage: (data: unknown) => void; onState?: (state: RealtimeConnectionState) => void },
) {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    handlers.onState?.("fallback");
    return { close() {} };
  }

  handlers.onState?.("connecting");
  const socket = new WebSocket(url);
  socket.onopen = () => handlers.onState?.("open");
  socket.onmessage = (event) => {
    try { handlers.onMessage(JSON.parse(event.data)); }
    catch { handlers.onMessage(event.data); }
  };
  socket.onerror = () => handlers.onState?.("fallback");
  socket.onclose = () => handlers.onState?.("closed");
  return { close: () => socket.close() };
}
