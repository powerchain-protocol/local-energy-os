import type { IntegrationContext } from "../core/adapter";
import type { IntegrationResult } from "../core/result";

export function providerFailure<T>(
  provider: string,
  message: string,
  code: "INVALID_CONFIGURATION" | "VALIDATION_FAILED" = "VALIDATION_FAILED",
): IntegrationResult<T> {
  return {
    state: code === "INVALID_CONFIGURATION" ? "misconfigured" : "unavailable",
    source: provider,
    observedAt: new Date().toISOString(),
    error: { code, message, retryable: false },
  };
}

export async function providerJson<T>(
  provider: string,
  url: string,
  init: RequestInit,
  context: IntegrationContext,
): Promise<IntegrationResult<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: context.signal,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as T & {
      message?: string;
      error?: { message?: string };
    };
    if (!response.ok) {
      const code =
        response.status === 401
          ? "AUTHENTICATION_FAILED"
          : response.status === 403
            ? "AUTHORIZATION_FAILED"
            : response.status === 429
              ? "RATE_LIMITED"
              : "PROVIDER_UNAVAILABLE";
      return {
        state: response.status === 429 ? "degraded" : "unavailable",
        source: provider,
        observedAt: new Date().toISOString(),
        error: {
          code,
          message:
            payload.error?.message ??
            payload.message ??
            `${provider} request failed`,
          retryable: response.status === 429 || response.status >= 500,
          providerStatus: response.status,
        },
      };
    }
    return {
      state: "available",
      source: provider,
      observedAt: new Date().toISOString(),
      data: payload,
    };
  } catch (error) {
    const timedOut =
      context.signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError");
    return {
      state: timedOut ? "degraded" : "unavailable",
      source: provider,
      observedAt: new Date().toISOString(),
      error: {
        code: timedOut ? "TIMEOUT" : "PROVIDER_UNAVAILABLE",
        message: timedOut
          ? `${provider} request timed out`
          : error instanceof Error
            ? error.message
            : `${provider} request failed`,
        retryable: true,
      },
    };
  }
}

export function appendFormValue(
  form: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value))
    return value.forEach((item, index) =>
      appendFormValue(form, `${key}[${index}]`, item),
    );
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>).forEach(
      ([child, item]) => appendFormValue(form, `${key}[${child}]`, item),
    );
  if (["string", "number", "boolean"].includes(typeof value))
    form.append(key, String(value));
}
