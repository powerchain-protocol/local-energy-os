export type RealtimeStatus = "connecting" | "open" | "closed" | "fallback";
export function createRealtimeClient(url: string, onMessage: (data: unknown) => void) {
  if (typeof WebSocket === "undefined") return { status: "fallback" as const, close() {} };
  const socket = new WebSocket(url); socket.onmessage = (event) => { try { onMessage(JSON.parse(event.data)); } catch { onMessage(event.data); } };
  return { get status(): RealtimeStatus { return socket.readyState === WebSocket.OPEN ? "open" : socket.readyState === WebSocket.CLOSED ? "closed" : "connecting"; }, close: () => socket.close() };
}
