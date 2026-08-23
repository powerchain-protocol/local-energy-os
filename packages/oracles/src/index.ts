export type OracleProvider = "PYTH" | "CHAINLINK" | "REGULATED" | "INTERNAL";
export interface OracleValue {
  value: bigint;
  exponent: number;
  confidence?: bigint;
  provider: OracleProvider;
  feedId: string;
  observedAt: Date;
  receivedAt: Date;
  state: "FRESH" | "STALE" | "INVALID";
}
export interface OracleAdapter { provider: OracleProvider; read(feedId: string): Promise<OracleValue>; }
export class OracleRouter {
  constructor(private readonly adapters: readonly OracleAdapter[]) {}
  async read(feedId: string): Promise<OracleValue> {
    const errors: string[] = [];
    for (const adapter of this.adapters) {
      try {
        const value = await adapter.read(feedId);
        if (value.state === "FRESH") return value;
        errors.push(`${adapter.provider}:${value.state}`);
      } catch (error) { errors.push(`${adapter.provider}:${String(error)}`); }
    }
    throw new Error(`ORACLE_UNAVAILABLE:${feedId}:${errors.join("|")}`);
  }
}
