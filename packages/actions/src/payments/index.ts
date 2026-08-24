"use server";

import { executeIntegrationAction } from "../integration/index";

export interface PaymentSessionActionInput {
  provider: "stripe" | "moonpay" | "coinbase-pay" | "solana-pay";
  operation: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

/** Creates a provider request without exposing any payment credential to the client. */
export async function createPaymentSessionAction(
  input: PaymentSessionActionInput,
): Promise<unknown> {
  return executeIntegrationAction(input);
}
