export const POWERCHAIN_API_VERSION = "v1" as const;
export const POWERCHAIN_IDEMPOTENCY_HEADER = "idempotency-key" as const;

export interface ApiMeta {
  requestId: string;
  generatedAt: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  error: ApiErrorPayload & { requestId: string };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
