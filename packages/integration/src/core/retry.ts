export interface OperationPolicy {
  timeoutMs: number;
  maxAttempts: number;
  retryableCodes: string[];
  baseDelayMs: number;
  maxDelayMs: number;
}
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  policy: OperationPolicy,
  shouldRetry: (error: unknown) => boolean,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === policy.maxAttempts || !shouldRetry(error)) throw error;
      const delay = Math.min(
        policy.maxDelayMs,
        policy.baseDelayMs * 2 ** (attempt - 1),
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
