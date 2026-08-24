import type { TokenSymbol } from "@/data/tokens";
export type PriceQuote={symbol:TokenSymbol;priceUsd:number;change24h:number;updatedAt:string;source:"pyth"|"birdeye"|"fallback"};
const fallback:Record<TokenSymbol,number>={PWRC:0.42,wPWRC:0.42,CRT:18.6,SOL:168.24,SUI:3.81,USDC:1};
export async function getPrice(symbol:TokenSymbol):Promise<PriceQuote>{return{symbol,priceUsd:fallback[symbol],change24h:symbol==="USDC"?0:symbol==="PWRC"?4.8:-1.2,updatedAt:new Date().toISOString(),source:"fallback"};}
export async function getPrices(symbols:TokenSymbol[]){return Promise.all(symbols.map(getPrice));}
