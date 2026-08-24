import type { ExchangeListing, ExchangeMarket } from "@/types/exchange";
import type { GridValidationResult, MarketplaceMatch } from "@/types/marketplace";

export function validateGridDelivery(input: {
  requestedCapacityKw: number;
  availableCapacityKw: number;
  congestionPercent: number;
  zone: string;
}): GridValidationResult {
  const approved = input.requestedCapacityKw <= input.availableCapacityKw && input.congestionPercent < 85;
  return {
    approved,
    zone: input.zone,
    requestedCapacityKw: input.requestedCapacityKw,
    availableCapacityKw: input.availableCapacityKw,
    congestionPercent: input.congestionPercent,
    estimatedLossPercent: Number(Math.min(12, 1.4 + input.congestionPercent * 0.045).toFixed(2)),
    alternatives: approved ? [] : ["Shift delivery window", "Select a closer seller", "Reduce requested capacity"],
  };
}

export function rankMarketplaceListings(
  listings: ExchangeListing[],
  input: { market?: ExchangeMarket; maxDistanceKm?: number; preferredRegion?: string },
): MarketplaceMatch[] {
  return listings
    .filter((listing) => !input.market || listing.market === input.market)
    .map((listing, index) => {
      const distanceKm = Math.max(2, 8 + index * 17);
      const grid = validateGridDelivery({
        requestedCapacityKw: Math.max(1, listing.quantity / 4),
        availableCapacityKw: 900 - index * 45,
        congestionPercent: 24 + index * 8,
        zone: listing.region,
      });
      const regionalBoost = input.preferredRegion && listing.region.includes(input.preferredRegion) ? 12 : 0;
      const score = Math.max(
        0,
        Math.min(100, Math.round(82 + regionalBoost + (listing.verified ? 7 : 0) - distanceKm * 0.35 - (grid.approved ? 0 : 18))),
      );
      return {
        listing,
        score,
        distanceKm,
        deliveryConfidence: Math.max(55, 97 - index * 5),
        grid,
        reasons: [
          listing.verified ? "Verified market participant" : "Participant verification pending",
          grid.approved ? "Grid capacity validated" : "Alternative delivery required",
          listing.carbonIntensity !== undefined ? "Carbon-intensity data available" : "Standard emissions estimate",
        ],
      };
    })
    .filter((match) => !input.maxDistanceKm || match.distanceKm <= input.maxDistanceKm)
    .sort((a, b) => b.score - a.score);
}

export function calculateSettlement(input: { quantity: number; unitPrice: number; networkFeeRate?: number; escrowRate?: number }) {
  const subtotal = input.quantity * input.unitPrice;
  const networkFee = subtotal * (input.networkFeeRate ?? 0.0075);
  const escrowReserve = subtotal * (input.escrowRate ?? 0.02);
  return {
    subtotal: Number(subtotal.toFixed(4)),
    networkFee: Number(networkFee.toFixed(4)),
    escrowReserve: Number(escrowReserve.toFixed(4)),
    total: Number((subtotal + networkFee + escrowReserve).toFixed(4)),
  };
}
