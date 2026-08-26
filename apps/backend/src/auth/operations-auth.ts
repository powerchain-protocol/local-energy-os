import type { OperationsAuthAdapter, OperationsAuthInput, OperationsIdentity } from "@powerchain/adapters";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BackendConfig } from "../config.js";

function bearer(input: OperationsAuthInput): string | undefined {
  const raw = input.authorization?.trim();
  return raw?.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : undefined;
}

export class InternalOperationsAuthAdapter implements OperationsAuthAdapter {
  readonly id = "internal";
  constructor(private readonly config: BackendConfig) {}
  async authenticate(input: OperationsAuthInput): Promise<OperationsIdentity | null> {
    const actorId = input.headers["x-powerchain-user-id"]?.trim();
    const organizationId = input.headers["x-powerchain-organization-id"]?.trim() ?? input.headers["x-organization-id"]?.trim();
    if (!actorId || !organizationId) return null;
    const token = bearer(input);
    const trustedToken = Boolean(this.config.OPERATIONS_INTERNAL_BEARER_TOKEN && token === this.config.OPERATIONS_INTERNAL_BEARER_TOKEN);
    const trustedDev = this.config.NODE_ENV !== "production" && this.config.POWERCHAIN_TRUST_DEV_HEADERS === "true";
    if (!trustedToken && !trustedDev) return null;
    return { actorId, organizationId, provider: trustedToken ? "internal-bearer" : "development-header", roles: (input.headers["x-powerchain-role"] ?? "VIEWER").split(",").map(v => v.trim()).filter(Boolean) };
  }
}

export class SupabaseOperationsAuthAdapter implements OperationsAuthAdapter {
  readonly id = "supabase";
  constructor(private readonly client: SupabaseClient | null) {}
  async authenticate(input: OperationsAuthInput): Promise<OperationsIdentity | null> {
    if (!this.client) return null;
    const token = bearer(input);
    const organizationId = input.headers["x-powerchain-organization-id"]?.trim() ?? input.headers["x-organization-id"]?.trim();
    if (!token || !organizationId) return null;
    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) return null;
    return { actorId: data.user.id, organizationId, provider: "supabase", email: data.user.email, roles: [] };
  }
}

export class CompositeOperationsAuthAdapter implements OperationsAuthAdapter {
  readonly id = "composite";
  constructor(private readonly adapters: readonly OperationsAuthAdapter[]) {}
  async authenticate(input: OperationsAuthInput): Promise<OperationsIdentity | null> {
    for (const adapter of this.adapters) {
      const identity = await adapter.authenticate(input);
      if (identity) return identity;
    }
    return null;
  }
}
