import { AppError, isAbortError } from "@/utils/errors";

export class PowerChainApiError extends AppError {
  constructor(message: string, status: number, details?: unknown, cause?: unknown) {
    super(message, { code: "POWERCHAIN_API_ERROR", status, details, cause });
    this.name = "PowerChainApiError";
  }
}

export interface PowerChainApiOptions extends RequestInit {
  timeoutMs?: number;
}

export async function powerchainApi<T>(path: string, init: PowerChainApiOptions = {}): Promise<T> {
  const { timeoutMs = 10_000, ...requestInit } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(path, {
      ...requestInit,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...requestInit.headers,
      },
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new PowerChainApiError(
        payload?.error ?? payload?.message ?? `Request failed (${response.status})`,
        response.status,
        payload,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof PowerChainApiError) throw error;
    if (isAbortError(error)) {
      throw new PowerChainApiError("Request timed out", 408, { path, timeoutMs }, error);
    }
    throw new PowerChainApiError("Unable to reach the PowerChain API", 503, { path }, error);
  } finally {
    clearTimeout(timeout);
  }
}
