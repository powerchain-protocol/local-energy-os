export type IntegrationState =
  "available" | "degraded" | "unavailable" | "disabled" | "misconfigured";
export type IntegrationErrorCode =
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "INVALID_CONFIGURATION"
  | "VALIDATION_FAILED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "CIRCUIT_OPEN"
  | "CONFLICT"
  | "UNKNOWN";
export interface IntegrationError {
  code: IntegrationErrorCode;
  message: string;
  retryable: boolean;
  providerStatus?: number;
}
export interface IntegrationResult<T> {
  state: IntegrationState;
  data?: T;
  error?: IntegrationError;
  source: string;
  observedAt: string;
  stale?: boolean;
}
export const unavailable = <T>(
  source: string,
  code: IntegrationErrorCode,
  message: string,
  retryable = false,
): IntegrationResult<T> => ({
  state: code === "INVALID_CONFIGURATION" ? "misconfigured" : "unavailable",
  source,
  observedAt: new Date().toISOString(),
  error: { code, message, retryable },
});
export const success = <T>(source: string, data: T): IntegrationResult<T> => ({
  state: "available",
  data,
  source,
  observedAt: new Date().toISOString(),
});
