import type { RuntimeConfiguration } from "@powerchain/system-management";
import { validateRuntimeConfiguration } from "@powerchain/system-management";

export type ActionRisk = "READ" | "WRITE" | "FINANCIAL" | "CHAIN_WRITE" | "BRIDGE" | "ADMIN";
export interface SafeActionContext {
  action: string;
  risk: ActionRisk;
  tenantId?: string;
  actorId?: string;
  idempotencyKey?: string;
  scopes?: string[];
  runtime?: RuntimeConfiguration;
  requiresScope?: string;
  amountBaseUnits?: bigint;
  maxAmountBaseUnits?: bigint;
}
export interface SafeActionReceipt<T> {
  ok: true;
  action: string;
  idempotencyKey?: string;
  executedAt: Date;
  result: T;
}

export class SafeActionError extends Error {
  constructor(readonly code: string) { super(code); this.name = "SafeActionError"; }
}

export class InMemoryIdempotencyStore {
  private readonly receipts = new Map<string, SafeActionReceipt<unknown>>();
  get<T>(key: string) { return this.receipts.get(key) as SafeActionReceipt<T> | undefined; }
  put<T>(key: string, receipt: SafeActionReceipt<T>) { this.receipts.set(key, receipt); }
}

export async function executeSafeAction<T>(
  context: SafeActionContext,
  execute: () => Promise<T> | T,
  store?: InMemoryIdempotencyStore,
): Promise<SafeActionReceipt<T>> {
  if (context.runtime) validateRuntimeConfiguration(context.runtime);
  if (context.risk !== "READ" && !context.idempotencyKey) throw new SafeActionError("IDEMPOTENCY_KEY_REQUIRED");
  if (context.requiresScope && !context.scopes?.includes(context.requiresScope)) throw new SafeActionError("MISSING_REQUIRED_SCOPE");
  if (context.maxAmountBaseUnits !== undefined && context.amountBaseUnits !== undefined && context.amountBaseUnits > context.maxAmountBaseUnits) {
    throw new SafeActionError("ACTION_AMOUNT_LIMIT_EXCEEDED");
  }
  if (context.runtime?.writeMode === "DISABLED" && context.risk !== "READ") throw new SafeActionError("WRITES_DISABLED");
  if (context.runtime?.writeMode === "SIMULATED" && ["CHAIN_WRITE","BRIDGE"].includes(context.risk)) throw new SafeActionError("CHAIN_WRITE_REQUIRES_ENABLED_WRITE_MODE");
  if (store && context.idempotencyKey) {
    const existing = store.get<T>(context.idempotencyKey);
    if (existing) return existing;
  }
  const receipt: SafeActionReceipt<T> = {
    ok: true,
    action: context.action,
    ...(context.idempotencyKey ? { idempotencyKey: context.idempotencyKey } : {}),
    executedAt: new Date(),
    result: await execute(),
  };
  if (store && context.idempotencyKey) store.put(context.idempotencyKey, receipt);
  return receipt;
}
