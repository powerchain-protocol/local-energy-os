import { assertPolicyAllowed, decidePolicy, type PolicyAction } from "@powerchain/policy";
import type { ApiExecutionContext } from "./api";

export function authorizeMutation(execution: ApiExecutionContext, action: PolicyAction) {
  const decision = decidePolicy({ action, role: execution.actor.role, context: execution.context, runtime: execution.runtime });
  assertPolicyAllowed(decision);
  return decision;
}
