import { createHmac, timingSafeEqual } from "node:crypto";

export const POWERCHAIN_REALTIME_VERSION = "1.0" as const;
export const POWERCHAIN_REALTIME_PATH = "/v1/events" as const;
export const POWERCHAIN_REALTIME_REDIS_PREFIX = "powerchain:events:v1" as const;

export const REALTIME_TOPICS = [
  "system", "energy", "market", "settlement", "devices", "rewards", "cross-chain", "audit"
] as const;
export type RealtimeTopic = (typeof REALTIME_TOPICS)[number];

export interface RealtimeEventEnvelope<T = unknown> {
  id: string;
  version: number;
  topic: RealtimeTopic;
  type: string;
  occurredAt: string;
  organizationId: string;
  aggregateType: string;
  aggregateId: string;
  correlationId?: string;
  payload: T;
}

export type RealtimeClientMessage =
  | { type: "subscribe"; topics: RealtimeTopic[] }
  | { type: "unsubscribe"; topics: RealtimeTopic[] }
  | { type: "ping"; id?: string };

export type RealtimeServerMessage =
  | { type: "ready"; version: typeof POWERCHAIN_REALTIME_VERSION; organizationId: string; topics: RealtimeTopic[] }
  | { type: "subscribed"; topics: RealtimeTopic[] }
  | { type: "event"; event: RealtimeEventEnvelope }
  | { type: "pong"; id?: string; at: string }
  | { type: "error"; code: string; message: string };

export interface RealtimeTicketPayload {
  version: 1;
  subject: string;
  organizationId: string;
  topics: RealtimeTopic[];
  issuedAt: number;
  expiresAt: number;
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}
function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}
function signature(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function createRealtimeTicket(payload: RealtimeTicketPayload, secret: string): string {
  if (!secret) throw new Error("POWERCHAIN_REALTIME_TICKET_SECRET is required");
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${signature(encoded, secret)}`;
}

export function verifyRealtimeTicket(token: string, secret: string, now = Date.now()): RealtimeTicketPayload {
  if (!secret) throw new Error("POWERCHAIN_REALTIME_TICKET_SECRET is required");
  const [encoded, received] = token.split(".");
  if (!encoded || !received) throw new Error("Invalid realtime ticket");
  const expected = signature(encoded, secret);
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Invalid realtime ticket signature");
  const payload = JSON.parse(decode(encoded)) as RealtimeTicketPayload;
  if (payload.version !== 1 || !payload.subject || !payload.organizationId) throw new Error("Invalid realtime ticket payload");
  if (payload.expiresAt <= now) throw new Error("Realtime ticket expired");
  if (payload.issuedAt > now + 30_000) throw new Error("Realtime ticket issued in the future");
  payload.topics = payload.topics.filter((topic): topic is RealtimeTopic => REALTIME_TOPICS.includes(topic));
  return payload;
}

export function realtimeRedisChannel(organizationId: string): string {
  return `${POWERCHAIN_REALTIME_REDIS_PREFIX}:${organizationId}`;
}

export function classifyRealtimeTopic(type: string): RealtimeTopic {
  const value = type.toLowerCase();
  if (value.includes("settlement") || value.includes("delivery")) return "settlement";
  if (value.includes("reward") || value.includes("pwrc")) return "rewards";
  if (value.includes("meter") || value.includes("device") || value.includes("telemetry") || value.includes("charging")) return "devices";
  if (value.includes("bridge") || value.includes("crosschain") || value.includes("cross-chain")) return "cross-chain";
  if (value.includes("audit") || value.includes("policy") || value.includes("approval")) return "audit";
  if (value.includes("market") || value.includes("order") || value.includes("trade")) return "market";
  if (value.includes("energy") || value.includes("batch") || value.includes("position") || value.includes("reservation") || value.includes("retirement")) return "energy";
  return "system";
}
