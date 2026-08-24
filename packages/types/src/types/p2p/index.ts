export type EnergySource = "solar" | "wind" | "hydro" | "battery" | "mixed";
export type ListingMode = "buy" | "sell" | "rent";
export type ListingStatus = "active" | "matched" | "paused" | "completed";
export type P2POrderStatus =
  | "review_required"
  | "reserved"
  | "delivering"
  | "delivered"
  | "reconciled"
  | "settlement_ready"
  | "settled"
  | "cancelled"
  | "disputed";

export interface LocalEnergyListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  mode: ListingMode;
  source: EnergySource;
  title: string;
  location: string;
  region: string;
  coordinates: { latitude: number; longitude: number };
  distanceKm: number;
  quantityKwh: number;
  availableKwh: number;
  minimumKwh: number;
  pricePerKwh: number;
  currency: "EUR" | "USD";
  deliveryStart: string;
  deliveryEnd: string;
  renewablePercent: number;
  verified: boolean;
  meterVerified: boolean;
  settlementAsset: "USDC" | "PWRC" | "FIAT";
  status: ListingStatus;
  rental?: {
    assetType: "battery" | "solar-share" | "ev-charger";
    billingPeriod: "hour" | "day" | "month";
    deposit: number;
    slotsAvailable: number;
  };
}

export interface P2POrderInput {
  listingId: string;
  buyerId: string;
  quantityKwh: number;
  walletAddress?: string;
}

export interface P2PMatch {
  listing: LocalEnergyListing;
  score: number;
  estimatedSavings: number;
  estimatedCarbonKg: number;
  deliveryConfidence: number;
}

export interface P2POrder {
  id: string;
  listingId: string;
  buyerId: string;
  quantityKwh: number;
  deliveredKwh?: number;
  varianceKwh?: number;
  currency: "EUR" | "USD";
  settlementAsset: "USDC" | "PWRC" | "FIAT";
  status: P2POrderStatus;
  pricing: { subtotal: number; networkFee: number; escrowReserve: number; total: number };
  meterReadingId?: string;
  signature?: string;
  settlementReference?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface EnergyCommunitySummary {
  members: number | null;
  producers: number | null;
  consumers: number | null;
  batteries: number | null;
  localSupplyKwh: number | null;
  localDemandKwh: number | null;
  matchedPercent: number | null;
  averagePrice: number | null;
  carbonAvoidedKg: number | null;
  dataState?: "DEMO" | "LIVE" | "UNAVAILABLE";
  source?: string;
}
