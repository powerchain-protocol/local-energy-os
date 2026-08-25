export interface OracleValue { value: bigint; exponent: number; confidence?: bigint; provider: "PYTH"|"CHAINLINK"|"REGULATED"|"INTERNAL"; feedId: string; observedAt: string; receivedAt: string; state: "FRESH"|"STALE"|"INVALID" }
export interface OracleProvider { get(feedId:string): Promise<OracleValue> }
export class OracleRouter {
  constructor(private readonly providers: OracleProvider[]) {}
  async get(feedId:string): Promise<OracleValue> {
    for (const provider of this.providers) {
      const value = await provider.get(feedId).catch(()=>null);
      if (value?.state === "FRESH") return value;
    }
    throw new Error("NO_FRESH_ORACLE_VALUE");
  }
}
