import type { ApiErrorPayload, ErrorCode, ErrorDetails } from "@powerchain/types";

export class PowerChainError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode = "INTERNAL_ERROR",
    public readonly status = 500,
    public readonly details?: ErrorDetails,
  ) { super(message); this.name = "PowerChainError"; }
}

export interface AppErrorOptions {
  code: string;
  status: number;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export function toPowerChainError(error: unknown): PowerChainError {
  if (error instanceof PowerChainError) return error;
  return new PowerChainError(error instanceof Error ? error.message : "Unexpected platform error");
}

export function errorPayload(error: unknown, requestId?: string): ApiErrorPayload {
  const normalized = toPowerChainError(error);
  return { error: { code: normalized.code, message: normalized.message, requestId, details: normalized.details } };
}
