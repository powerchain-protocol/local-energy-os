import { WebSocket, WebSocketServer, type ServerOptions } from "ws";

export interface PowerChainMessage<T = unknown> {
  channel: string;
  event: string;
  data: T;
  sentAt: string;
}

export function createPowerChainWebSocketServer(options: ServerOptions) {
  const server = new WebSocketServer(options);
  const subscriptions = new Map<WebSocket, Set<string>>();

  server.on("connection", (socket) => {
    subscriptions.set(socket, new Set());
    socket.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as { action?: string; channel?: string };
        if (!message.channel) return;
        const channels = subscriptions.get(socket);
        if (message.action === "subscribe") channels?.add(message.channel);
        if (message.action === "unsubscribe") channels?.delete(message.channel);
      } catch {
        socket.send(JSON.stringify({ event: "error", data: { code: "INVALID_MESSAGE" } }));
      }
    });
    socket.on("close", () => subscriptions.delete(socket));
  });

  function publish<T>(message: Omit<PowerChainMessage<T>, "sentAt">) {
    const payload = JSON.stringify({ ...message, sentAt: new Date().toISOString() });
    for (const [socket, channels] of subscriptions) {
      if (socket.readyState === WebSocket.OPEN && channels.has(message.channel)) socket.send(payload);
    }
  }

  return {
    server,
    publish,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
