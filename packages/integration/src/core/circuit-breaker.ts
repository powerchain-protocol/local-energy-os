export type CircuitState = "closed" | "open" | "half-open";
export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  state: CircuitState = "closed";
  constructor(
    private readonly threshold = 5,
    private readonly resetMs = 30_000,
  ) {}
  async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs)
        throw new Error("CIRCUIT_OPEN");
      this.state = "half-open";
    }
    try {
      const result = await operation();
      this.failures = 0;
      this.state = "closed";
      return result;
    } catch (error) {
      this.failures += 1;
      if (this.failures >= this.threshold) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw error;
    }
  }
}
