import { createClient, type RedisClientType } from "redis";
import { realtimeRedisChannel, type RealtimeEventEnvelope } from "@powerchain/api/realtime";

function redisUrl(): string {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is required for realtime transport");
  return url;
}

export async function publishRealtimeEvent(event: RealtimeEventEnvelope): Promise<void> {
  const client = createClient({ url: redisUrl() });
  client.on("error", (error) => console.error(JSON.stringify({ service: "powerchain-realtime-bus", status: "redis-error", message: error.message })));
  await client.connect();
  try {
    await client.publish(realtimeRedisChannel(event.organizationId), JSON.stringify(event));
  } finally {
    await client.quit();
  }
}

export async function subscribeRealtimeEvents(handler: (event: RealtimeEventEnvelope) => void | Promise<void>): Promise<() => Promise<void>> {
  const subscriber: RedisClientType = createClient({ url: redisUrl() });
  subscriber.on("error", (error) => console.error(JSON.stringify({ service: "powerchain-realtime-bus", status: "redis-error", message: error.message })));
  await subscriber.connect();
  await subscriber.pSubscribe("powerchain:events:v1:*", async (message) => {
    try {
      const event = JSON.parse(message) as RealtimeEventEnvelope;
      await handler(event);
    } catch (error) {
      console.error(JSON.stringify({ service: "powerchain-realtime-bus", status: "invalid-event", message: error instanceof Error ? error.message : "unknown" }));
    }
  });
  return async () => { if (subscriber.isOpen) await subscriber.quit(); };
}
