import type { ExchangeListing, ExchangeMarket, SettlementState } from "@/types/exchange";

export type ParticipantKind =
  | "consumer"
  | "prosumer"
  | "provider"
  | "enterprise"
  | "utility"
  | "community"
  | "aggregator"
  | "partner";

export type MarketplaceEventName =
  | "marketplace.listing.created"
  | "marketplace.listing.updated"
  | "marketplace.listing.expired"
  | "marketplace.order.created"
  | "marketplace.order.matched"
  | "marketplace.order.completed"
  | "marketplace.order.cancelled"
  | "marketplace.trade.executed"
  | "marketplace.payment.completed"
  | "marketplace.settlement.completed"
  | "marketplace.contract.executed"
  | "certificate.issued"
  | "carbon.credit.transferred"
  | "community.energy.shared"
  | "battery.rental.started"
  | "charging.session.completed";

export interface MarketplaceParticipant {
  id: string;
  organizationId: string;
  name: string;
  kinds: ParticipantKind[];
  verified: boolean;
  reputation: number;
  region: string;
}

export interface GridValidationResult {
  approved: boolean;
  zone: string;
  availableCapacityKw: number;
  requestedCapacityKw: number;
  congestionPercent: number;
  estimatedLossPercent: number;
  alternatives: string[];
}

export interface MarketplaceMatch {
  listing: ExchangeListing;
  score: number;
  distanceKm: number;
  deliveryConfidence: number;
  grid: GridValidationResult;
  reasons: string[];
}

export interface MarketplaceOrder {
  id: string;
  listingId: string;
  buyerOrganizationId: string;
  sellerOrganizationId: string;
  market: ExchangeMarket;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  state: SettlementState;
  createdAt: string;
  gridValidation?: GridValidationResult;
}

export interface MarketplaceDomainEvent<T = Record<string, unknown>> {
  id: string;
  name: MarketplaceEventName;
  aggregateId: string;
  tenantId: string;
  occurredAt: string;
  version: number;
  payload: T;
  metadata: {
    correlationId: string;
    actorId?: string;
    source: "api" | "iot" | "grid" | "ai" | "settlement";
  };
}
