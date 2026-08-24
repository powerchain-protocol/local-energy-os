import { getPythLatestPrice } from "@/clients/pyth-price";
import { getBirdeyePrice } from "@/clients/birdeye";
import { getCoinMarketCapQuotes } from "@/clients/coinmarketcap";
import { getFiatRates } from "@/clients/fx";
import { digitalEnergyError, digitalEnergyResponse, enforceDigitalEnergyRateLimit, getDigitalEnergyContext } from "@/lib/digital-energy/server";

function csv(value:string|null,fallback:string[]){return value?.split(",").map(item=>item.trim().toUpperCase()).filter(Boolean).slice(0,12)??fallback}

export async function GET(request:Request){
  const context=await getDigitalEnergyContext(request);
  try{
    enforceDigitalEnergyRateLimit(request,context);
    const url=new URL(request.url);
    const feedId=url.searchParams.get("pythFeedId")??process.env.PYTH_PRICE_FEED_ID;
    const birdeyeAddress=url.searchParams.get("birdeyeAddress")??process.env.NEXT_PUBLIC_PWRC_MINT??"";
    const symbols=csv(url.searchParams.get("symbols"),["SOL","SUI","USDC"]);
    const fxBase=(url.searchParams.get("fxBase")??"EUR").trim().toUpperCase().slice(0,3);
    const fxSymbols=csv(url.searchParams.get("fxSymbols"),["USD","GBP","SEK","NOK","DKK","CHF"]);
    const [pyth,birdeye,coinmarketcap,fx]=await Promise.all([
      getPythLatestPrice(feedId),
      birdeyeAddress?getBirdeyePrice(birdeyeAddress).then(data=>({provider:"birdeye",state:data?"available":"unavailable",observedAt:new Date().toISOString(),address:birdeyeAddress,data})).catch(()=>({provider:"birdeye",state:"unavailable",observedAt:new Date().toISOString(),address:birdeyeAddress,data:null})):Promise.resolve({provider:"birdeye",state:"unconfigured",observedAt:new Date().toISOString(),address:null,data:null}),
      getCoinMarketCapQuotes(symbols),
      getFiatRates(fxBase,fxSymbols),
    ]);
    return digitalEnergyResponse({pyth,birdeye,coinmarketcap,fx},context);
  }catch(error){return digitalEnergyError(error,context)}
}
