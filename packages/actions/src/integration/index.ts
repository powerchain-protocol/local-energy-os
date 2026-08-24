"use server";

const executableProviders = new Set([
  "helius",
  "circle",
  "stripe",
  "moonpay",
  "coinbase-pay",
  "solana-pay",
]);

export interface IntegrationActionInput {
  provider: string;
  operation: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
}

function gatewayUrl(): string {
  const value = process.env.INTEGRATION_GATEWAY_URL ?? "http://localhost:3105";
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  )
    throw new Error(
      "Integration gateway must use HTTPS outside local development",
    );
  return url.origin;
}

/** Server action boundary: credentials remain in the integration gateway. */
export async function executeIntegrationAction(
  input: IntegrationActionInput,
): Promise<unknown> {
  if (!executableProviders.has(input.provider))
    throw new Error("Unsupported integration provider");
  if (!input.operation.trim())
    throw new Error("Integration operation is required");
  const token = process.env.INTEGRATION_GATEWAY_TOKEN;
  const response = await fetch(
    `${gatewayUrl()}/api/v1/integrations/${encodeURIComponent(input.provider)}/execute`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(input.idempotencyKey
          ? { "idempotency-key": input.idempotencyKey }
          : {}),
      },
      body: JSON.stringify({
        operation: input.operation,
        payload: input.payload ?? {},
      }),
      cache: "no-store",
    },
  );
  const result = (await response.json()) as unknown;
  if (!response.ok)
    throw new Error(
      `Integration request failed with status ${response.status}`,
    );
  return result;
}
