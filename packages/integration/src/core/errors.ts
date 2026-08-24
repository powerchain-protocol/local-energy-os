import type { IntegrationError, IntegrationErrorCode } from "./result";
export class ProviderIntegrationError extends Error {
  constructor(
    public readonly code: IntegrationErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly providerStatus?: number,
  ) {
    super(message);
    this.name = "ProviderIntegrationError";
  }
  toJSON(): IntegrationError {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      providerStatus: this.providerStatus,
    };
  }
}
