import { solscan, suiscan } from "@powerchain/explorers";
import { BirdeyePriceClient, CoinMarketCapPriceClient, PythPriceClient, processCurrencyRates, type PriceObservation } from "@powerchain/market-data";

export interface MarketDataEnvironment { PYTH_HERMES_URL?:string; PYTH_API_KEY?:string; BIRDEYE_API_KEY?:string; COINMARKETCAP_API_KEY?:string; CMC_ALLOW_PUBLIC?:string; }

function serverEnv(): MarketDataEnvironment { return ((globalThis as any).process?.env ?? {}) as MarketDataEnvironment; }

export function createMarketDataClients(env:MarketDataEnvironment=serverEnv()){
  return {
    pyth:new PythPriceClient({baseUrl:env.PYTH_HERMES_URL,apiKey:env.PYTH_API_KEY,maxAgeSeconds:60}),
    birdeye:env.BIRDEYE_API_KEY?new BirdeyePriceClient(env.BIRDEYE_API_KEY):undefined,
    coinmarketcap:new CoinMarketCapPriceClient({apiKey:env.COINMARKETCAP_API_KEY,allowPublicEndpoint:env.CMC_ALLOW_PUBLIC==="true"}),
  };
}

export const explorerLinks={ solscan, suiscan };
export { processCurrencyRates };
export type { PriceObservation };
