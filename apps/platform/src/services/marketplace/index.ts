import { exchangeListings, exchangeTrades, orderBook } from "@/data/exchange";
import { clearingPrice, marketLiquidity } from "@/lib/exchange";
import { rankMarketplaceListings } from "@/lib/marketplace";
import type { ExchangeMarket } from "@/types/exchange";

export function getMarketplaceDashboard() {
  const liquidity = marketLiquidity(orderBook);
  return {
    marketVolumeUsd: 12_800_000,
    activeListings: exchangeListings.length,
    activeOrders: orderBook.reduce((sum, level) => sum + level.orders, 0),
    availableEnergyKwh: exchangeListings
      .filter((listing) => listing.market === "energy")
      .reduce((sum, listing) => sum + listing.quantity, 0),
    clearingPrice: clearingPrice(orderBook),
    liquidity,
    carbonSavedTons: 42_680,
    settlementSuccessPercent: 99.3,
    recentTrades: exchangeTrades,
  };
}

export function getMarketplaceRecommendations(input: { market?: ExchangeMarket; region?: string; maxDistanceKm?: number }) {
  return rankMarketplaceListings(exchangeListings, {
    market: input.market,
    preferredRegion: input.region,
    maxDistanceKm: input.maxDistanceKm,
  });
}
