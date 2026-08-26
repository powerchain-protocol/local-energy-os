import { defineSafeAction, type SafeActionApproval, type SafeActionContext, type SafeActionPolicy } from "@powerchain/safe-actions";
import type { DispatchIntent, DispatchSimulation, EmsDispatchProvider, EmsProvider } from "./index";

function parseDispatchIntent(raw: unknown): DispatchIntent {
  if (!raw || typeof raw !== "object") throw new Error("DISPATCH_INTENT_REQUIRED");
  const value = raw as Record<string, unknown>;
  for (const key of ["id", "siteId", "assetId", "kind", "requestedBy", "requestedAt"]) {
    if (typeof value[key] !== "string" || !String(value[key]).trim()) throw new Error(`DISPATCH_${key.toUpperCase()}_REQUIRED`);
  }
  if (value.targetMw !== undefined && (typeof value.targetMw !== "number" || !Number.isFinite(value.targetMw))) throw new Error("DISPATCH_TARGET_MW_INVALID");
  if (value.durationSeconds !== undefined && (typeof value.durationSeconds !== "number" || !Number.isFinite(value.durationSeconds) || value.durationSeconds <= 0)) throw new Error("DISPATCH_DURATION_INVALID");
  return value as unknown as DispatchIntent;
}

export function createEmsDispatchSafeAction(input: {
  provider: EmsProvider & EmsDispatchProvider;
  policy: SafeActionPolicy<DispatchIntent>;
  approval: SafeActionApproval<DispatchIntent, DispatchSimulation>;
}) {
  return defineSafeAction<DispatchIntent, { dispatchId: string; submittedAt: string; providerReference?: string }, DispatchSimulation>({
    validate: parseDispatchIntent,
    policy: input.policy,
    simulation: {
      simulate: (intent) => input.provider.simulateDispatch(intent),
      isSafe: (simulation) => simulation.safe && simulation.violations.length === 0,
    },
    approval: input.approval,
    execute: async (intent, context: SafeActionContext) => input.provider.executeDispatch(intent, { idempotencyKey: context.idempotencyKey }),
    verify: async (output) => {
      const verification = await input.provider.verifyDispatch(output.dispatchId);
      if (!verification.verified) throw new Error("DISPATCH_NOT_VERIFIED");
      return { observedAt: verification.observedAt, ...verification.evidence };
    },
  });
}
