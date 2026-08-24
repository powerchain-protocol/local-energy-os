import "server-only";
import { PythAdapter } from "@powerchain/integration/web3/pyth";
import { getPythLatestPrice } from "@/clients/pyth-price";
import { getBirdeyePrice } from "@/clients/birdeye";
import { getCoinMarketCapQuotes } from "@/clients/coinmarketcap";
import { getFiatRates } from "@/clients/fx";

export async function getDigitalEnergyProviderState() {
  const pyth = await new PythAdapter(process.env.PYTH_HERMES_URL).health();
  const pythPrice = await getPythLatestPrice(process.env.PYTH_PRICE_FEED_ID);
  const pwrcMint = process.env.NEXT_PUBLIC_PWRC_MINT ?? "";
  const birdeye = pwrcMint ? await getBirdeyePrice(pwrcMint).catch(() => null) : null;
  const cmc = await getCoinMarketCapQuotes(["SOL", "SUI", "USDC"]);
  const fx = await getFiatRates("EUR", ["USD", "GBP", "SEK", "NOK", "DKK", "CHF"]);
  return {
    marketData: {
      pyth: { provider: "pyth", state: pythPrice.state === "available" ? "available" : pyth.state === "misconfigured" ? "unconfigured" : pythPrice.state, observedAt: pythPrice.observedAt ?? pyth.checkedAt, data: pythPrice.data, feedId: pythPrice.feedId },
      birdeye: { provider: "birdeye", state: process.env.BIRDEYE_API_KEY ? (birdeye ? "available" : "unavailable") : "unconfigured", observedAt: new Date().toISOString(), data: birdeye },
      coinmarketcap: cmc,
      fx,
    },
    explorers: {
      solscan: { state: "configured", baseUrl: process.env.SOLSCAN_BASE_URL ?? "https://solscan.io" },
      suiscan: { state: "configured", baseUrl: process.env.SUISCAN_BASE_URL ?? "https://suiscan.xyz/mainnet" },
    },
  };
}
