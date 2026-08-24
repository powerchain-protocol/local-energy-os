import { PythPriceClient, parseDecimal, RATE_SCALE } from "@powerchain/market-data";
export type OracleProvider = "PYTH" | "CHAINLINK" | "REGULATED" | "INTERNAL";
export interface OracleValue { value:bigint; exponent:number; confidence?:bigint; provider:OracleProvider; feedId:string; observedAt:Date; receivedAt:Date; state:"FRESH"|"STALE"|"INVALID"; }
export interface OracleAdapter { provider:OracleProvider; read(feedId:string):Promise<OracleValue>; }
export class OracleRouter { constructor(private readonly adapters:readonly OracleAdapter[]){} async read(feedId:string):Promise<OracleValue>{const errors:string[]=[];for(const adapter of this.adapters){try{const value=await adapter.read(feedId);if(value.state==="FRESH")return value;errors.push(`${adapter.provider}:${value.state}`);}catch(error){errors.push(`${adapter.provider}:${String(error)}`);}}throw new Error(`ORACLE_UNAVAILABLE:${feedId}:${errors.join("|")}`);} }

export class PythOracleAdapter implements OracleAdapter {
  readonly provider="PYTH" as const;
  constructor(private readonly client:PythPriceClient, private readonly symbols:Record<string,{base:string;quote:string}>){ }
  async read(feedId:string):Promise<OracleValue>{const symbol=this.symbols[feedId];if(!symbol)throw new Error(`PYTH_SYMBOL_MAPPING_REQUIRED:${feedId}`);const price=await this.client.latest({feedId,...symbol});const value=parseDecimal(price.value,RATE_SCALE);const confidence=price.confidence?parseDecimal(price.confidence,RATE_SCALE):undefined;return{value,exponent:-RATE_SCALE,...(confidence!==undefined?{confidence}:{}),provider:"PYTH",feedId,observedAt:price.observedAt,receivedAt:price.receivedAt,state:price.state};}
}
