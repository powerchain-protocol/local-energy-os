import { loadPowerChainRootEnv } from "@powerchain/config/node-env";
loadPowerChainRootEnv();
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import {
  POWERCHAIN_REALTIME_PATH,
  POWERCHAIN_REALTIME_VERSION,
  REALTIME_TOPICS,
  verifyRealtimeTicket,
  type RealtimeClientMessage,
  type RealtimeEventEnvelope,
  type RealtimeTopic,
} from "@powerchain/api/realtime";
import { subscribeRealtimeEvents } from "@powerchain/realtime";

const port = Number(process.env.REALTIME_PORT ?? 3012);
const secret = process.env.POWERCHAIN_REALTIME_TICKET_SECRET ?? "";
if (!secret) throw new Error("POWERCHAIN_REALTIME_TICKET_SECRET is required to start the realtime gateway");

type Session = { organizationId: string; topics: Set<RealtimeTopic> };
const sessions = new Map<WebSocket, Session>();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ service: "powerchain-realtime", version: "1.0.0", status: "OPERATIONAL", connections: sessions.size }));
    return;
  }
  res.writeHead(404).end();
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (url.pathname !== POWERCHAIN_REALTIME_PATH) return socket.destroy();
  const ticket = url.searchParams.get("ticket");
  if (!ticket) return socket.destroy();
  try {
    const payload = verifyRealtimeTicket(ticket, secret);
    wss.handleUpgrade(req, socket, head, (ws) => {
      sessions.set(ws, { organizationId: payload.organizationId, topics: new Set(payload.topics) });
      wss.emit("connection", ws, req);
    });
  } catch {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  const session = sessions.get(ws);
  if (!session) return ws.close(1011, "session missing");
  ws.send(JSON.stringify({ type: "ready", version: POWERCHAIN_REALTIME_VERSION, organizationId: session.organizationId, topics: [...session.topics] }));
  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as RealtimeClientMessage;
      if (message.type === "ping") return ws.send(JSON.stringify({ type: "pong", id: message.id, at: new Date().toISOString() }));
      if (message.type === "subscribe" || message.type === "unsubscribe") {
        const topics = message.topics.filter((topic): topic is RealtimeTopic => REALTIME_TOPICS.includes(topic));
        for (const topic of topics) message.type === "subscribe" ? session.topics.add(topic) : session.topics.delete(topic);
        ws.send(JSON.stringify({ type: "subscribed", topics: [...session.topics] }));
      }
    } catch {
      ws.send(JSON.stringify({ type: "error", code: "INVALID_MESSAGE", message: "Realtime messages must use the documented JSON protocol" }));
    }
  });
  ws.on("close", () => sessions.delete(ws));
});

const unsubscribe = await subscribeRealtimeEvents((event: RealtimeEventEnvelope) => {
  for (const [ws, session] of sessions) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    if (session.organizationId !== event.organizationId) continue;
    if (!session.topics.has(event.topic)) continue;
    ws.send(JSON.stringify({ type: "event", event }));
  }
});

server.listen(port, () => console.log(JSON.stringify({ service: "powerchain-realtime", version: "1.0.0", port, path: POWERCHAIN_REALTIME_PATH, status: "listening" })));
async function shutdown(signal: string) {
  console.log(JSON.stringify({ service: "powerchain-realtime", status: "stopping", signal }));
  await unsubscribe();
  for (const ws of sessions.keys()) ws.close(1001, "server shutdown");
  server.close(() => process.exit(0));
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
