export type SafeActionStage = "VALIDATE" | "POLICY" | "SIMULATE" | "APPROVE" | "EXECUTE" | "VERIFY";
export interface SafeActionContext { actorId: string; organizationId: string; requestId: string; idempotencyKey: string; }
export interface SafeActionFailure { ok: false; stage: SafeActionStage; code: string; message: string; details?: Record<string, unknown>; }
export interface SafeActionSuccess<T> { ok: true; data: T; evidence?: Record<string, unknown>; }
export type SafeActionResult<T> = SafeActionSuccess<T> | SafeActionFailure;

export interface SafeActionPolicy<TInput> { evaluate(input: TInput, context: SafeActionContext): Promise<{ allowed: boolean; reasons: string[] }>; }
export interface SafeActionSimulation<TInput, TSimulation> { simulate(input: TInput, context: SafeActionContext): Promise<TSimulation>; isSafe(result: TSimulation): boolean; }
export interface SafeActionApproval<TInput, TSimulation> { approve(input: TInput, simulation: TSimulation | undefined, context: SafeActionContext): Promise<{ approved: boolean; approvalId?: string; reason?: string }>; }

export interface SafeActionDefinition<TInput, TOutput, TSimulation = never> {
  validate(input: unknown): TInput;
  policy?: SafeActionPolicy<TInput>;
  simulation?: SafeActionSimulation<TInput, TSimulation>;
  approval?: SafeActionApproval<TInput, TSimulation>;
  execute(input: TInput, context: SafeActionContext): Promise<TOutput>;
  verify?(output: TOutput, input: TInput, context: SafeActionContext): Promise<Record<string, unknown>>;
}

export function defineSafeAction<TInput, TOutput, TSimulation = never>(definition: SafeActionDefinition<TInput, TOutput, TSimulation>) {
  return async (raw: unknown, context: SafeActionContext): Promise<SafeActionResult<TOutput>> => {
    let input: TInput;
    try { input = definition.validate(raw); }
    catch (error) { return { ok: false, stage: "VALIDATE", code: "INVALID_INPUT", message: error instanceof Error ? error.message : "Input validation failed" }; }

    if (definition.policy) {
      const decision = await definition.policy.evaluate(input, context);
      if (!decision.allowed) return { ok: false, stage: "POLICY", code: "POLICY_DENIED", message: "Action denied by policy", details: { reasons: decision.reasons } };
    }

    let simulation: TSimulation | undefined;
    if (definition.simulation) {
      simulation = await definition.simulation.simulate(input, context);
      if (!definition.simulation.isSafe(simulation)) return { ok: false, stage: "SIMULATE", code: "UNSAFE_SIMULATION", message: "Simulation did not satisfy safety constraints" };
    }

    if (definition.approval) {
      const approval = await definition.approval.approve(input, simulation, context);
      if (!approval.approved) return { ok: false, stage: "APPROVE", code: "APPROVAL_REQUIRED", message: approval.reason ?? "Approval was not granted" };
    }

    let output: TOutput;
    try { output = await definition.execute(input, context); }
    catch (error) { return { ok: false, stage: "EXECUTE", code: "EXECUTION_FAILED", message: error instanceof Error ? error.message : "Execution failed" }; }

    try {
      const evidence = definition.verify ? await definition.verify(output, input, context) : undefined;
      return { ok: true, data: output, ...(evidence ? { evidence } : {}) };
    } catch (error) {
      return { ok: false, stage: "VERIFY", code: "VERIFICATION_FAILED", message: error instanceof Error ? error.message : "Post-execution verification failed" };
    }
  };
}

export type PreparedActionKind =
  | "ems.dispatch.prepare"
  | "iot.device.refresh"
  | "depin.node.refresh"
  | "wallet.signature.prepare"
  | "settlement.prepare";

export type PreparedActionDisposition = "READ_ONLY" | "REVIEW_REQUIRED" | "WALLET_SIGNATURE_REQUIRED";
export interface PreparedActionPolicy {
  kind: PreparedActionKind;
  disposition: PreparedActionDisposition;
  executionEndpointAvailable: false;
}

const PREPARED_ACTION_POLICIES: Record<PreparedActionKind, PreparedActionPolicy> = {
  "ems.dispatch.prepare": { kind: "ems.dispatch.prepare", disposition: "REVIEW_REQUIRED", executionEndpointAvailable: false },
  "iot.device.refresh": { kind: "iot.device.refresh", disposition: "READ_ONLY", executionEndpointAvailable: false },
  "depin.node.refresh": { kind: "depin.node.refresh", disposition: "READ_ONLY", executionEndpointAvailable: false },
  "wallet.signature.prepare": { kind: "wallet.signature.prepare", disposition: "WALLET_SIGNATURE_REQUIRED", executionEndpointAvailable: false },
  "settlement.prepare": { kind: "settlement.prepare", disposition: "WALLET_SIGNATURE_REQUIRED", executionEndpointAvailable: false },
};

export function isPreparedActionKind(value: string): value is PreparedActionKind {
  return Object.prototype.hasOwnProperty.call(PREPARED_ACTION_POLICIES, value);
}

export function preparedActionPolicy(value: string): PreparedActionPolicy {
  if (!isPreparedActionKind(value)) {
    throw Object.assign(new Error("Unsupported safe-action kind"), { code: "ACTION_KIND_UNSUPPORTED", status: 400, details: { kind: value } });
  }
  return PREPARED_ACTION_POLICIES[value];
}
