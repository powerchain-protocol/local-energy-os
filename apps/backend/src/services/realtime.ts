import type { SupabaseClient } from "@supabase/supabase-js";
import type { BackendConfig } from "../config.js";
export class OperationsRealtimePublisher {
  constructor(private readonly client: SupabaseClient | null, private readonly config: BackendConfig) {}
  get enabled() { return Boolean(this.client && this.config.SUPABASE_REALTIME_ENABLED === "true"); }
  async publish(event: string, payload: Record<string, unknown>) {
    if (!this.enabled || !this.client) return false;
    const channel = this.client.channel(this.config.SUPABASE_REALTIME_CHANNEL);
    try { const result = await channel.send({ type: "broadcast", event, payload }); return result === "ok"; }
    finally { await this.client.removeChannel(channel); }
  }
}
