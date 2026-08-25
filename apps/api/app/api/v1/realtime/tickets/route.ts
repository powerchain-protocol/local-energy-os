import { createRealtimeTicket, REALTIME_TOPICS, type RealtimeTopic } from "@powerchain/api/realtime";
import { withApi, readJson } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";

export async function POST(req: Request) {
  return withApi(req, async ({ context, actor }) => {
    const organizationId = requireOrganization(context);
    if (!actor.id || actor.source === "ANONYMOUS") throw Object.assign(new Error("Authenticated user is required"), { code: "AUTH_REQUIRED", status: 401 });
    const body = await readJson(req) as { topics?: unknown };
    const requested = Array.isArray(body.topics) ? body.topics.filter((topic): topic is RealtimeTopic => typeof topic === "string" && REALTIME_TOPICS.includes(topic as RealtimeTopic)) : [];
    const topics = requested.length ? requested : [...REALTIME_TOPICS];
    const now = Date.now();
    const expiresAt = now + 60_000;
    const secret = process.env.POWERCHAIN_REALTIME_TICKET_SECRET ?? "";
    if (!secret) throw Object.assign(new Error("Realtime ticket service is not configured"), { code: "REALTIME_NOT_CONFIGURED", status: 503 });
    const ticket = createRealtimeTicket({ version: 1, subject: actor.id, organizationId, topics, issuedAt: now, expiresAt }, secret);
    return { ticket, expiresAt: new Date(expiresAt).toISOString(), websocketUrl: process.env.POWERCHAIN_REALTIME_URL ?? "ws://localhost:3012/v1/events", topics };
  }, { status: 201 });
}
