export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "RPC_ERROR"
  | "PAYMENT_ERROR"
  | "INTEGRATION_ERROR"
  | "PROVIDER_ERROR"
  | "INTERNAL_ERROR";

export interface ErrorDetails { [key: string]: unknown }

export interface ApiErrorPayload {
  error: { code: ErrorCode; message: string; requestId?: string; details?: ErrorDetails };
}
