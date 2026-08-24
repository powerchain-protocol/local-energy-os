import type { IntegrationState } from "./result";
export interface IntegrationHealth {
  provider: string;
  state: IntegrationState;
  checkedAt: string;
  latencyMs?: number;
  lastSuccessAt?: string;
  errorCode?: string;
  circuitState?: "closed" | "open" | "half-open";
}
